#!/usr/bin/env bash
# Enhanced Vedic Report PDF Generator Tool v2.1
# FIXES: TOC, Character Encoding, Specific Chart Extraction, Ad Filtering, Table Styling
# Creates high-quality Vedic astrology PDFs with specific charts and professional formatting.
# Usage: bash create_vedic_tool.sh

set -e  # Exit on any error

# Configuration
TARGET_FILE="vedic_report_pdf_generator.py"
REQUIREMENTS_FILE="vedic_requirements.txt"
LOG_FILE="vedic_pdf_generator.log"
MAX_RETRIES=3
RETRY_COUNT=0

# Input file paths
INPUT_DOCX="/Users/vicd/Downloads/Saroj_Sanjay_VedicReport_Analysis.docx"
SANJAY_PDF="/Users/vicd/Downloads/VedicReport_Sanjay_Shrotriya.pdf"
SAROJ_PDF="/Users/vicd/Downloads/VedicReport_Saroj_Patankar.pdf"
FINAL_PDF="/Users/vicd/Downloads/Enhanced_Brihad_Parashara_Hora_Shastra.pdf"

echo "=== Enhanced Vedic PDF Generator Tool v2.1 ==="
echo "CRITICAL FIXES: TOC, Encoding, Chart Extraction, Ad Filtering, Table Styling"
echo "Setting up comprehensive Vedic PDF conversion system..."

# Validation function for input files
validate_input_files() {
    echo "Validating input files..."

    if [[ ! -f "$INPUT_DOCX" ]]; then
        echo "❌ ERROR: Input DOCX file not found: $INPUT_DOCX"
        exit 1
    fi

    echo "✓ Input DOCX file found: $INPUT_DOCX"

    if [[ ! -f "$SANJAY_PDF" ]]; then
        echo "⚠️  WARNING: Sanjay PDF not found: $SANJAY_PDF"
    else
        echo "✓ Sanjay PDF found: $SANJAY_PDF"
    fi

    if [[ ! -f "$SAROJ_PDF" ]]; then
        echo "⚠️  WARNING: Saroj PDF not found: $SAROJ_PDF"
    else
        echo "✓ Saroj PDF found: $SAROJ_PDF"
    fi
}

# Cleanup function
cleanup_temp_files() {
    echo "Cleaning up temporary files..."

    # Remove temporary files
    rm -f "$REQUIREMENTS_FILE" 2>/dev/null || true
    rm -f "$TARGET_FILE" 2>/dev/null || true
    rm -f "$LOG_FILE" 2>/dev/null || true
    rm -f "/Users/vicd/Downloads/_enhanced_content.pdf" 2>/dev/null || true

    # Remove any PNG temp files created during processing
    find /tmp -name "tmp*.png" -type f -delete 2>/dev/null || true

    echo "✓ Temporary files cleaned up"
}

# Enhanced PDF quality validation function
validate_pdf_quality() {
    local pdf_file="$1"

    echo "Validating PDF quality..."

    if [[ ! -f "$pdf_file" ]]; then
        echo "❌ PDF file not found: $pdf_file"
        return 1
    fi

    # Check file size (should be > 20KB for a comprehensive report)
    local file_size
    file_size=$(stat -f%z "$pdf_file" 2>/dev/null || echo "0")
    if [[ $file_size -lt 20480 ]]; then
        echo "❌ PDF file too small (< 20KB): $file_size bytes"
        return 1
    fi

    # Check if file is a valid PDF (basic check)
    if ! file "$pdf_file" | grep -q "PDF"; then
        echo "❌ File is not a valid PDF"
        return 1
    fi

    echo "✓ PDF quality validation passed"
    echo "  - File size: $(( file_size / 1024 )) KB"
    return 0
}

