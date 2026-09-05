"""Assert AIP path strings are wired in RAG API modules (no heavy deps)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def test_should_wire_aip_document_and_custom_method_paths():
    documents = _read("api_documents.py")
    assert '@router.post("",' in documents or '@router.post("", ' in documents
    assert "page_size" in documents
    assert "page_token" in documents
    assert "HTTP_204_NO_CONTENT" in documents
    assert "/upload" not in documents

    query = _read("api_query.py")
    assert '/documents:query"' in query
    assert '/documents:streamQuery"' in query
    assert '/collections"' in query

    crawler = _read("api_crawler.py")
    assert '/webpages:scrape"' in crawler
    assert '/webpages:crawl"' in crawler

    sync = _read("api_sync.py")
    assert '/posts:sync"' in sync
    assert '/comments:sync"' in sync
    assert '/resources:sync"' in sync
