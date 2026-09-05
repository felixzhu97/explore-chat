# Machine learning helpers

Optional Python FastAPI services used by the Spring API over loopback:

| Service | Port | Role |
| --- | --- | --- |
| `recommendation` | 8000 | Feed / Explore / Reels rank & recall |
| `vision` | 8001 | Image labels & moderation |
| `rag` | 8002 | Document / post RAG Q&A |
| `media-gen` | 3456 | Image, video, voice generation |

Layout and AIP REST rules: [`docs/developer/python-services.md`](../../docs/developer/python-services.md).
