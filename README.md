# PonaMoji 本地双模型版

中文 → 英文 → Toki Pona → 原 120 词根 Emoji 字典。

模型和依赖安装在本目录的独立环境。网页通过同源请求调用本机 Python 服务。安装时联网下载，启动及翻译使用离线模式，不调用 Hugging Face 推理接口、GPT、LLM 或远程翻译 API，不需要密钥，没有翻译 API Token 费用。

模型文件及配置合计约 626.5MB（另有独立 Python 依赖）。此前本机试用中，「今天的天气真好。」的结果为英文 `It's a nice day.`、Toki Pona `ona li tenpo suno pona.`，已经简化了原句含义，不能据此认定翻译准确。完整翻译质量、其他电脑首次安装和手机实机体验需使用者自行评估。

![本地翻译器界面](本地运行.png)

GitHub 存放源代码。本版本需要 Python 模型服务，不能仅通过 GitHub Pages 运行；上传仓库本身不会发布翻译网站。

## 首次安装（Windows）

需要 64 位 **Python 3.12**、Git、足够的磁盘空间，以及首次访问 PyPI、PyTorch CPU 下载源和 Hugging Face 的网络。模型权重、分词文件、`.venv` 与运行日志不进入 Git 仓库；原模型说明和 SHA256 清单随代码保存。

在 PowerShell 中执行：

```powershell
git clone https://github.com/XDIOEZ/PonaMoji.git
cd PonaMoji
powershell -NoProfile -ExecutionPolicy Bypass -File .\Install-Local.ps1
```

安装脚本优先通过 `py -3.12` 查找 Python，再尝试 `python`；也可指定路径：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Install-Local.ps1 -PythonExe "C:\Python312\python.exe"
```

所有 Python 依赖安装到项目的 `.venv`，不修改系统 Python 环境。

## 使用

1. 双击 `启动PonaMoji.vbs`。启动过程中隐藏后台窗口，模型就绪后打开网页。
2. 浏览器访问 http://127.0.0.1:18713 。中文默认选择「本地模型」，输入后点击「翻译」，也可 Ctrl/⌘+Enter。
3. 展开中间结果查看英文与 Toki Pona，判断两阶段翻译是否丢失含义。
4. 不使用时双击 `停止PonaMoji.vbs`。关闭网页本身不会停止后台服务。

本版本默认 CPU INT8、4 个计算线程，未安装 CUDA 依赖，因此当前不会使用 RTX 显卡。磁盘保存的是原始权重，启动时在内存中量化，不影响原文件。运行中缓存最近 128 条完整翻译结果，不保存到磁盘；重启后清空。

网页保留原方向：Toki Pona ↔ Emoji 为词根转写，Emoji → 中文仍是原规则近似释义；只有中文 → Emoji 使用两个模型，没有偷偷增加第三个模型。模型加载失败或翻译失败时会显示错误，需自行切换规则模式，不会静默用规则替代模型结果。

## 模型

| 阶段 | 模型 | 固定版本 | 许可 |
| --- | --- | --- | --- |
| 中→英 | [Helsinki-NLP/opus-mt-zh-en](https://huggingface.co/Helsinki-NLP/opus-mt-zh-en)，赫尔辛基大学 Language Technology Research Group | cf109095479db38d6df799875e34039d4938aaa6 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 英→TP | [linguardia/opus-mt-en-tok](https://huggingface.co/linguardia/opus-mt-en-tok)，[Linguardia](https://linguardia.com) | 41a07eac48de7d61ded6a8b4c026155e59268720 | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)；语料按作者要求归功于 Tatoeba 及其贡献者 |

原始权重分别约 312MB 和 308MB，配置、分词数据、各模型原始说明一起保存在 `models/`。逐文件尺寸及 SHA256 记录在 `models/manifest.json`。首次安装需要联网下载，后续翻译不联网。

采用赫尔辛基大学 Language Technology Research Group 的 OPUS-MT 中英模型。英→TP 模型由 Linguardia 从 [Helsinki-NLP/opus-mt-en-mul](https://huggingface.co/Helsinki-NLP/opus-mt-en-mul)（Apache-2.0）微调，训练句对来自 **[Tatoeba 及其志愿贡献者](https://tatoeba.org/)**；模型卡标注语料为 CC BY 2.0 FR / 部分 CC0 1.0。感谢这些模型作者及语料贡献者。

Toki Pona 由 **[Sonja Lang](https://tokipona.org/)** 创作；Emoji 编码参考 **[Unicode Consortium 的 UTS #51](https://www.unicode.org/reports/tr51/)**。原 120 词根的 Emoji 映射来自用户提供的 PonaMoji v1.3，保持不变，不是 Unicode 官方指定的 Toki Pona 映射。

完整署名、许可、论文、语法参考和依赖来源见 **[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)**；论文和模型引用见 **[CITATIONS.bib](CITATIONS.bib)**。两份原始模型卡随仓库保留：[中→英](models/zh-en/README.md)、[英→Toki Pona](models/en-tok/README.md)。网页「关于」也提供模型与资料署名。

**项目许可：** 原上传 v1.3 未附作者姓名或明确许可，目前没有给整个项目声明统一开源许可证。公开可查看源码不代表所有代码和资源使用同一许可；第三方资源按各自原许可使用。

## 边界

两个小型专用神经翻译模型并非通用聊天大模型，但仍会丢失或误译信息；英文中转会累积误差。模型不保证使用全部且仅使用原 120 个词根，超出词典的词用 `⟦原词⟧` 提示，不做猜测替换。有限语法提示不能保证 TP 句子完全正确。

单次最多 3000 字符、24 个句子。单句超过模型位置长度时拒绝翻译，输出达到长度上限也会报错，避免无提示截断。建议使用短句。一次处理一个模型请求；前端取消等待后，已开始的推理会继续到结束，此时新请求会提示稍后重试。

## 重建与排错

已安装的电脑无需重复安装。若独立环境丢失，运行 `Install-Local.ps1`；可通过 `-PythonExe` 指定 Python 3.12。依赖版本固定在 `requirements.txt`，Transformers 5.15.0 与当前模型分词元数据匹配。模型下载支持继续已有 `.part` 文件，并检查文件尺寸及权重 SHA256。

- `runtime/server-error.log`：模型加载与服务错误。
- `runtime/launcher-error.log`：启动脚本错误。
- `runtime/server-state.json`：本轮后台进程标识。

默认只监听本机 `127.0.0.1`，安装脚本不修改显卡驱动、开机启动或防火墙。后续公网部署需另外运行模型服务，并根据访问量配置请求配额与并发方案。

## 文件

`server.py`：模型加载和本地 HTTP 服务。`web/`：复用后的前端。`Start-Local.ps1` / `Stop-Local.ps1`：启动和停止。`download_models.py`：固定版本下载。`Install-Local.ps1`：环境重建。
