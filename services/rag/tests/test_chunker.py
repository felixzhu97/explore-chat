"""Tests for text chunking service."""
import pytest

from domain.core.chunker import Chunk, TextChunker


class TestTextChunker:
    """Test cases for TextChunker."""

    def test_chunk_text_basic(self):
        """Test basic text chunking."""
        chunker = TextChunker(chunk_size=100, chunk_overlap=20)

        text = """
        This is the first paragraph. It contains some text.

        This is the second paragraph. It also contains text.

        This is the third paragraph with even more text.
        """

        chunks = chunker.chunk_text(text, metadata={"source": "test"})

        assert len(chunks) > 0
        assert all(isinstance(c, Chunk) for c in chunks)
        assert all(c.text for c in chunks)
        assert all(c.metadata.get("source") == "test" for c in chunks)

    def test_chunk_text_empty(self):
        """Test chunking empty text."""
        chunker = TextChunker()

        chunks = chunker.chunk_text("")
        assert len(chunks) == 0

        chunks = chunker.chunk_text("   ")
        assert len(chunks) == 0

    def test_chunk_text_whitespace(self):
        """Test that whitespace is normalized."""
        chunker = TextChunker()

        text = "Multiple    spaces    between   words"
        chunks = chunker.chunk_text(text)

        assert len(chunks) > 0
        # Check that multiple spaces are normalized
        for chunk in chunks:
            assert "    " not in chunk.text

    def test_chunk_documents(self):
        """Test chunking multiple documents."""
        chunker = TextChunker(chunk_size=100, chunk_overlap=20)

        documents = [
            {"text": "First document content.", "page_number": 1},
            {"text": "Second document content.", "page_number": 2},
            {"text": "Third document content.", "page_number": 3},
        ]

        chunks = chunker.chunk_documents(
            documents,
            metadata={"source": "pdf"},
            source_id="doc_123",
        )

        assert len(chunks) > 0
        assert all(c.metadata.get("source") == "pdf" for c in chunks)
        assert any(c.metadata.get("page") == 1 for c in chunks)
        assert any(c.metadata.get("page") == 2 for c in chunks)

    def test_chunk_ids_unique(self):
        """Test that chunk IDs are unique."""
        chunker = TextChunker()

        text = """
        First paragraph with some content.

        Second paragraph with more content.

        Third paragraph with additional content.

        Fourth paragraph with even more text.

        Fifth paragraph to ensure multiple chunks.
        """

        chunks = chunker.chunk_text(text, source_id="doc_123")

        chunk_ids = [c.id for c in chunks]
        assert len(chunk_ids) == len(set(chunk_ids)), "Chunk IDs should be unique"

    def test_long_paragraph_splitting(self):
        """Test that long paragraphs are split."""
        chunker = TextChunker(chunk_size=50, chunk_overlap=10)

        # Create a long paragraph
        long_text = ". ".join([f"This is sentence number {i}" for i in range(100)])

        chunks = chunker.chunk_text(long_text)

        # Should have multiple chunks
        assert len(chunks) > 1

        # Each chunk should not exceed the size limit significantly
        for chunk in chunks:
            # Rough check: chunk size should be reasonable
            assert len(chunk.text) < len(long_text)

    def test_chunk_metadata_preserved(self):
        """Test that metadata is preserved in chunks."""
        chunker = TextChunker()

        metadata = {
            "author": "test_author",
            "document_type": "test_doc",
            "custom_field": "custom_value",
        }

        text = "Some test content. More content. Even more content here."

        chunks = chunker.chunk_text(text, metadata=metadata, source_id="test_id")

        for chunk in chunks:
            assert chunk.metadata["author"] == "test_author"
            assert chunk.metadata["document_type"] == "test_doc"
            assert chunk.metadata["custom_field"] == "custom_value"

    def test_token_count_estimation(self):
        """Test token count estimation."""
        chunker = TextChunker()

        text = "Short text."
        chunks = chunker.chunk_text(text)

        # Token count should be a rough approximation
        if chunks:
            assert chunks[0].token_count >= 0

    def test_start_end_char_positions(self):
        """Test that character positions are tracked."""
        chunker = TextChunker()

        text = "First paragraph.\n\nSecond paragraph."
        chunks = chunker.chunk_text(text)

        if len(chunks) > 1:
            # End of first chunk should be before start of second
            first_end = chunks[0].end_char
            second_start = chunks[1].start_char
            assert first_end <= second_start
