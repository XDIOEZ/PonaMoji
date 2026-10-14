"""Two local Marian NMT models plus a same-origin web UI. No translation API."""
from __future__ import annotations

import argparse
from collections import OrderedDict
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import logging
import mimetypes
import os
from pathlib import Path
import re
import threading
import time
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
WEB = ROOT / "web"
# Explicit offline mode prevents Hub lookups even if a local file is missing.
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HOME"] = str(ROOT / "runtime" / "hf-cache")
os.environ["TOKENIZERS_PARALLELISM"] = "false"
mimetypes.add_type("text/javascript", ".js")
LOG = logging.getLogger("ponamoji")
STATUS = {"application": "PonaMoji-local", "ready": False, "phase": "正在启动", "error": None, "device": "cpu", "pid": os.getpid(), "models": [
    {"id": "Helsinki-NLP/opus-mt-zh-en", "local_path": "models/zh-en"},
    {"id": "linguardia/opus-mt-en-tok", "local_path": "models/en-tok"},
]}
ENGINE = None
INFERENCE_LOCK = threading.Lock()


class LocalTranslator:
    def __init__(self, device: str, threads: int, int8: bool):
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

        self.torch = torch
        torch.set_num_threads(threads)
        if device == "cuda" and not torch.cuda.is_available():
            raise RuntimeError("当前环境未安装可用的 CUDA 版 PyTorch，请使用 CPU 模式启动。")
        self.device = device
        self.pairs = []
        for index, record in enumerate(STATUS["models"]):
            STATUS["phase"] = f"正在加载第 {index + 1}/2 个模型"
            folder = ROOT / record["local_path"]
            tokenizer = AutoTokenizer.from_pretrained(folder, local_files_only=True, use_fast=False, trust_remote_code=False)
            model = AutoModelForSeq2SeqLM.from_pretrained(folder, local_files_only=True, trust_remote_code=False, attn_implementation="eager")
            model.eval()
            if device == "cpu" and int8:
                model = torch.ao.quantization.quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)
            else:
                model = model.to(device)
            self.pairs.append((tokenizer, model))
        dictionary = json.loads((WEB / "dictionary.json").read_text(encoding="utf-8-sig"))
        self.words = {entry["word"]: entry["emoji"] for entry in dictionary["entries"]}
        self.aliases = dictionary["aliases"]
        self.cache: OrderedDict[str, dict] = OrderedDict()
        STATUS["precision"] = "CPU INT8" if device == "cpu" and int8 else device.upper() + " FP32"

    def run_stage(self, text: str, index: int) -> str:
        tokenizer, model = self.pairs[index]
        prepared = ">>tok<< " + text if index == 1 else text
        encoded = tokenizer(prepared, return_tensors="pt", truncation=False)
        limit = min(int(getattr(model.config, "max_position_embeddings", 512)), 512)
        if encoded["input_ids"].shape[-1] > limit:
            raise ValueError("单句过长，超过模型输入长度。请按完整句子拆分，避免内容被截断。")
        if self.device != "cpu":
            encoded = {key: value.to(self.device) for key, value in encoded.items()}
        budget = min(256, limit - 1)
        with self.torch.inference_mode():
            output = model.generate(**encoded, num_beams=4, max_new_tokens=budget, do_sample=False)
        ids = output[0].tolist()
        eos = model.config.eos_token_id
        # Marian can force EOS at the budget; EOS alone does not prove completion.
        if ids[-1] != eos or len(ids) >= budget + 1:
            raise ValueError("模型输出达到长度上限，未能完整翻译。请缩短句子。")
        result = tokenizer.decode(ids, skip_special_tokens=True).strip()
        if not result:
            raise ValueError("模型未生成有效翻译，请更换表达。")
        return result

    def emoji_text(self, tp: str) -> tuple[str, list[str], list[str]]:
        unknown, notes = [], []

        def replace(match: re.Match) -> str:
            raw = match.group(0)
            key = raw.lower()
            normalized = self.aliases.get(key, key)
            if normalized in self.words:
                if normalized != key:
                    note = f"沿用原词典约定：{key} → {normalized}，可能丢失现代用法的区别。"
                    if note not in notes:
                        notes.append(note)
                return self.words[normalized]
            if raw not in unknown:
                unknown.append(raw)
            return "⟦" + raw + "⟧"

        # Whitelist every non-separator token, including names and numbers.
        result = re.sub(r"[^\s.,!?;:，。！？；：()（）\[\]{}“”\"'「」《》]+", replace, tp)
        roots = tp.lower().split()
        for index, root in enumerate(roots):
            if root == "pi":
                tail = []
                for item in roots[index + 1:]:
                    if item in {"li", "e", "la", "o", "en", "pi"} or re.search(r"[.,!?;:]", item):
                        if item.rstrip(".,!?;:") in self.words:
                            tail.append(item)
                        break
                    tail.append(item)
                if len(tail) < 2:
                    notes.append("模型输出中的 pi 分组可能不合语法，请查看 Toki Pona 中间结果。")
        return result, unknown, notes

    def translate(self, text: str) -> dict:
        if text in self.cache:
            self.cache.move_to_end(text)
            return {**self.cache[text], "cached": True, "elapsed_ms": 0}
        started = time.perf_counter()
        parts = re.findall(r"[^。！？!?；;\n]+[。！？!?；;]?|\n", text)
        count = sum(bool(part.strip()) for part in parts)
        if count > 24:
            raise ValueError("一次最多处理 24 个句子，请分批翻译。")
        tp_parts, english_parts, output_parts, unknown, notes, sentences = [], [], [], [], [], []
        for part in parts:
            if not part.strip():
                if part == "\n":
                    tp_parts.append("\n"); english_parts.append("\n"); output_parts.append("\n")
                continue
            source = part.strip()
            english = self.run_stage(source, 0)
            tp = self.run_stage(english, 1)
            emoji, missing, warnings = self.emoji_text(tp)
            tp_parts.append(tp); english_parts.append(english); output_parts.append(emoji)
            unknown.extend(missing); notes.extend(warnings)
            sentences.append({"source": source, "english": english, "tp": tp, "emoji": emoji})
        if not sentences:
            raise ValueError("请输入中文句子。")

        def combine(items: list[str]) -> str:
            return " ".join(items).replace(" \n ", "\n").replace("\n ", "\n").replace(" \n", "\n").strip()

        result = {"result": combine(output_parts), "tp": combine(tp_parts), "english": combine(english_parts), "unknown": list(dict.fromkeys(unknown)), "notes": list(dict.fromkeys(notes + ["中文经过英文中转，可能丢失细节；模型结果仍可能有语义或语法错误。"])), "elapsed_ms": round((time.perf_counter() - started) * 1000), "sentences": sentences, "cached": False}
        self.cache[text] = result
        if len(self.cache) > 128:
            self.cache.popitem(last=False)
        return result


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        # Do not log visitor inputs or request query strings.
        LOG.info("HTTP %s", args[1] if len(args) > 1 else "request")

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def json_response(self, code: int, value: dict) -> None:
        payload = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self) -> None:
        if urlsplit(self.path).path == "/api/status":
            self.json_response(200, {**STATUS, "models": [{**record} for record in STATUS["models"]]})
        elif urlsplit(self.path).path.startswith("/api/"):
            self.json_response(404, {"detail": "没有这个接口。"})
        else:
            super().do_GET()

    def do_POST(self) -> None:
        if urlsplit(self.path).path != "/api/translate":
            self.json_response(404, {"detail": "没有这个接口。"}); return
        origin = self.headers.get("Origin")
        if origin and urlsplit(origin).netloc != self.headers.get("Host"):
            self.json_response(403, {"detail": "仅接受当前网页的同源请求。"}); return
        if self.headers.get_content_type() != "application/json":
            self.json_response(415, {"detail": "请发送 JSON 请求。"}); return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 65536:
                raise ValueError("请求长度无效。")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            text = payload.get("text") if isinstance(payload, dict) else None
            if not isinstance(text, str) or not text.strip():
                raise ValueError("请输入待翻译的中文。")
            text = text.strip()
            if len(text) > 3000:
                raise ValueError("一次最多输入 3000 个字符。")
        except (ValueError, UnicodeError) as error:
            self.json_response(400, {"detail": str(error)}); return
        if not STATUS["ready"] or ENGINE is None:
            self.json_response(503, {"detail": STATUS["error"] or STATUS["phase"]}); return
        if not INFERENCE_LOCK.acquire(blocking=False):
            self.json_response(429, {"detail": "模型正在处理上一条请求，请稍后再试。"}); return
        try:
            self.json_response(200, ENGINE.translate(text))
        except ValueError as error:
            self.json_response(422, {"detail": str(error)})
        except (BrokenPipeError, ConnectionResetError):
            pass  # Browser cancelled; never queue another inference implicitly.
        except Exception:
            LOG.exception("Local inference failed")
            self.json_response(500, {"detail": "本地模型处理失败，请查看 runtime/server-error.log。"})
        finally:
            INFERENCE_LOCK.release()


def load_engine(args) -> None:
    global ENGINE
    try:
        ENGINE = LocalTranslator(args.device, args.threads, not args.fp32)
        STATUS.update(ready=True, phase="两个本地模型已就绪", device=args.device)
        LOG.info("Both local models ready (%s)", STATUS["precision"])
    except Exception as error:
        STATUS.update(ready=False, phase="模型加载失败", error=str(error))
        LOG.exception("Model loading failed")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=18713)
    parser.add_argument("--device", choices=["cpu", "cuda"], default="cpu")
    parser.add_argument("--threads", type=int, default=min(4, os.cpu_count() or 1))
    parser.add_argument("--fp32", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.threads <= 32:
        parser.error("threads must be between 1 and 32")
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    server.daemon_threads = True
    threading.Thread(target=load_engine, args=(args,), daemon=True).start()
    LOG.info("Local UI: http://%s:%s", args.host, args.port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
