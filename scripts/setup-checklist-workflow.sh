#!/bin/bash

# Setup script for DevOps Automation Checklist workflow
# This script helps automate the PDF generation and provides instructions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CHECKLIST_DIR="$PROJECT_ROOT/BUSINESS_MATERIALS/MARKETING"

echo "🚀 DevOps Automation Checklist Setup"
echo "======================================"
echo ""

# Check if PDF exists
if [ -f "$CHECKLIST_DIR/DevOps_Automation_Checklist.pdf" ]; then
    PDF_SIZE=$(ls -lh "$CHECKLIST_DIR/DevOps_Automation_Checklist.pdf" | awk '{print $5}')
    echo "✅ PDF found: DevOps_Automation_Checklist.pdf ($PDF_SIZE)"
else
    echo "⚠️  PDF not found. Generating..."
    cd "$PROJECT_ROOT"
    node scripts/generate-pdf-checklist.js
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Upload PDF to HubSpot:"
echo "   - Go to HubSpot → File Manager"
echo "   - Upload: $CHECKLIST_DIR/DevOps_Automation_Checklist.pdf"
echo ""
echo "2. Create Email Template for PDF Delivery:"
echo "   - Go to HubSpot → Marketing → Email → Templates"
echo "   - Create new template: 'DevOps Checklist - PDF Delivery'"
echo "   - Attach the PDF from File Manager"
echo "   - Use the email template from HUBSPOT_EMAIL_SEQUENCE_SETUP.md"
echo ""
echo "3. Update Workflow:"
echo "   - Add 'Send Checklist PDF' as Action 0 (before welcome email)"
echo "   - This sends the PDF immediately when contact is created"
echo ""
echo "4. Test:"
echo "   - Submit the form on your landing page"
echo "   - Verify PDF is received in email"
echo ""
echo "✅ Setup complete!"
echo ""
echo "📁 PDF Location: $CHECKLIST_DIR/DevOps_Automation_Checklist.pdf"

