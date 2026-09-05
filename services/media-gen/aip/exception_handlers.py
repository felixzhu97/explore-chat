"""FastAPI exception handlers that emit AIP-193 RpcStatus bodies."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from aip.rpc_status import build_rpc_status


def _detail_message(detail: object) -> str:
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list):
        return "Validation failed"
    if isinstance(detail, dict) and "message" in detail:
        return str(detail["message"])
    return str(detail)


def register_aip_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        _request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=build_rpc_status(exc.status_code, _detail_message(exc.detail)),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=400,
            content=build_rpc_status(
                400,
                "Validation failed",
                details=[{"@type": "BadRequest", "errors": exc.errors()}],
            ),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        _request: Request, _exc: Exception
    ) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content=build_rpc_status(500, "Internal server error"),
        )
