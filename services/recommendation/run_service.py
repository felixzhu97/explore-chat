import uvicorn

import config as cfg


def main() -> int:
    uvicorn.run("main:app", host=cfg.HOST, port=cfg.PORT, reload=False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