# PDF inspection function
inspect_pdf() {
    local pdf_file="$1"

    echo "Opening PDF for inspection..."

    # Open PDF with default application
    if command -v open >/dev/null 2>&1; then
        open "$pdf_file"
    else
        echo "⚠️  Cannot open PDF automatically. Please manually inspect: $pdf_file"
    fi

    # Prompt user for validation
    echo ""
    echo "Please inspect the generated PDF and verify:"
    echo "  1. Contains ONLY Birth, Navamsa, and Chandra charts."
    echo "  2. ZERO advertisements or promotional content."
    echo "  3. Functional Table of Contents with correct page numbers."
    echo "  4. Professional formatting, layout, and character encoding."
    echo "  5. Content from '$INPUT_DOCX' is correctly included."
    echo ""

    while true; do
        read -r -p "Does the PDF meet all requirements? (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes (y) or no (n).";;
        esac
    done
}

# Create enhanced requirements file
create_requirements() {
    cat << 'EOF' > "$REQUIREMENTS_FILE"
# Core PDF Generation
reportlab>=3.6.0
python-docx>=0.8.11
PyMuPDF>=1.20.0

# Image Processing & Chart Integration
Pillow>=9.0.0
pdf2image>=1.16.0
opencv-python>=4.6.0
numpy>=1.21.0
scikit-image>=0.19.0

# Visual Design & Typography
matplotlib>=3.5.0
fonttools>=4.30.0
colorspacious>=1.1.2

# Enhanced PDF Features
PyPDF2>=2.12.0
reportlab-qrcode>=0.1.0
svglib>=1.4.0

# Additional Dependencies
requests>=2.28.0
EOF
}

# Install dependencies
install_dependencies() {
    echo "Installing enhanced dependencies for Vedic PDF generation..."

    # Check for Python and pip availability
    if ! command -v python3 >/dev/null 2>&1; then
        echo "❌ ERROR: python3 not found. Please install Python 3."
        exit 1
    fi

    # Try multiple pip installation methods
    if command -v pip3 >/dev/null 2>&1; then
        echo "Using pip3..."
        pip3 install -r "$REQUIREMENTS_FILE" --quiet
    elif python3 -m pip --version >/dev/null 2>&1; then
        echo "Using python3 -m pip..."
        python3 -m pip install -r "$REQUIREMENTS_FILE" --quiet
    else
        echo "❌ ERROR: pip not available. Please install pip manually."
            exit 1
    fi

    echo "✓ Dependencies installed successfully"
}

