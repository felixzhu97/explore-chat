# Mandatory Watchlist — First Scan Sources

**Always scan these before other ad-hoc sources.** Prefer official blogs, product changelogs, **open-source research hubs**, and papers. Record dated facts with URLs.

## Platform & cloud AI (product / news)

| Org | What to check | Starting points |
|-----|---------------|-----------------|
| **Google** | Gemini, Cloud AI, Android AI | [blog.google](https://blog.google/), [cloud.google.com/blog](https://cloud.google.com/blog/), [ai.google.dev](https://ai.google.dev/) |
| **Apple** | Apple Intelligence, on-device ML, HIG/dev | [apple.com/newsroom](https://www.apple.com/newsroom/), [developer.apple.com/news](https://developer.apple.com/news/), [machinelearning.apple.com](https://machinelearning.apple.com/) |
| **Microsoft** | Azure OpenAI, Copilot, GitHub | [blogs.microsoft.com](https://blogs.microsoft.com/), [azure.microsoft.com/blog](https://azure.microsoft.com/blog/), [github.blog](https://github.blog/) |
| **NVIDIA** | GPUs, NIM, CUDA, enterprise AI | [blogs.nvidia.com](https://blogs.nvidia.com/), [developer.nvidia.com/blog](https://developer.nvidia.com/blog/) |
| **Meta** | Llama, PyTorch, open models | [ai.meta.com/blog](https://ai.meta.com/blog/), [pytorch.org/blog](https://pytorch.org/blog/) |
| **OpenAI** | Models, API, pricing, safety | [openai.com/blog](https://openai.com/blog), [platform.openai.com/docs](https://platform.openai.com/docs) |
| **DeepMind** | Research breakthroughs | [deepmind.google/discover/blog](https://deepmind.google/discover/blog/) |
| **Anthropic** | Claude, API, interpretability | [anthropic.com/news](https://www.anthropic.com/news), [docs.anthropic.com](https://docs.anthropic.com/) |
| **Vercel** | AI SDK, Next.js, DX | [vercel.com/blog](https://vercel.com/blog), [sdk.vercel.ai](https://sdk.vercel.ai/) |
| **Cursor** | IDE agent product, pricing | [cursor.com/changelog](https://cursor.com/changelog), [cursor.com/blog](https://cursor.com/blog) |
| **上海人工智能实验室** | Intern / AI4S / open research | [shlab.org.cn](https://www.shlab.org.cn/) |
| **阿里达摩院 / 通义** | Qwen, industry AI | [damo.alibaba.com](https://damo.alibaba.com/) · [qwen.ai](https://qwen.ai/) |

## Open-source & research hubs (required)

Scan **research pages + GitHub orgs** for new papers, code drops, model releases, and licenses (same ~30–90 day window).

| Org | Research / publications | Open-source / GitHub |
|-----|-------------------------|----------------------|
| **Google** | [research.google](https://research.google/) · [Publications](https://research.google/pubs/) | [github.com/google](https://github.com/google) · [github.com/google-research](https://github.com/google-research) · [JAX](https://github.com/jax-ml/jax) |
| **Apple** | [machinelearning.apple.com/research](https://machinelearning.apple.com/research) | [github.com/apple](https://github.com/apple) · [ml-* research repos](https://github.com/apple?q=ml-&type=repositories) · [coremltools](https://github.com/apple/coremltools) · [mlx](https://github.com/ml-explore/mlx) |
| **Microsoft** | [microsoft.com/research](https://www.microsoft.com/en-us/research/) · [Publications](https://www.microsoft.com/en-us/research/publications/) | [github.com/microsoft](https://github.com/microsoft) · [DeepSpeed](https://github.com/microsoft/DeepSpeed) · [AutoGen](https://github.com/microsoft/autogen) · [Semantic Kernel](https://github.com/microsoft/semantic-kernel) |
| **NVIDIA** | [research.nvidia.com](https://www.nvidia.com/en-us/research/) | [github.com/NVIDIA](https://github.com/NVIDIA) · [Megatron-LM](https://github.com/NVIDIA/Megatron-LM) · [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) · [NeMo](https://github.com/NVIDIA/NeMo) |
| **Meta** | [ai.meta.com/research](https://ai.meta.com/research/) · [FAIR publications](https://ai.meta.com/research/publications/) | [github.com/facebookresearch](https://github.com/facebookresearch) · [github.com/meta-llama](https://github.com/meta-llama) · [PyTorch](https://github.com/pytorch/pytorch) · [llama-models](https://github.com/meta-llama/llama-models) |
| **OpenAI** | [openai.com/research](https://openai.com/research) · [Index](https://openai.com/research/index/) | [github.com/openai](https://github.com/openai) · [openai-cookbook](https://github.com/openai/openai-cookbook) · [tiktoken](https://github.com/openai/tiktoken) · [gpt-oss](https://github.com/openai/gpt-oss) (when relevant) |
| **DeepMind** | [deepmind.google/research](https://deepmind.google/research/) · [Publications](https://deepmind.google/research/publications/) | [github.com/google-deepmind](https://github.com/google-deepmind) · [deepmind-research](https://github.com/google-deepmind/deepmind-research) · [gemma](https://github.com/google-deepmind/gemma) · [alphafold](https://github.com/google-deepmind/alphafold) |
| **Anthropic** | [anthropic.com/research](https://www.anthropic.com/research) | [github.com/anthropics](https://github.com/anthropics) · [anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python) · [courses](https://github.com/anthropics/courses) |
| **Vercel** | Product research via blog/docs (AI SDK) | [github.com/vercel](https://github.com/vercel) · [ai](https://github.com/vercel/ai) (AI SDK) · [next.js](https://github.com/vercel/next.js) |
| **Cursor** | Product/engineering via changelog & blog | [github.com/getcursor](https://github.com/getcursor) · [cursor.com/changelog](https://cursor.com/changelog) (primary); note limited public research repos |
| **上海人工智能实验室** | [shlab.org.cn](https://www.shlab.org.cn/) | [github.com/InternLM](https://github.com/InternLM) · [OpenGVLab](https://github.com/OpenGVLab) |
| **阿里达摩院 / 通义** | [damo.alibaba.com](https://damo.alibaba.com/) · [qwen.ai](https://qwen.ai/) | [github.com/QwenLM](https://github.com/QwenLM) |

## Open models

Core open-model hubs for commit/PR **References** (paper + HF + official release + GitHub). Covers local+prod text defaults (DeepSeek primary, Qwen secondary) plus strong open counterparts for scanning. Same ~30–90 day window as other orgs.

| Org | Research | HF | Blog / docs | GitHub |
|-----|----------|-----|-------------|--------|
| **Qwen** | [arXiv search: Qwen](https://arxiv.org/search/?query=Qwen&searchtype=all) · [Qwen3-ASR report](https://arxiv.org/abs/2601.21337) | [huggingface.co/Qwen](https://huggingface.co/Qwen) · [Qwen3-ASR collection](https://huggingface.co/collections/Qwen/qwen3-asr) | [qwen.ai](https://qwen.ai/) · [Qwen3-ASR blog](https://qwen.ai/blog?id=qwen3asr) | [github.com/QwenLM](https://github.com/QwenLM) · [Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR) |
| **DeepSeek** | [DeepSeek-V3](https://arxiv.org/abs/2412.19437) | [huggingface.co/deepseek-ai](https://huggingface.co/deepseek-ai) | [api-docs.deepseek.com](https://api-docs.deepseek.com/) | [github.com/deepseek-ai](https://github.com/deepseek-ai) |
| **智谱 GLM** | [arXiv search: GLM](https://arxiv.org/search/?query=GLM-4&searchtype=all) | [huggingface.co/THUDM](https://huggingface.co/THUDM) | [zhipuai.cn](https://www.zhipuai.cn/) | [github.com/THUDM](https://github.com/THUDM) |
| **Intern** | [arXiv search: InternLM](https://arxiv.org/search/?query=InternLM&searchtype=all) | [huggingface.co/internlm](https://huggingface.co/internlm) | [shlab.org.cn](https://www.shlab.org.cn/) | [github.com/InternLM](https://github.com/InternLM) |
| **Llama** | [arXiv search: Llama](https://arxiv.org/search/?query=Llama&searchtype=all) · [Llama 3 paper](https://arxiv.org/abs/2407.21783) | [huggingface.co/meta-llama](https://huggingface.co/meta-llama) | [ai.meta.com/llama](https://ai.meta.com/llama/) | [github.com/meta-llama](https://github.com/meta-llama) · [llama-models](https://github.com/meta-llama/llama-models) |
| **Gemma** | [arXiv search: Gemma](https://arxiv.org/search/?query=Gemma&searchtype=all) · [Gemma 2 report](https://arxiv.org/abs/2408.00118) | [huggingface.co/google](https://huggingface.co/google) · [Gemma models](https://huggingface.co/models?search=gemma) | [ai.google.dev/gemma](https://ai.google.dev/gemma) | [google-deepmind/gemma](https://github.com/google-deepmind/gemma) |
| **Mistral** | [arXiv search: Mistral](https://arxiv.org/search/?query=Mistral&searchtype=all) · [Mixtral paper](https://arxiv.org/abs/2401.04088) | [huggingface.co/mistralai](https://huggingface.co/mistralai) | [docs.mistral.ai](https://docs.mistral.ai/) | [github.com/mistralai](https://github.com/mistralai) |

## Open-source speech & image

local + prod speech/TTS/image defaults (open weights). Prefer self-host or OpenAI-compatible gateways; commercial hosted APIs are optional fallback only.

| Org / project | Research / docs | HF | GitHub |
|---------------|-----------------|-----|--------|
| **Qwen3-ASR** | [Technical Report](https://arxiv.org/abs/2601.21337) · [blog](https://qwen.ai/blog?id=qwen3asr) | [Qwen3-ASR collection](https://huggingface.co/collections/Qwen/qwen3-asr) | [QwenLM/Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR) |
| **FunASR** (ASR alt) | [ModelScope FunASR docs](https://github.com/modelscope/FunASR#readme) | [FunASR models](https://huggingface.co/models?search=funasr) | [modelscope/FunASR](https://github.com/modelscope/FunASR) |
| **CosyVoice** (TTS) | [CosyVoice README](https://github.com/FunAudioLLM/CosyVoice#readme) | [FunAudioLLM](https://huggingface.co/FunAudioLLM) | [FunAudioLLM/CosyVoice](https://github.com/FunAudioLLM/CosyVoice) |
| **FLUX** (image) | [FLUX release notes](https://github.com/black-forest-labs/flux#readme) | [black-forest-labs](https://huggingface.co/black-forest-labs) | [black-forest-labs/flux](https://github.com/black-forest-labs/flux) |
| **Whisper** (ASR) | [Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356) | [openai/whisper](https://huggingface.co/openai/whisper-large-v3) | [openai/whisper](https://github.com/openai/whisper) |
| **Stable Diffusion** (image alt) | [High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752) | [stabilityai](https://huggingface.co/stabilityai) | [Stability-AI/stablediffusion](https://github.com/Stability-AI/stablediffusion) |

## Open models & papers (required)

| Source | What to check | URL |
|--------|---------------|-----|
| **Hugging Face Trending** | Hot models / spaces / datasets | [Models trending](https://huggingface.co/models?sort=trending) · [API trending](https://huggingface.co/api/trending) |
| **arXiv** | New CS/AI papers (cs.AI, cs.LG, cs.CL, cs.SE) | [cs.AI](https://arxiv.org/list/cs.AI/recent) · [cs.LG](https://arxiv.org/list/cs.LG/recent) · [cs.CL](https://arxiv.org/list/cs.CL/recent) · [search](https://arxiv.org/search/) |

## Scan checklist (minimum)

1. **Each org — product/news**: one check in ~30–90 days (or `no material signal (checked)`).
2. **Each org — research/OSS**: glance research page **and** GitHub org activity (new repos, major releases, paper+code pairs).
3. **Hugging Face**: top trending themes (size, modality, license).
4. **arXiv**: 2–5 topic-relevant papers (id + title + link); prefer those with official code from the table above when available.

## Query tips

```
site:research.google OR site:deepmind.google [topic]
site:machinelearning.apple.com/research [topic]
site:microsoft.com/en-us/research [topic]
site:ai.meta.com/research [topic]
site:openai.com/research [topic]
site:anthropic.com/research [topic]
site:arxiv.org [topic]
org:google-deepmind OR org:facebookresearch OR org:NVIDIA [topic] (GitHub search)
Hugging Face trending [modality]
```
