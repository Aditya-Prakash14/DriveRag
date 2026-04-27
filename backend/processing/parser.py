"""
processing/parser.py
────────────────────
Extract raw text from PDF, DOCX, TXT bytes.
"""
import io
import re
from typing import Optional

import PyPDF2
from docx import Document

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None


def extract_text_from_pdf(content: bytes) -> str:
    pages = []
    
    # Primary: PyMuPDF (much better text extraction)
    if fitz:
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            for page in doc:
                pages.append(page.get_text() or "")
            return "\n\n".join(pages)
        except Exception as e:
            print(f"[Parser] PyMuPDF failed: {e}. Falling back to PyPDF2.")
            pass

    # Fallback: PyPDF2
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        for page in reader.pages:
            text = page.extract_text() or ""
            pages.append(text)
    except Exception as e:
        print(f"[Parser] PyPDF2 failed: {e}")

    return "\n\n".join(pages)


def extract_text_from_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def extract_text_from_txt(content: bytes) -> str:
    try:
        return content.decode("utf-8")
    except UnicodeDecodeError:
        return content.decode("latin-1", errors="replace")


def extract_text(content: bytes, file_type: str) -> str:
    """Dispatch extraction based on file type."""
    if file_type in ("pdf",):
        return extract_text_from_pdf(content)
    elif file_type in ("docx", "gdoc"):
        return extract_text_from_docx(content)
    elif file_type == "txt":
        return extract_text_from_txt(content)
    else:
        # Attempt UTF-8 fallback
        try:
            return content.decode("utf-8")
        except Exception:
            return ""


def clean_text(text: str) -> str:
    """Normalize whitespace and strip junk."""
    # Collapse multiple newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse multiple spaces
    text = re.sub(r" {2,}", " ", text)
    # Remove null bytes and control chars (except newlines/tabs)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return text.strip()