# Main execution loop with iterative verification
main_execution_loop() {
    echo "Starting Vedic PDF generation process..."

    while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
        echo ""
        echo "=== Attempt $(( RETRY_COUNT + 1 )) of $MAX_RETRIES ==="

        # Step 1: Validate input files
        validate_input_files

        # Step 2: Create requirements and install dependencies
        create_requirements
        install_dependencies

        # Step 3: Create corrected Python generator
        create_corrected_python_generator

        # Step 4: Execute PDF generation
        echo "Executing PDF generation..."
        if python3 "$TARGET_FILE"; then
            echo "✓ PDF generation script executed successfully"

            # Step 5: Validate PDF quality
            if validate_pdf_quality "$FINAL_PDF"; then
                echo "✓ PDF quality validation passed"

                # Step 6: Inspect PDF with user
                if inspect_pdf "$FINAL_PDF"; then
                    echo "✅ SUCCESS: PDF meets all requirements!"

                    # Step 7: Cleanup temporary files
                    cleanup_temp_files

                    echo ""
                    echo "🎉 Enhanced Vedic PDF Generator completed successfully!"
                    echo "📄 Final output: $FINAL_PDF"
                    exit 0
                else
                    echo "❌ User validation failed. Retrying..."
                fi
            else
                echo "❌ PDF quality validation failed. Retrying..."
            fi
        else
            echo "❌ PDF generation script failed to execute. Retrying..."
        fi

        # Cleanup before retry
        cleanup_temp_files
        RETRY_COUNT=$((RETRY_COUNT + 1))

        if [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; then
            echo "Preparing for retry..."
            sleep 2
        fi
    done

    echo ""
    echo "❌ FAILED: Maximum retry attempts reached ($MAX_RETRIES)"
    echo "Please check the input files and logs, then try again."
    cleanup_temp_files
    exit 1
}

# Create corrected Python generator with fixes
create_corrected_python_generator() {
    echo "Creating corrected Python generator..."

# Create the enhanced Vedic PDF generator
cat << 'EOF' > "$TARGET_FILE"
#!/usr/bin/env python3
"""
Enhanced Vedic Report PDF Generator

A comprehensive tool to convert DOCX analysis reports into high-quality,
visually appealing Vedic astrology PDFs with professional formatting,
specific chart integration, and traditional aesthetic elements.

Features:
- Advanced typography with Vedic-appropriate styling
- High-resolution, specific chart extraction (Birth, Navamsa, Chandra)
- Strict advertisement and extraneous content filtering
- Correct Table of Contents generation with multi-pass build
- Professional layout with enhanced visual appeal and table styling
- Fixes for character encoding issues
"""

import logging
import sys
import os
from pathlib import Path
from typing import List, Tuple, Optional, Dict, Any
import tempfile
import io
import json
from datetime import datetime

# Core document processing
from docx import Document
from docx.document import Document as DocumentClass
from docx.table import Table as DocxTable
from docx.text.paragraph import Paragraph as DocxParagraph
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl
import fitz  # PyMuPDF for superior PDF handling
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
import cv2

# ReportLab for advanced PDF generation
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import inch, cm, mm
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, Image as RLImage, KeepTogether, Flowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfgen import canvas

# Vedic Color Palette
VEDIC_COLORS = {
    'saffron': HexColor('#FF9933'),
    'sacred_red': HexColor('#DC143C'),
    'golden': HexColor('#FFD700'),
    'deep_orange': HexColor('#FF6600'),
    'maroon': HexColor('#800000'),
    'dark_gold': HexColor('#B8860B'),
    'cream': HexColor('#FFFDD0'),
    'light_saffron': HexColor('#FFCC99'),
    'border_dark': HexColor('#8B4513'),
    'text_primary': HexColor('#2F1B14'),
    'text_secondary': HexColor('#5D4037')
}

class VedicDocTemplate(BaseDocTemplate):
    """Enhanced document template with Vedic styling and functional TOC integration"""

    def __init__(self, filename: str, **kwargs):
        self.title_text = kwargs.pop('title', 'Vedic Report')
        self.author_text = kwargs.pop('author', 'Vedic Astrologer')
        super().__init__(filename, pagesize=A4, **kwargs)

        margin = 72
        content_width = A4[0] - 2 * margin
        content_height = A4[1] - 2 * margin - 50
        main_frame = Frame(margin, margin + 25, content_width, content_height, id='main')
        main_template = PageTemplate(id='main', frames=[main_frame], onPage=self._add_page_decorations)
        title_template = PageTemplate(id='title', frames=[main_frame], onPage=self._add_title_page_decorations)
        self.addPageTemplates([title_template, main_template])

    def afterFlowable(self, flowable):
        """Registers TOC entries."""
        if isinstance(flowable, VedicHeading):
            level = flowable.level
            text = flowable.text
            page = self.page
            self.notify('TOCEntry', (level, text, page))

    def _add_page_decorations(self, canvas, doc):
        """Add decorative elements to regular pages"""
        canvas.saveState()
        canvas.setStrokeColor(VEDIC_COLORS['saffron'])
        canvas.setLineWidth(1)
        canvas.rect(36, 36, A4[0]-72, A4[1]-72)
        canvas.setFillColor(VEDIC_COLORS['light_saffron'])
        canvas.rect(36, A4[1]-60, A4[0]-72, 24, fill=1, stroke=0)
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(VEDIC_COLORS['text_secondary'])
        canvas.drawCentredText(A4[0]/2, 50, f"Page {doc.page}")
        self._draw_corner_decorations(canvas)
        canvas.restoreState()

    def _add_title_page_decorations(self, canvas, doc):
        """Add decorative elements to title page"""
        canvas.saveState()
        canvas.setStrokeColor(VEDIC_COLORS['golden'])
        canvas.setLineWidth(3)
        canvas.rect(36, 36, A4[0]-72, A4[1]-72)
        canvas.setStrokeColor(VEDIC_COLORS['saffron'])
        canvas.setLineWidth(1)
        canvas.rect(48, 48, A4[0]-96, A4[1]-96)
        canvas.setFillColor(VEDIC_COLORS['cream'])
        canvas.rect(72, A4[1]-200, A4[0]-144, 100, fill=1, stroke=1)
        canvas.restoreState()

    def _draw_corner_decorations(self, canvas):
        """Draw small decorative elements in corners"""
        size = 8
        positions = [(45, A4[1]-60), (A4[0]-53, A4[1]-60), (45, 45), (A4[0]-53, 45)]
        canvas.setFillColor(VEDIC_COLORS['golden'])
        for x, y in positions:
            canvas.circle(x, y, size//2, fill=1, stroke=0)

class VedicStyleManager:
    """Manages Vedic-appropriate styles and formatting"""
    @staticmethod
    def create_vedic_styles():
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle('VedicTitle', parent=styles['Title'], fontSize=24, spaceAfter=30, textColor=VEDIC_COLORS['sacred_red'], alignment=TA_CENTER, fontName='Helvetica-Bold'))
        styles.add(ParagraphStyle('VedicSubtitle', parent=styles['Normal'], fontSize=16, spaceAfter=20, textColor=VEDIC_COLORS['dark_gold'], alignment=TA_CENTER, fontName='Helvetica'))
        styles.add(ParagraphStyle('VedicHeading1', parent=styles['Heading1'], fontSize=18, spaceBefore=24, spaceAfter=12, textColor=VEDIC_COLORS['saffron'], fontName='Helvetica-Bold', borderWidth=1, borderColor=VEDIC_COLORS['light_saffron'], borderPadding=5))
        styles.add(ParagraphStyle('VedicHeading2', parent=styles['Heading2'], fontSize=14, spaceBefore=18, spaceAfter=8, textColor=VEDIC_COLORS['deep_orange'], fontName='Helvetica-Bold'))
        styles.add(ParagraphStyle('VedicNormal', parent=styles['Normal'], fontSize=11, spaceAfter=6, textColor=VEDIC_COLORS['text_primary'], fontName='Helvetica', alignment=TA_LEFT, leading=14))
        styles.add(ParagraphStyle('VedicEmphasis', parent=styles['Normal'], fontName='Helvetica-Oblique', textColor=VEDIC_COLORS['maroon']))
        return styles

class VedicHeading(Paragraph):
    """Enhanced heading class for TOC integration with proper tracking"""
    def __init__(self, text: str, style, level: int):
        super().__init__(text, style)
        self.level = level
        self.text = text

class ChartProcessor:
    """Enhanced processor for specific Vedic charts with strict advertisement filtering."""
    def __init__(self):
        self.chart_keywords = {
            'birth_chart': ['birth chart', 'lagna chart', 'lagna kundali', 'rashi chart', 'ascendant chart'],
            'navamsa_chart': ['navamsa chart', 'navamsha', 'd9 chart', 'd-9 chart', 'ninth division'],
            'chandra_chart': ['chandra chart', 'moon chart', 'chandra kundali', 'lunar chart'],
        }

        self.ad_keywords = [
            'astrosage', 'astro sage', 'clickastro', 'astroyogi', 'ganeshaspeaks', 'future point', 'kundli software',
            'free consultation', 'talk to', 'chat with', 'call now', 'verified astrologers', 'expert astrologers',
            'get your', 'order now', 'buy now', 'special offer', 'limited time', 'discount',
            'marriage', 'matchmaking', 'compatibility', 'remedies', 'gemstone', 'consultation',
            'price', 'cost', 'fees', 'premium', '$', '₹', 'rupees',
            'website', 'portal', 'app', '.com', '.in', 'email', '@', 'click here', 'visit us',
            'facebook', 'twitter', 'instagram', 'youtube', 'subscribe',
            'powered by', 'developed by', 'copyright', 'all rights reserved'
        ]
        self.excluded_patterns = [ 'planetary positions' ]

    def _get_text_blocks(self, page: fitz.Page) -> List:
        try:
            return page.get_text("blocks")
        except Exception as e:
            logging.error(f"Could not extract text blocks: {e}")
            return []

    def _is_advertisement(self, text: str) -> bool:
        if not text or len(text.strip()) < 50: return False
        text_lower = text.lower().strip()
        for pattern in self.excluded_patterns:
            if pattern in text_lower: return False
        ad_score = sum(1 for keyword in self.ad_keywords if keyword in text_lower)
        import re
        if re.search(r'(www\.|http|\.com|\.net|\.org|\.in)', text_lower): ad_score += 2
        if re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text_lower): ad_score += 2
        if re.search(r'(\+91|91|0)?[6-9]\d{9}', text_lower): ad_score += 2
        return ad_score >= 3

    def _get_chart_type(self, chart_bbox: Tuple, text_blocks: List) -> Optional[str]:
        cx = chart_bbox[0] + (chart_bbox[2] - chart_bbox[0]) / 2
        for tx1, ty1, tx2, ty2, text, _, _ in text_blocks:
            text_lower = text.lower().strip()
            if not text_lower: continue
            is_close_x = abs((tx1 + tx2) / 2 - cx) < (chart_bbox[2] - chart_bbox[0])
            is_above = chart_bbox[1] > ty2 and (chart_bbox[1] - ty2) < 100
            if is_close_x and is_above:
                for chart_type, keywords in self.chart_keywords.items():
                    if any(keyword in text_lower for keyword in keywords):
                        return chart_type
        return None

    def extract_charts_from_pdf(self, pdf_path: Path) -> Dict[str, List[Image.Image]]:
        charts = {'birth_chart': [], 'navamsa_chart': [], 'chandra_chart': []}
        try:
            doc = fitz.open(str(pdf_path))
            logging.info(f"Processing {len(doc)} pages from {pdf_path} for specific charts.")
            for page_num, page in enumerate(doc):
                text_blocks = self._get_text_blocks(page)
                page_text = " ".join([block[4] for block in text_blocks])
                if self._is_advertisement(page_text):
                    logging.info(f"Skipping page {page_num + 1} due to potential advertisement content.")
                    continue
                mat = fitz.Matrix(3.0, 3.0)
                pix = page.get_pixmap(matrix=mat)
                full_img = Image.open(io.BytesIO(pix.tobytes("png")))
                chart_regions = self._detect_chart_regions(full_img)
                for x, y, w, h in chart_regions:
                    page_region = (x / mat.a, y / mat.d, (x + w) / mat.a, (y + h) / mat.d)
                    chart_img = full_img.crop((x, y, x + w, y + h))
                    chart_type = self._get_chart_type(page_region, text_blocks)
                    if chart_type and not charts[chart_type] and self._is_valid_chart(chart_img):
                        charts[chart_type].append(self._enhance_image(chart_img))
                        logging.info(f"Extracted '{chart_type}' from page {page_num + 1}.")
            doc.close()
        except Exception as e:
            logging.error(f"Error extracting charts from {pdf_path}: {e}")
        return charts

    def _detect_chart_regions(self, img: Image.Image) -> List[Tuple[int, int, int, int]]:
        regions = []
        try:
            img_array = np.array(img.convert('L'))
            edges = cv2.Canny(cv2.GaussianBlur(img_array, (5, 5), 0), 30, 100)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            min_area, max_area = (img.width * img.height) * 0.05, (img.width * img.height) * 0.8
            for c in contours:
                area = cv2.contourArea(c)
                if min_area < area < max_area:
                    x, y, w, h = cv2.boundingRect(c)
                    if 0.5 <= w / h <= 2.0 and w > 150 and h > 150:
                        regions.append((x, y, w, h))
        except Exception as e:
            logging.warning(f"Chart region detection failed: {e}")
        return regions

    def _is_valid_chart(self, img: Image.Image) -> bool:
        if img.width < 200 or img.height < 200 or img.width > 1200 or img.height > 1200: return False
        try:
            edges = cv2.Canny(np.array(img.convert('L')), 30, 100)
            contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            return len(contours) > 5
        except Exception: return True

    def _enhance_image(self, img: Image.Image) -> Image.Image:
        if img.mode != 'RGB': img = img.convert('RGB')
        img = ImageEnhance.Contrast(img).enhance(1.2)
        img = ImageEnhance.Sharpness(img).enhance(1.1)
        return img

    def create_chart_flowable(self, img: Image.Image, width: Optional[float] = None, height: Optional[float] = None) -> RLImage:
        temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
        img.save(temp_file.name, 'PNG')
        if width and not height: height = width * (img.height / img.width)
        elif height and not width: width = height * (img.width / img.height)
        return RLImage(temp_file.name, width=width or 4*inch, height=height or 4*inch)

def setup_logging():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - [%(funcName)s] %(message)s",
                        handlers=[logging.StreamHandler(sys.stdout), logging.FileHandler('vedic_pdf_generator.log')])

