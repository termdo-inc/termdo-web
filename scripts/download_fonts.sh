#!/bin/bash

# Font Download Script
# Usage: ./download_fonts.sh "Cascadia Code" "400,700"

FONT_NAME="$1"
FONT_WEIGHTS="$2"
OUTPUT_DIR="public/fonts/"

# Default values
FONT_NAME=${FONT_NAME:-"Roboto"}
FONT_WEIGHTS=${FONT_WEIGHTS:-"400"}

# Create output directory
mkdir -p "$OUTPUT_DIR"

# URL encode the font name
ENCODED_NAME=$(echo "$FONT_NAME" | sed 's/ /+/g')

# Google Fonts URL
GOOGLE_URL="https://fonts.googleapis.com/css2?family=${ENCODED_NAME}:wght@${FONT_WEIGHTS}&display=swap"

echo "Downloading font: $FONT_NAME"
echo "Weights: $FONT_WEIGHTS"
echo "URL: $GOOGLE_URL"
echo ""

# User agents for different formats
UA_MODERN="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
UA_WOFF="Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)"

# Download CSS files
echo "Fetching WOFF2 CSS..."
curl -s "$GOOGLE_URL" -H "User-Agent: $UA_MODERN" -o temp_woff2.css

echo "Fetching WOFF CSS..."
curl -s "$GOOGLE_URL" -H "User-Agent: $UA_WOFF" -o temp_woff.css

# Extract and download WOFF2 files
echo ""
echo "Downloading WOFF2 files..."
grep -o 'https://fonts.gstatic.com[^)]*\.woff2' temp_woff2.css | while read -r url; do
    filename=$(basename "$url")
    echo "  → $filename"
    curl -s "$url" -o "$OUTPUT_DIR/$filename"
done

# Extract and download WOFF files
echo ""
echo "Downloading WOFF files..."
grep -o 'https://fonts.gstatic.com[^)]*\.woff' temp_woff.css | while read -r url; do
    filename=$(basename "$url")
    echo "  → $filename"
    curl -s "$url" -o "$OUTPUT_DIR/$filename"
done

# Create combined CSS file
echo ""
echo "Creating fonts.css..."
cat > "$OUTPUT_DIR/fonts.css" << 'EOF'
/* Auto-generated font CSS */
EOF

# Process WOFF2 CSS and modify paths
sed 's|https://fonts.gstatic.com/s/[^/]*/[^/]*/||g' temp_woff2.css | \
sed 's|) format|../fonts/&|g' >> "$OUTPUT_DIR/fonts.css"

# Clean up temp files
rm temp_woff2.css temp_woff.css

echo ""
echo "✅ Done! Files saved to $OUTPUT_DIR/"
echo "📁 Font files: $OUTPUT_DIR/*.woff2, $OUTPUT_DIR/*.woff"
echo "📄 CSS file: $OUTPUT_DIR/fonts.css"
echo ""
echo "Add to your HTML:"
echo '<link href="/fonts/fonts.css" rel="stylesheet">'
