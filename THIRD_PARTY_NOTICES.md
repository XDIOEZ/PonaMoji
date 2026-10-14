# 第三方来源、引用与署名

PonaMoji 本地版使用下列模型、软件及参考资料。感谢原作者、研究团队和社区贡献者。本文件描述各资源的来源和许可，不替代上游许可，也不为整个项目赋予统一许可证。来源核对日期：2026-10-14。

## 1. 中文 → 英文模型

- **模型：** [Helsinki-NLP/opus-mt-zh-en](https://huggingface.co/Helsinki-NLP/opus-mt-zh-en)。
- **开发者：** Language Technology Research Group at the University of Helsinki（赫尔辛基大学语言技术研究组，Helsinki-NLP）。
- **实际下载 revision：** `cf109095479db38d6df799875e34039d4938aaa6`；[固定版本模型卡](https://huggingface.co/Helsinki-NLP/opus-mt-zh-en/blob/cf109095479db38d6df799875e34039d4938aaa6/README.md)。
- **许可：** [Creative Commons Attribution 4.0 International（CC BY 4.0）](https://creativecommons.org/licenses/by/4.0/)。
- **本项目的使用方式：** 下载原权重进行离线推理；启动时在内存中进行 CPU INT8 量化，未微调或改写下载的权重。原模型卡见 [models/zh-en/README.md](models/zh-en/README.md)。

## 2. 英文 → Toki Pona 模型

- **模型：** [linguardia/opus-mt-en-tok](https://huggingface.co/linguardia/opus-mt-en-tok)。
- **微调作者：** [Linguardia](https://linguardia.com)。
- **实际下载 revision：** `41a07eac48de7d61ded6a8b4c026155e59268720`；[固定版本模型卡](https://huggingface.co/linguardia/opus-mt-en-tok/blob/41a07eac48de7d61ded6a8b4c026155e59268720/README.md)。
- **权重许可：** [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)，模型作者另要求署名 Tatoeba 及其贡献者。
- **基础模型：** [Helsinki-NLP/opus-mt-en-mul](https://huggingface.co/Helsinki-NLP/opus-mt-en-mul)，由 Helsinki-NLP 发布，许可为 Apache-2.0。它是微调来源，本项目没有单独安装第三个模型。
- **训练语料署名：** **感谢 Tatoeba 及其志愿贡献者（Tatoeba and its contributors）提供英文与 Toki Pona 句对。** 根据 Linguardia 模型卡，语料采用 [CC BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/)，部分句子为 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)。详见 [Tatoeba 使用条款](https://tatoeba.org/en/terms_of_use) 和 [模型训练数据说明](https://huggingface.co/linguardia/opus-mt-en-tok#training-data-and-attribution)。语料许可与模型权重许可分别标注，不能混为同一许可。
- **本项目的使用方式：** 使用 `>>tok<<` 目标语言前缀离线推理；运行时 CPU INT8 量化，没有重新训练。原模型卡见 [models/en-tok/README.md](models/en-tok/README.md)。

仓库不分发上述两个模型的权重或训练语料。`download_models.py` 从固定上游版本下载模型、原始 README，以及上游存在的 LICENSE/NOTICE 文件。实际下载文件大小与 SHA256 见 [models/manifest.json](models/manifest.json)。

## 3. OPUS-MT 研究引用

中英模型的模型卡要求引用 OPUS-MT 论文，OPUS-MT 项目也提供后续论文引用。可复制的 BibTeX 见 [CITATIONS.bib](CITATIONS.bib)。

- **Jörg Tiedemann and Santhosh Thottingal. 2020.** [OPUS-MT – Building open translation services for the World](https://aclanthology.org/2020.eamt-1.61/). *Proceedings of the 22nd Annual Conference of the European Association for Machine Translation*, pp. 479–480, Lisboa, Portugal. European Association for Machine Translation.
- **Jörg Tiedemann, Mikko Aulamo, Daria Bakshandaeva, Michele Boggia, Stig-Arne Grönroos, Tommi Nieminen, Alessandro Raganato, Yves Scherrer, Raúl Vázquez and Sami Virpioja. 2024.** [Democratizing neural machine translation with OPUS-MT](https://doi.org/10.1007/s10579-023-09704-w). *Language Resources and Evaluation*, 58, pp. 713–755（2023-12-13 在线发表，2024 年卷期）。参考来源：[OPUS-MT 官方引用说明](https://github.com/Helsinki-NLP/Opus-MT#citation)、[出版方正式引用](https://link.springer.com/article/10.1007/s10579-023-09704-w)。

## 4. 语言、词典、Emoji 与界面参考

| 来源 | 署名与使用范围 |
| --- | --- |
| 用户提供的 **PonaMoji v1.3** ZIP | 复用原 120 词根 Emoji 映射、词典及规则思路；原包未附作者姓名或明确许可。没有把该原包声明为本项目原创，也没有为继承部分擅自指定 MIT/Apache 许可。 |
| [Toki Pona 官方网站](https://tokipona.org/) | **Sonja Lang（jan Sonja）**，Toki Pona 语言创作者；作为语言背景和语法参考。创作者署名不代表其书籍全文获得开源授权。 |
| [lipu sona pona 课程](https://lipu-sona.pona.la/en/10/) | **jan Lentan（/dev/urandom）及课程贡献者**；参考其前置动词、时间与地点说明，用于句子释义。作者来源：[lipu pi jan Lentan](https://lipu-sona.pona.la/lentan/)。没有收录课程全文或站点代码。 |
| [UTS #51: Unicode Emoji](https://www.unicode.org/reports/tr51/) | **Unicode Consortium**；Emoji 变体选择符和序列处理的标准参考。页面显示 Unicode Emoji 文本，由用户系统字体呈现，没有打包第三方 Emoji 图片或字体。固定 Toki Pona→Emoji 映射来自原 PonaMoji 项目，而非 Unicode 官方。 |
| [Google Translate](https://translate.google.com/) / [DeepL](https://www.deepl.com/translator) | 按用户要求参考双栏翻译、方向切换等交互；前端由本项目实现，没有调用这两者的翻译 API，也没有收录其代码、商标图片或页面素材。 |

## 5. 直接运行依赖

Python 服务使用标准库与以下依赖；网页没有额外的 JavaScript 框架或 CDN 依赖。此仓库不分发 Python、`.venv` 或依赖二进制，安装时从上游获取。

| 软件 | 固定版本 | 署名 | 许可与上游 |
| --- | --- | --- | --- |
| PyTorch | `2.8.0+cpu` | PyTorch Team 及贡献者；版权声明以完整上游 LICENSE 为准 | [BSD-3-Clause 及包含的版权/许可说明](https://github.com/pytorch/pytorch/blob/v2.8.0/LICENSE) |
| Transformers | `5.15.0` | Hugging Face team 及贡献者 | [Apache-2.0](https://github.com/huggingface/transformers/blob/main/LICENSE) |
| SentencePiece | `0.2.2` | Google 及贡献者 | [Apache-2.0](https://github.com/google/sentencepiece/blob/master/LICENSE) |
| Sacremoses | `0.1.1` | Copyright © 2020 alvations | [MIT](https://github.com/alvations/sacremoses/blob/master/LICENSE) |
| Python | `3.12` | Python Software Foundation 及贡献者 | [PSF License Agreement 与历史许可](https://docs.python.org/3.12/license.html) |

安装后，上游软件的 LICENSE/NOTICE 与传递依赖许可保存在各自安装包中。本表列出项目直接依赖；将来若分发整套运行环境，需要随包保留全部直接与传递依赖的许可文件。

## 6. 项目许可状态

本仓库公开代码供查看和使用者评估，但当前未给整个 PonaMoji 项目声明统一开源许可证，原因是原上传 v1.3 缺少明确作者与许可信息。上述模型、论文、参考资料和软件各自保留原有署名与许可；列入引用不表示它们的作者为本项目背书。