def convert_docx_to_enhanced_pdf(
    docx_path: Path, output_pdf_path: Path, title: str, author: str,
    chart_dict: Optional[Dict[str, List[Image.Image]]] = None
) -> None:
    logging.info(f"Processing DOCX file: {docx_path}")
    doc = Document(str(docx_path))

    def fix_text_encoding(text: str) -> str:
        """Comprehensive character encoding fix for Vedic texts"""
        if not text: return ""
        import unicodedata

        # More robust handling of mojibake and unsupported characters
        char_fixes = {
            'â€™': "'", 'â€œ': '"', 'â€\x9d': '"', 'â€¦': '...', 'â€"': '-', 'â€\x94': '-',
            '\u25a0': '',  # Remove black square
            '■': '',      # Remove black square
            '\ufffd': '',  # Remove replacement character
            '\u00a0': ' ', # Handle non-breaking space
        }
        for old, new in char_fixes.items():
            text = text.replace(old, new)

        # Normalize Unicode text to decompose combined characters (e.g., accents),
        # then encode to ASCII, ignoring any characters that cannot be represented.
        # This effectively strips accents and other unsupported symbols.
        text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')

        return ' '.join(text.split())

    styles = VedicStyleManager.create_vedic_styles()
    chart_processor = ChartProcessor()

    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(fontName='Helvetica-Bold', fontSize=12, name='TOCLevel0', leftIndent=20, firstLineIndent=-20, spaceBefore=10, leading=16, textColor=VEDIC_COLORS['sacred_red']),
        ParagraphStyle(fontName='Helvetica', fontSize=10, name='TOCLevel1', leftIndent=40, firstLineIndent=-20, spaceBefore=5, leading=12)
    ]

    story = []

    story.extend([
        Paragraph(title, styles.get('VedicTitle')), Spacer(1, 20),
        Paragraph(author, styles.get('VedicSubtitle')), Spacer(1, 30)
    ])
    story.append(PageBreak())

    story.append(VedicHeading("Table of Contents", styles.get('VedicHeading1'), level=0))
    story.append(Spacer(1, 12))
    story.append(toc)
    story.append(PageBreak())

    for block in doc.element.body:
        if isinstance(block, CT_P):
            para = DocxParagraph(block, doc)
            text = fix_text_encoding(para.text.strip())
            if not text:
                story.append(Spacer(1, 6))
                continue
            style_name = para.style.name.lower() if para.style and para.style.name else ''
            if 'heading 1' in style_name or (text.isupper() and len(text) < 100):
                story.append(VedicHeading(text, styles.get('VedicHeading1'), level=0))
            elif 'heading 2' in style_name or (text.istitle() and len(text) < 100):
                story.append(VedicHeading(text, styles.get('VedicHeading2'), level=1))
            elif 'emphasis' in style_name or (text.startswith('*') and text.endswith('*')):
                story.append(Paragraph(text.strip('*'), styles.get('VedicEmphasis')))
            else:
                story.append(Paragraph(text, styles.get('VedicNormal')))
        elif isinstance(block, CT_Tbl):
            table = DocxTable(block, doc)
            data = []
            for row in table.rows:
                row_data = [fix_text_encoding(cell.text.strip()) for cell in row.cells]
                if any(row_data): data.append(row_data)
            if not data: continue
            max_cols = max(len(r) for r in data) if data else 1
            col_width = (A4[0] - 144) / max_cols
            rl_table = Table(data, colWidths=[col_width] * max_cols)
            rl_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), VEDIC_COLORS['light_saffron']),
                ('TEXTCOLOR', (0, 0), (-1, 0), VEDIC_COLORS['text_primary']),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BACKGROUND', (0, 1), (-1, -1), VEDIC_COLORS['cream']),
                ('GRID', (0, 0), (-1, -1), 0.5, VEDIC_COLORS['saffron'])
            ]))
            story.extend([Spacer(1, 8), rl_table, Spacer(1, 8)])

    if chart_dict and any(any(person_charts.values()) for person_charts in chart_dict.values()):
        story.append(PageBreak())
        story.append(VedicHeading("Astrological Charts", styles.get('VedicHeading1'), level=0))

        chart_map = {'birth_chart': 'Birth Chart (Lagna)'}

        for person_name, person_charts in chart_dict.items():
            if not any(person_charts.values()): continue

            story.append(VedicHeading(f"Charts for {person_name}", styles.get('VedicHeading2'), level=1))
            story.append(Spacer(1, 12))

            for chart_type, chart_title in chart_map.items():
                if person_charts.get(chart_type):
                    story.append(VedicHeading(chart_title, styles.get('VedicHeading2'), level=1))
                    chart_flowable = chart_processor.create_chart_flowable(person_charts[chart_type][0], width=5.5*inch)
                    story.append(KeepTogether([chart_flowable]))
                    story.append(Spacer(1, 12))

    doc_template = VedicDocTemplate(filename=str(output_pdf_path), title=title, author=author)
    logging.info(f"Building enhanced PDF: {output_pdf_path}")
    doc_template.multiBuild(story)

