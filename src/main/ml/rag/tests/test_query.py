"""Tests for query functionality."""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from domain.schemas.query import QueryRequest, QueryResponse, SourceDocument


class TestQuerySchemas:
    """Test cases for query schemas."""

    def test_query_request_defaults(self):
        """Test QueryRequest default values."""
        request = QueryRequest(query="test query")

        assert request.query == "test query"
        assert request.collection is None
        assert request.top_k == 5
        assert request.include_sources is True
        assert request.temperature == 0.7
        assert request.stream is False

    def test_query_request_custom_values(self):
        """Test QueryRequest with custom values."""
        request = QueryRequest(
            query="test query",
            collection="documents",
            top_k=10,
            temperature=0.5,
            stream=True,
        )

        assert request.top_k == 10
        assert request.temperature == 0.5
        assert request.stream is True
        assert request.collection == "documents"

    def test_query_request_validation(self):
        """Test QueryRequest validation."""
        # Empty query should fail
        with pytest.raises(ValueError):
            QueryRequest(query="")

        # Query too long should fail
        with pytest.raises(ValueError):
            QueryRequest(query="x" * 3000)

    def test_source_document_creation(self):
        """Test SourceDocument creation."""
        doc = SourceDocument(
            id="chunk_1",
            text="Sample text content",
            score=0.95,
            metadata={"source": "test"},
        )

        assert doc.id == "chunk_1"
        assert doc.text == "Sample text content"
        assert doc.score == 0.95
        assert doc.metadata["source"] == "test"

    def test_query_response_creation(self):
        """Test QueryResponse creation."""
        sources = [
            SourceDocument(
                id="chunk_1",
                text="First source",
                score=0.95,
                metadata={},
            ),
            SourceDocument(
                id="chunk_2",
                text="Second source",
                score=0.85,
                metadata={},
            ),
        ]

        response = QueryResponse(
            answer="Generated answer",
            sources=sources,
            query="test query",
            collection_used="documents",
            total_chunks_searched=10,
            generation_time_ms=500,
        )

        assert response.answer == "Generated answer"
        assert len(response.sources) == 2
        assert response.total_chunks_searched == 10
        assert response.generation_time_ms == 500


class TestQueryLimits:
    """Test cases for query limits and constraints."""

    def test_top_k_limits(self):
        """Test top_k value constraints."""
        # Valid values
        request = QueryRequest(query="test", top_k=1)
        assert request.top_k == 1

        request = QueryRequest(query="test", top_k=20)
        assert request.top_k == 20

        # Invalid values
        with pytest.raises(ValueError):
            QueryRequest(query="test", top_k=0)

        with pytest.raises(ValueError):
            QueryRequest(query="test", top_k=21)

    def test_temperature_limits(self):
        """Test temperature value constraints."""
        # Valid values
        request = QueryRequest(query="test", temperature=0.0)
        assert request.temperature == 0.0

        request = QueryRequest(query="test", temperature=2.0)
        assert request.temperature == 2.0

        # Invalid values
        with pytest.raises(ValueError):
            QueryRequest(query="test", temperature=-0.1)

        with pytest.raises(ValueError):
            QueryRequest(query="test", temperature=2.1)

    def test_query_length_limits(self):
        """Test query length constraints."""
        # Valid length
        request = QueryRequest(query="x" * 2000)
        assert len(request.query) == 2000

        # Too long
        with pytest.raises(ValueError):
            QueryRequest(query="x" * 2001)
