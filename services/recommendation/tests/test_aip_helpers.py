"""Unit tests for AIP-193 RpcStatus helpers."""

from aip.rpc_status import build_rpc_status, rpc_code_from_http_status


def test_should_map_http_status_to_rpc_code():
    assert rpc_code_from_http_status(404) == "NOT_FOUND"
    assert rpc_code_from_http_status(400) == "INVALID_ARGUMENT"
    assert rpc_code_from_http_status(500) == "INTERNAL"


def test_should_build_aip_193_status_json():
    status = build_rpc_status(404, "User not found")
    assert status == {"code": "NOT_FOUND", "message": "User not found"}
    with_details = build_rpc_status(
        400, "bad", details=[{"@type": "BadRequest"}]
    )
    assert with_details["details"][0]["@type"] == "BadRequest"