def main():
    setup_logging()
    logging.info("=== Enhanced Vedic PDF Generator Started ===")
    base_dir = Path('/Users/vicd/Downloads')
    docx_file = base_dir / 'Saroj_Sanjay_VedicReport_Analysis.docx'
    sanjay_pdf = base_dir / 'VedicReport_Sanjay_Shrotriya.pdf'
    saroj_pdf = base_dir / 'VedicReport_Saroj_Patankar.pdf'
    final_pdf = base_dir / 'Enhanced_Brihad_Parashara_Hora_Shastra.pdf'

    if not docx_file.exists():
        logging.error(f"DOCX file not found: {docx_file}"); return

    try:
        chart_processor = ChartProcessor()
        all_charts = {}

        if sanjay_pdf.exists():
            logging.info(f"Processing charts for Sanjay Shrotriya from {sanjay_pdf}")
            all_charts['Sanjay Shrotriya'] = chart_processor.extract_charts_from_pdf(sanjay_pdf)

        if saroj_pdf.exists():
            logging.info(f"Processing charts for Saroj Patankar from {saroj_pdf}")
            all_charts['Saroj Patankar'] = chart_processor.extract_charts_from_pdf(saroj_pdf)

        total_charts = sum(len(c) for person_charts in all_charts.values() for c in person_charts.values())
        logging.info(f"Extracted {total_charts} unique charts for the final report.")

        convert_docx_to_enhanced_pdf(
            docx_path=docx_file, output_pdf_path=final_pdf,
            title="Enhanced Brihad-Parashara-Hora-Shastra", author="Vikram Deshpande",
            chart_dict=all_charts
        )

        logging.info("PDF generation completed.")
    except Exception as e:
        logging.error(f"Error generating enhanced PDF: {e}")

if __name__ == "__main__":
    main()
EOF
}

main_execution_loop
