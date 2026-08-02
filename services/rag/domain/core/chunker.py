"""Text chunking service for RAG."""
import logging
import re
import uuid
from typing import Optional
from dataclasses import dataclass

from config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class Chunk:
    """Represents a text chunk."""
    id: str
    text: str
    metadata: dict
    token_count: int
    start_char: int
    end_char: int


class TextChunker:
    """
    Service for splitting text into chunks for embedding.

    Supports multiple chunking strategies:
    - Recursive character splitting
    - Semantic paragraph splitting
    - Overlapping chunks for context preservation
    """

    # Maximum characters per chunk to avoid embedding context overflow
    MAX_CHARS_PER_CHUNK = 1500

    def __init__(
        self,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
    ) -> None:
        settings = get_settings()
        self.chunk_size = chunk_size or settings.chunk_size
        self.chunk_overlap = chunk_overlap or settings.chunk_overlap

    def chunk_text(
        self,
        text: str,
        metadata: Optional[dict] = None,
        source_id: Optional[str] = None,
    ) -> list[Chunk]:
        """
        Split text into chunks.

        Args:
            text: Input text to chunk
            metadata: Additional metadata for chunks
            source_id: Source document ID

        Returns:
            List of Chunk objects
        """
        if not text or not text.strip():
            return []

        # Clean the text
        text = self._clean_text(text)

        # Split by paragraphs first for semantic chunking
        paragraphs = self._split_paragraphs(text)

        # Combine paragraphs into chunks
        chunks = self._create_chunks(
            paragraphs,
            metadata or {},
            source_id,
        )

        logger.info(
            f"Created {len(chunks)} chunks from text of length {len(text)}"
        )

        return chunks

    def chunk_documents(
        self,
        documents: list[dict],
        metadata: Optional[dict] = None,
        source_id: Optional[str] = None,
    ) -> list[Chunk]:
        """
        Chunk multiple documents (e.g., PDF pages).

        Args:
            documents: List of documents with 'text' and optional 'metadata'
            metadata: Additional metadata
            source_id: Source document ID

        Returns:
            List of Chunk objects
        """
        all_chunks = []

        for idx, doc in enumerate(documents):
            doc_text = doc.get("text", "")
            doc_metadata = {**(metadata or {}), **(doc.get("metadata", {}))}

            if doc.get("page_number"):
                doc_metadata["page"] = doc["page_number"]

            chunks = self.chunk_text(
                doc_text,
                doc_metadata,
                source_id,
            )

            # Store page number in metadata (only if not already set)
            page_num = doc.get("page_number", idx + 1)
            for chunk in chunks:
                if "page" not in chunk.metadata:
                    chunk.metadata["page"] = page_num

            all_chunks.extend(chunks)

        return all_chunks

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text."""
        # Replace multiple whitespace with single space
        text = re.sub(r"\s+", " ", text)
        # Remove special characters but keep punctuation
        text = text.strip()
        return text

    def _split_paragraphs(self, text: str) -> list[str]:
        """Split text into paragraphs."""
        # Split on double newlines or single newlines for lists
        paragraphs = re.split(r"\n{2,}|\n(?=[\-\*•])", text)
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        return paragraphs

    def _create_chunks(
        self,
        paragraphs: list[str],
        metadata: dict,
        source_id: Optional[str],
    ) -> list[Chunk]:
        """Create chunks from paragraphs."""
        chunks = []
        current_chunk_text = []
        current_char_count = 0
        chunk_id_counter = 0
        start_char = 0

        def estimate_tokens(text: str) -> int:
            """Estimate token count (rough approximation)."""
            return len(text) // 4

        def create_chunk(
            texts: list[str],
            chunk_id: str,
            metadata: dict,
            start: int,
            end: int,
        ) -> Chunk:
            """Create a Chunk object."""
            text = " ".join(texts)
            return Chunk(
                id=chunk_id,
                text=text,
                metadata=metadata.copy(),
                token_count=estimate_tokens(text),
                start_char=start,
                end_char=end,
            )

        def save_current_chunk():
            nonlocal current_chunk_text, current_char_count, start_char, chunk_id_counter
            if current_chunk_text:
                end_char = start_char + len(" ".join(current_chunk_text))
                chunks.append(
                    create_chunk(
                        current_chunk_text,
                        str(uuid.uuid4()),
                        metadata,
                        start_char,
                        end_char,
                    )
                )
                chunk_id_counter += 1
                # Keep last paragraph as overlap
                overlap_text = current_chunk_text[-1:] if current_chunk_text else []
                current_chunk_text = overlap_text
                current_char_count = sum(len(t) for t in current_chunk_text) if current_chunk_text else 0
                start_char = end_char - current_char_count

        for para in paragraphs:
            para_len = len(para)
            para_tokens = estimate_tokens(para)

            # If single paragraph exceeds max chars, split it further
            if para_len > self.MAX_CHARS_PER_CHUNK:
                # Save current chunk if not empty
                save_current_chunk()

                # Split the long paragraph into smaller pieces
                for i in range(0, len(para), self.MAX_CHARS_PER_CHUNK):
                    sub_text = para[i:i + self.MAX_CHARS_PER_CHUNK]
                    end_char = start_char + len(sub_text)
                    chunks.append(Chunk(
                        id=str(uuid.uuid4()),
                        text=sub_text,
                        metadata=metadata.copy(),
                        token_count=estimate_tokens(sub_text),
                        start_char=start_char,
                        end_char=end_char,
                    ))
                    chunk_id_counter += 1
                    start_char = end_char
                continue

            # Check if adding this paragraph exceeds chunk size or max chars
            if (current_char_count + para_len + 1 > self.MAX_CHARS_PER_CHUNK or
                    para_tokens > self.chunk_size):
                save_current_chunk()
                # Start new chunk with overlap
                overlap_tokens = 0
                overlap_texts = []
                for t in reversed(current_chunk_text):
                    if overlap_tokens + estimate_tokens(t) <= self.chunk_overlap:
                        overlap_texts.insert(0, t)
                        overlap_tokens += estimate_tokens(t)
                    else:
                        break

                current_chunk_text = overlap_texts + [para]
                current_char_count = sum(len(t) for t in current_chunk_text)
                start_char = start_char  # start_char is already set by save_current_chunk
            else:
                current_chunk_text.append(para)
                current_char_count += para_len + 1

        # Don't forget the last chunk
        if current_chunk_text:
            end_char = start_char + len(" ".join(current_chunk_text))
            chunks.append(
                create_chunk(
                    current_chunk_text,
                    str(uuid.uuid4()),
                    metadata,
                    start_char,
                    end_char,
                )
            )

        return chunks

    def _split_long_paragraph(
        self,
        text: str,
        metadata: dict,
        start_id: int,
        start_char: int,
    ) -> list[Chunk]:
        """Split a long paragraph into smaller chunks."""
        chunks = []
        sentences = self._split_sentences(text)
        current_text = []
        current_len = 0
        char_pos = start_char

        for sentence in sentences:
            sentence_len = len(sentence)

            if current_len + sentence_len > self.chunk_size * 4:
                if current_text:
                    chunk_text = " ".join(current_text)
                    chunks.append(Chunk(
                        id=str(uuid.uuid4()),
                        text=chunk_text,
                        metadata=metadata.copy(),
                        token_count=len(chunk_text) // 4,
                        start_char=char_pos,
                        end_char=char_pos + len(chunk_text),
                    ))

                    # Keep last sentence as overlap
                    overlap = current_text[-1:] if current_text else []
                    current_text = overlap + [sentence]
                    current_len = sum(len(t) for t in current_text)
                    char_pos = char_pos + len(chunk_text) + 1 - sum(len(t) for t in overlap)
                else:
                    current_text = [sentence]
                    current_len = sentence_len
            else:
                current_text.append(sentence)
                current_len += sentence_len

        # Last chunk
        if current_text:
            chunk_text = " ".join(current_text)
            chunks.append(Chunk(
                id=str(uuid.uuid4()),
                text=chunk_text,
                metadata=metadata.copy(),
                token_count=len(chunk_text) // 4,
                start_char=char_pos,
                end_char=char_pos + len(chunk_text),
            ))

        return chunks

    def _split_sentences(self, text: str) -> list[str]:
        """Split text into sentences."""
        # Simple sentence splitting
        sentence_endings = re.compile(r"(?<=[.!?])\s+")
        sentences = sentence_endings.split(text)
        return [s.strip() for s in sentences if s.strip()]


# Singleton instance
_chunker: Optional[TextChunker] = None


def get_chunker() -> TextChunker:
    """Get or create chunker instance."""
    global _chunker
    if _chunker is None:
        _chunker = TextChunker()
    return _chunker
