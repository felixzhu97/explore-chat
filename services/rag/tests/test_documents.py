"""Tests for document parsing utilities."""
import pytest

from utils.pdf_parser import (
    TextParser,
    HTMLParser,
    MarkdownParser,
    parse_file,
)


class TestTextParser:
    """Test cases for TextParser."""

    def test_parse_basic(self):
        """Test basic text parsing."""
        content = "Line 1\nLine 2\n\nLine 3\nLine 4"

        result = TextParser.parse(content)

        assert "text" in result
        assert "paragraphs" in result
        assert len(result["paragraphs"]) >= 1

    def test_parse_empty(self):
        """Test parsing empty content."""
        result = TextParser.parse("")

        assert result["text"] == ""
        assert len(result["paragraphs"]) == 0

    def test_parse_lines_extraction(self):
        """Test that lines are extracted correctly."""
        content = "Line 1\nLine 2\nLine 3"

        result = TextParser.parse(content)

        assert len(result["lines"]) == 3
        assert "Line 1" in result["lines"]


class TestHTMLParser:
    """Test cases for HTMLParser."""

    def test_parse_basic_html(self):
        """Test basic HTML parsing."""
        html = """
        <html>
        <head><title>Test Page</title></head>
        <body>
            <h1>Heading</h1>
            <p>Paragraph text.</p>
        </body>
        </html>
        """

        result = HTMLParser.parse(html)

        assert result["title"] == "Test Page"
        assert "Heading" in result["text"]
        assert "Paragraph text" in result["text"]

    def test_parse_removes_nav_elements(self):
        """Test that nav elements are removed."""
        html = """
        <html>
        <body>
            <nav>Navigation content</nav>
            <main>Main content</main>
            <footer>Footer content</footer>
        </body>
        </html>
        """

        result = HTMLParser.parse(html)

        assert "Navigation" not in result["text"]
        assert "Main content" in result["text"]

    def test_parse_extracts_links(self):
        """Test that links are extracted."""
        html = """
        <html>
        <body>
            <a href="https://example.com">Example</a>
            <a href="/about">About</a>
        </body>
        </html>
        """

        result = HTMLParser.parse(html)

        assert len(result["links"]) == 2
        assert any(link["href"] == "https://example.com" for link in result["links"])


class TestMarkdownParser:
    """Test cases for MarkdownParser."""

    def test_parse_headings(self):
        """Test parsing markdown headings."""
        md = """
# Main Title

Some content here.

## Section 1

Content in section 1.

## Section 2

Content in section 2.
"""

        result = MarkdownParser.parse(md)

        assert "Main Title" in result["title"]
        assert len(result["sections"]) >= 2

    def test_parse_sections(self):
        """Test that sections are correctly parsed."""
        md = """
# Document Title

## First Section

Content of first section.

## Second Section

Content of second section.
"""

        result = MarkdownParser.parse(md)

        assert len(result["sections"]) >= 2
        assert any(s["title"] == "First Section" for s in result["sections"])

    def test_parse_empty_document(self):
        """Test parsing empty markdown."""
        result = MarkdownParser.parse("")

        assert result["title"] == ""
        assert len(result["sections"]) == 0


class TestParseFile:
    """Test cases for parse_file function."""

    def test_parse_txt_file(self, sample_text_content):
        """Test parsing a text file."""
        result = parse_file(sample_text_content.encode(), "test.txt")

        assert result["type"] == "text"
        assert "text" in result

    def test_parse_markdown_file(self):
        """Test parsing a markdown file."""
        content = "# Title\n\nParagraph text."
        result = parse_file(content.encode(), "test.md")

        assert result["type"] == "markdown"
        assert "text" in result

    def test_parse_html_file(self, sample_html_content):
        """Test parsing an HTML file."""
        result = parse_file(sample_html_content.encode(), "test.html")

        assert result["type"] == "html"
        assert "text" in result

    def test_parse_unsupported_file(self):
        """Test parsing a binary file that cannot be decoded."""
        # Create binary content that will fail to parse
        content = b"\x80\x81\x82\xff\xfe\xfd"
        result = parse_file(content, "test.xyz")
        
        # Should handle gracefully, not raise ValueError
        assert "type" in result
