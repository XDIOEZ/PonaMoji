"""Download pinned public weights into this project; no login or API key."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent
MODELS = [
    {"id": "Helsinki-NLP/opus-mt-zh-en", "folder": "zh-en", "revision": "cf109095479db38d6df799875e34039d4938aaa6", "weight": "pytorch_model.bin"},
    {"id": "linguardia/opus-mt-en-tok", "folder": "en-tok", "revision": "41a07eac48de7d61ded6a8b4c026155e59268720", "weight": "model.safetensors"},
]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while block := stream.read(4 * 1024 * 1024):
            digest.update(block)
    return digest.hexdigest()


def download(url: str, target: Path, expected_size: int, expected_hash: str | None) -> None:
    if target.exists() and target.stat().st_size == expected_size:
        if not expected_hash or sha256(target) == expected_hash:
            print(f"Already downloaded: {target.name}", flush=True)
            return
    partial = target.with_name(target.name + ".part")
    last_error: Exception | None = None
    for attempt in range(4):
        offset = partial.stat().st_size if partial.exists() else 0
        if offset > expected_size:
            partial.unlink()
            offset = 0
        request = urllib.request.Request(url, headers={"User-Agent": "PonaMoji-local/1.0", **({"Range": f"bytes={offset}-"} if offset else {})})
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                if response.status != 206:
                    offset = 0
                written = offset
                last_report = time.monotonic()
                with partial.open("ab" if offset else "wb") as stream:
                    while block := response.read(1024 * 1024):
                        stream.write(block)
                        written += len(block)
                        if time.monotonic() - last_report >= 8:
                            print(f"{target.name}: {written / 1e6:.1f} / {expected_size / 1e6:.1f} MB", flush=True)
                            last_report = time.monotonic()
            if partial.stat().st_size != expected_size:
                raise RuntimeError(f"Incomplete file: {target.name}")
            if expected_hash and sha256(partial) != expected_hash:
                partial.unlink()
                raise RuntimeError(f"Checksum mismatch: {target.name}")
            partial.replace(target)
            print(f"Downloaded: {target.name} ({expected_size / 1e6:.2f} MB)", flush=True)
            return
        except Exception as error:
            last_error = error
            print(f"Download retry {attempt + 1}/4: {target.name}: {error}", flush=True)
            if attempt < 3:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"Could not download {target.name}: {last_error}")


def main() -> None:
    records = []
    for model in MODELS:
        url = f"https://huggingface.co/api/models/{model['id']}/revision/{model['revision']}?blobs=true"
        with urllib.request.urlopen(url, timeout=30) as response:
            metadata = json.load(response)
        if metadata["sha"] != model["revision"]:
            raise RuntimeError("Model revision does not match the pinned version")
        folder = ROOT / "models" / model["folder"]
        folder.mkdir(parents=True, exist_ok=True)
        files = []
        print(f"\nDownloading {model['id']}", flush=True)
        for entry in metadata["siblings"]:
            filename = entry["rfilename"]
            if "/" in filename or not (filename in {"README.md", "LICENSE", "LICENSE.txt", "LICENSE.md", "NOTICE", "NOTICE.txt", model["weight"]} or filename.endswith((".json", ".spm"))):
                continue
            expected_hash = entry.get("lfs", {}).get("sha256")
            url = f"https://huggingface.co/{model['id']}/resolve/{model['revision']}/{urllib.parse.quote(filename)}?download=true"
            download(url, folder / filename, entry["size"], expected_hash)
            files.append({"name": filename, "bytes": entry["size"], "sha256": sha256(folder / filename)})
        records.append({**model, "files": files})
    (ROOT / "models" / "manifest.json").write_text(json.dumps({"models": records}, ensure_ascii=False, indent=2), encoding="utf-8")
    print("\nBoth models are saved locally. No remote requests are needed for inference.", flush=True)


if __name__ == "__main__":
    main()
