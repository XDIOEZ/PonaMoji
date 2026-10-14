---
license: apache-2.0
base_model: Helsinki-NLP/opus-mt-en-mul
language:
- en
- tok
tags:
- translation
- tok
- tatoeba
datasets:
- tatoeba
library_name: transformers
pipeline_tag: translation
---

# English &rarr; toki pona (opus-mt finetune)

Translates English into toki pona. Finetuned by
[Linguardia](https://linguardia.com) from `Helsinki-NLP/opus-mt-en-mul` on the
English&harr;toki pona sentence pairs in [Tatoeba](https://tatoeba.org).

Built to generate course material for a language that no major machine
translator supports.

## Usage

```python
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

tok = AutoTokenizer.from_pretrained("linguardia/opus-mt-en-tok")
model = AutoModelForSeq2SeqLM.from_pretrained("linguardia/opus-mt-en-tok")

batch = tok([">>tok<< I wake up early."], return_tensors="pt")
out = model.generate(**batch, num_beams=4, max_length=64)
print(tok.batch_decode(out, skip_special_tokens=True))
```

The target language is selected by the `>>tok<<` prefix on the source
text. It was added as a **new** token rather than replacing one of the base
model's existing languages, so every language the base already handled still
works.

## Training

| | |
|---|---|
| base | `Helsinki-NLP/opus-mt-en-mul` (77M params) |
| training pairs | 45,036 |
| held out | 1,000 dev, 49 gold |
| epochs | 3.0 |
| batch size | 32 |
| optimiser | Adafactor, lr 5e-5, 500 warmup steps |
| max sequence | 48 tokens (99.9% of source, 99.6% of target) |
| hardware | Apple M4, MPS |

## Evaluation

### Held-out Tatoeba

1,000 pairs held out of training, plus 49 "gold" pairs whose English side
appears verbatim in the target course corpus (so the reference is a human
translation of exactly the sentence being asked for).

| set | n | BLEU | chrF |
|---|---|---|---|
| dev (unseen) | 1,000 | 52.9 | 65.8 |
| gold | 49 | 67.2 | 76.1 |

### Against a hand-written translation

The same 2,000-sentence course corpus was previously translated by hand, with a
documented table of consistency decisions, and validated at 2000/2000 by a
closed-vocabulary checker. That set is the control here.

| | this model | hand-written |
|---|---|---|
| sentences produced | 2,000 | 2,000 |
| empty | 0 | 0 |
| distinct translations | 1,990 (99.5%) | 1,997 (99.9%) |
| distinct words used | 136 | 124 |
| words per sentence | 9.0 | 10.1 |
| checker problems | 7 | 0 |
| duplicate groups | 10 | 3 |

The checker enforces toki pona's closed vocabulary and a few grammatical rules.
The model's 7 problems: 5 uses of `pi` followed by fewer than two words, 10
stray capitals, and 2 words outside the accepted list (`majuna`, `powe`, both
real community words outside *pu*).

Duplicates are the interesting failure. Toki pona marks no tense, so *"Do you
wake up early?"* and *"Did you wake up early?"* collapse to one string. Some of
the model's duplicate groups are that unavoidable collapse; others lose a
future marker (`tenpo kama`) the hand translation kept.

### What it got right

The machine-translated set this replaces failed on the first three rows, and
those are worth checking directly:

| English | earlier MT | this model |
|---|---|---|
| I wake up early. | `mi kama sona open.` (`kama sona` = *to learn*) | `mi pini lape lon tenpo lili.` |
| He wakes up at six. | `ona li kama sona lon tenpo luka.` (5) | `ona li pini lape lon tenpo suno nanpa luka wan.` (5+1) |
| She wakes up at seven. | byte-identical to the line above | `ona li pini lape lon tenpo luka tu.` (5+2) |

`pini lape` ("finish sleeping") for *wake up* was learned from the corpus, and
independently matches what the human translator chose.


## Training data and attribution

Sentence pairs come from **Tatoeba**, released under
[CC-BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/), with some
sentences under CC0 1.0. Tatoeba's sentences are written by volunteers, and
this model is a derivative of their work: if you use it, credit Tatoeba and
its contributors.

Pairs were deduplicated on exact (English, toki pona) text. No machine
translation was used to create the training data at any point.

## Licence chain

| layer | licence |
|---|---|
| base model `Helsinki-NLP/opus-mt-en-mul` | Apache-2.0 |
| training data (Tatoeba) | CC-BY 2.0 FR / CC0 1.0 |
| these weights | Apache-2.0, with the attribution above |

## Limitations

- Trained on Tatoeba, which is short everyday sentences. Expect it to be
  weakest on long, technical or literary text.
- Neural MT translates each sentence independently, so a term may be rendered
  differently across a corpus. Check consistency if that matters to you.
- Output should be reviewed by a speaker before being taught to learners.
