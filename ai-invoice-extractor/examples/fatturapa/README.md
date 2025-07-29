# FatturaPA Examples

This directory contains example files for testing Italian E-Invoicing (FatturaPA) functionality.

## Example Files

### Italian Domestic Invoice (TD01)
- `italian-domestic-invoice.json` - Example extracted data for a standard Italian B2B invoice
- `italian-domestic-invoice-output.xml` - Expected FatturaPA XML output
- `italian-domestic-invoice-output.json` - Expected structured JSON output

### Cross-border EU Invoice (TD17) 
- `cross-border-eu-invoice.json` - Example extracted data for intra-EU purchase integration invoice
- `cross-border-eu-invoice-output.xml` - Expected FatturaPA XML output
- `cross-border-eu-invoice-output.json` - Expected structured JSON output

### San Marino Services Invoice (TD19)
- `san-marino-services-invoice.json` - Example extracted data for services from San Marino
- `san-marino-services-invoice-output.xml` - Expected FatturaPA XML output
- `san-marino-services-invoice-output.json` - Expected structured JSON output

## Usage

Test FatturaPA extraction with these examples:

```bash
# Extract as JSON (default)
npx ai-invoice-extractor -f fatturapa -k YOUR_API_KEY invoice-image.pdf

# Extract as FatturaPA XML
npx ai-invoice-extractor -f fatturapa -o xml -k YOUR_API_KEY invoice-image.pdf

# Extract with pretty formatting
npx ai-invoice-extractor -f fatturapa -p -k YOUR_API_KEY invoice-image.pdf
```

## Document Types

- **TD01**: Standard commercial invoice (domestic)
- **TD17**: Integration invoice for intra-EU purchases
- **TD18**: Integration invoice for goods from San Marino
- **TD19**: Integration invoice for services from San Marino

The system automatically detects the appropriate document type based on supplier/customer countries and transaction characteristics.