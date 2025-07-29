# FatturaPA Invoice Extractor Examples

This directory contains example usage scenarios for the FatturaPA-compliant invoice extractor.

## Example Scenarios

### 1. Italian B2B Invoice (`invoice-italian-b2b.json`)
Standard Italian business-to-business invoice with:
- Italian VAT numbers and tax codes
- Complete Italian addresses with provinces  
- EUR currency
- Standard 22% VAT rate
- Bank transfer payment method

### 2. Foreign Supplier Invoice (`invoice-foreign-supplier.json`)  
Foreign supplier (German company) selling to Italian customer with:
- Foreign VAT ID format (DE123456789)
- Tax representative in Italy
- USD currency with exchange rate
- Reverse charge VAT mechanism
- Administrative references for tax exemptions

### 3. Public Administration Invoice (`invoice-public-administration.json`)
Invoice to Italian Public Administration with:
- PA-specific codes (CIG, CUP)
- Split payment VAT mechanism (esigibilità differita)
- CPV classification codes
- Delivery address information
- Higher invoice values typical for PA contracts

## Usage Examples

### Extract and output as JSON (default)
```bash
npx ai-invoice-extractor -k [your-api-key] -f json invoice.pdf
```

### Extract and output as FatturaPA XML
```bash
npx ai-invoice-extractor -k [your-api-key] -f xml invoice.pdf > fattura.xml
```

### Compare formats
```bash
# JSON output
npx ai-invoice-extractor -k [your-api-key] -f json -p invoice.pdf > data.json

# XML output  
npx ai-invoice-extractor -k [your-api-key] -f xml invoice.pdf > data.xml
```

### Different extraction modes
```bash
# Full FatturaPA compliance (default)
npx ai-invoice-extractor -k [your-api-key] -t EXTRACT_INVOICE_FATTURAPA invoice.pdf

# European Factur-X standard
npx ai-invoice-extractor -k [your-api-key] -t EXTRACT_INVOICE_FACTURX invoice.pdf

# Basic invoice extraction
npx ai-invoice-extractor -k [your-api-key] -t EXTRACT_INVOICE invoice.pdf
```

## Key Features Demonstrated

- **Foreign Entity Handling**: Proper country codes, tax representatives
- **Currency Support**: Exchange rates for non-EUR invoices  
- **Italian Tax Compliance**: VAT nature codes, split payment, reverse charge
- **Public Sector**: CIG/CUP project codes, PA-specific fields
- **Comprehensive Address Data**: Including province codes for Italian addresses
- **Payment Methods**: Bank details, IBAN, BIC codes
- **Document References**: Purchase orders, contracts, delivery notes

All examples include confidence scores for extracted data to indicate AI certainty levels.