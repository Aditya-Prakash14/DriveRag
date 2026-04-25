"""
processing/chunker.py
─────────────────────
Splits cleaned text into overlapping chunks with metadata.
Uses a recursive splitter strategy (paragraph → sentence → word).
"""
import re
from dataclasses import dataclass, field
from typing import Optional

from config.settings import CHUNK_SIZE, CHUNK_OVERLAP


@dataclass
class Chunk:
    chunk_id: str
    doc_id: str
    file_name: str
    source: str = "gdrive"
    chunk_index: int = 0
    text: str = ""
    metadata: dict = field(default_factory=dict)


class RecursiveCharacterTextSplitter:
    """
    Splits text trying separators in order:
    paragraph → sentence → word boundary → character
    """
    SEPARATORS = ["\n\n", "\n", ". ", "? ", "! ", " ", ""]

    def __init__(self, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def _split_by_separator(self, text: str, separator: str) -> list[str]:
        if separator:
            parts = text.split(separator)
            return [p.strip() for p in parts if p.strip()]
        else:
            return list(text)

    def split_text(self, text: str) -> list[str]:
        chunks = []
        current = ""

        # Find the best separator for this text length
        separator = ""
        for sep in self.SEPARATORS:
            if sep in text:
                separator = sep
                break

        parts = self._split_by_separator(text, separator)

        for part in parts:
            if len(current) + len(part) + len(separator) <= self.chunk_size:
                current = (current + separator + part).lstrip(separator) if current else part
            else:
                if current:
                    chunks.append(current)
                    # Carry over overlap
                    overlap_start = max(0, len(current) - self.chunk_overlap)
                    current = current[overlap_start:] + separator + part
                else:
                    # Single part too large — recurse with next separator
                    if len(part) > self.chunk_size and separator:
                        idx = self.SEPARATORS.index(separator)
                        next_seps = self.SEPARATORS[idx + 1:]
                        sub_splitter = RecursiveCharacterTextSplitter(
                            self.chunk_size, self.chunk_overlap
                        )
                        sub_splitter.SEPARATORS = next_seps
                        chunks.extend(sub_splitter.split_text(part))
                        current = ""
                    else:
                        current = part

        if current.strip():
            chunks.append(current.strip())

        return chunks


def chunk_document(
    text: str,
    doc_id: str,
    file_name: str,
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> list[Chunk]:
    """Split a document's text into Chunk objects with metadata."""
    splitter = RecursiveCharacterTextSplitter(chunk_size, chunk_overlap)
    raw_chunks = splitter.split_text(text)

    chunks = []
    for i, chunk_text in enumerate(raw_chunks):
        chunk = Chunk(
            chunk_id=f"{doc_id}__chunk_{i}",
            doc_id=doc_id,
            file_name=file_name,
            source="gdrive",
            chunk_index=i,
            text=chunk_text,
            metadata={
                "doc_id": doc_id,
                "file_name": file_name,
                "chunk_index": i,
                "total_chunks": len(raw_chunks),
                "char_count": len(chunk_text),
            },
        )
        chunks.append(chunk)

    return chunks
