"""Unit tests for AIP-158 page_token helpers."""

from aip.page_token import (
    clamp_page_size,
    next_offset_page_token,
    offset_from_page_token,
)


def test_should_clamp_page_size():
    assert clamp_page_size(None) == 20
    assert clamp_page_size(0) == 20
    assert clamp_page_size(50) == 50
    assert clamp_page_size(500) == 100


def test_should_round_trip_offset_page_token():
    token = next_offset_page_token(0, 20, True)
    assert token is not None
    assert offset_from_page_token(token, 20) == 20
    assert next_offset_page_token(20, 20, False) is None
