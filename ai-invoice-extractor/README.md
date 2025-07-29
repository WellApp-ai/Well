<a href="https://extract.wellapp.ai/">
    <img alt="Extract Invoice AI" src="https://github.com/WellApp-ai/Well/blob/main/ai-invoice-extractor/assets/GitHub-Hero.png" />
</a>

<br />
<div align="center"><strong>Extract Receipt & Invoice Data</strong></div>
<div align="center"> Lightweight, customizable and open source.</div>
<br />


<div align="center">
    <img src="https://img.shields.io/npm/v/ai-invoice-extractor" alt="NPM Version" />
    <img src="https://img.shields.io/github/license/wellapp-ai/well" alt="License" />
    <img src="https://img.shields.io/github/actions/workflow/status/wellapp-ai/well/ai-invoice-extractor-ci" alt="Build Status">
</a>
</div>
<div align="center">
<a href="https://extract.wellapp.ai/">Website</a> 
<span> · </span>
<a href="https://x.com/getwellapp">X</a>
</div>

<br />

## Features

- 🔍 Extract invoice/receipt data
- 🧠 Choose your AI models (OpenAI, Mistral, Anthropic, Google Gemini, and Ollama)
- 🇮🇹 **Full FatturaPA support** for Italian e-invoicing (TD01, TD17-TD19)
- 🔧 Set AI keys with CLI and environment variables
- ⭐ Pretty print the output
- 🔄 Pipe output with other CLI
- 📄 Export to XML/JSON formats
- 🏛️ Public Administration support (CIG/CUP codes)

## Usage

Quick start:

```sh
npx ai-invoice-extractor -k [openai-api-key] examples/receipt.png
```

<div align="left">
    <img alt="CLI Result" src="./assets/cli-result.png" />
</div>

## Documentation

### Command Line Interface

Get help with `-h`:

```sh
npx ai-invoice-extractor -h 
Usage: ai-invoice-extractor [options] <file-path>

AI-based image/PDF invoices/receipts data extractor.

Arguments:
  file-path              Invoice/receipt file path (image or PDF)

Options:
  -v, --vendor [vendor]  AI vendor
  -m, --model [model]    AI model
  -k, --key [key]        AI key
  -p, --pretty           Output pretty JSON (default: false)
  -h, --help             display help for command
```

### CLI Options Reference

| Flag | Long Form | Type | Required | Default | Description | Example |
|------|-----------|------|----------|---------|-------------|---------|
| `-v` | `--vendor` | string | No | `openai` | AI vendor to use | `-v mistral` |
| `-m` | `--model` | string | No | Vendor default | AI model to use | `-m gpt-4o` |
| `-k` | `--key` | string | Yes* | - | AI API key | `-k sk-123...` |
| `-p` | `--pretty` | boolean | No | `false` | Pretty print JSON output | `-p` |
| `-h` | `--help` | - | No | - | Display help information | `-h` |

**\* Required unless provided via environment variable**

#### Supported AI Vendors

| Vendor | Default Model | Supported Models |
|--------|---------------|------------------|
| `openai` | `o4-mini` | `o4-mini`, `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`, [and more](src/constants.ts#L63-L98) |
| `mistral` | `mistral-small-latest` | `mistral-small-latest`, `pixtral-large-latest`, `pixtral-12b-2409` |
| `anthropic` | `claude-3-5-sonnet-20241022` | `claude-4-opus-20250514`, `claude-4-sonnet-20250514`, [and more](src/constants.ts#L52-L61) |
| `google` | `gemini-1.5-flash` | `gemini-2.0-flash-exp`, `gemini-1.5-pro`, `gemini-1.5-flash`, [and more](src/constants.ts#L42-L50) |
| `ollama` | `llama3.2` | Any model installed locally |

### Environment Variables

Copy the `.env.example` file to `.env` and configure your settings:

```sh
cp .env.example .env
# Edit .env with your API keys and preferences
```

| Variable | Type | Default | Description | Example |
|----------|------|---------|-------------|---------|
| `EXTRACTOR_VENDOR` | string | `openai` | AI vendor | `mistral` |
| `EXTRACTOR_MODEL` | string | Vendor default | AI model | `gpt-4o` |
| `EXTRACTOR_API_KEY` | string | - | AI API key | `sk-123...` |
| `EXTRACTOR_DEBUG` | boolean | `false` | Enable debug logs | `true` |

**Precedence:** CLI options override environment variables. For example, if `EXTRACTOR_VENDOR=openai` but you specify `-v mistral`, the CLI will use Mistral.

### Usage Examples

#### Basic Usage
```sh
# Using OpenAI (default vendor)
npx ai-invoice-extractor -k sk-your-openai-key invoice.pdf

# Using environment variables
export EXTRACTOR_API_KEY=sk-your-openai-key
npx ai-invoice-extractor invoice.pdf
```

#### FatturaPA (Italian E-Invoicing)
```sh
# Extract FatturaPA data with full Italian e-invoicing support
npx ai-invoice-extractor -k sk-key -p fattura.pdf

# Export to FatturaPA XML format
npx ai-invoice-extractor -k sk-key fattura.pdf | node -e "
  const { FatturapaXmlExporter } = require('./dist/exporters');
  const exporter = new FatturapaXmlExporter();
  const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  console.log(exporter.export(data));
"

# Extract cross-border invoice (TD18)
npx ai-invoice-extractor -k sk-key crossborder-invoice.pdf
```

#### Different AI Vendors
```sh
# Mistral AI
npx ai-invoice-extractor -v mistral -k your-mistral-key receipt.png

# Anthropic Claude
npx ai-invoice-extractor -v anthropic -k sk-ant-your-key invoice.pdf

# Google Gemini
npx ai-invoice-extractor -v google -k your-google-key receipt.jpg

# Local Ollama
npx ai-invoice-extractor -v ollama invoice.pdf
```

#### Specific Models
```sh
# OpenAI GPT-4o
npx ai-invoice-extractor -v openai -m gpt-4o -k sk-key invoice.pdf

# Anthropic Claude 4 Opus
npx ai-invoice-extractor -v anthropic -m claude-4-opus-20250514 -k sk-ant-key receipt.png

# Google Gemini Pro
npx ai-invoice-extractor -v google -m gemini-1.5-pro -k google-key invoice.pdf
```

#### Output Formatting
```sh
# Pretty printed JSON
npx ai-invoice-extractor -k sk-key -p invoice.pdf

# Pipe to file
npx ai-invoice-extractor -k sk-key invoice.pdf > output.json

# Pipe to other tools
npx ai-invoice-extractor -k sk-key invoice.pdf | jq '.total'
```

### Error Handling

The CLI provides helpful error messages for common issues:

- **Missing file:** `Error: File 'invoice.pdf' not found`
- **No API key:** `No AI configuration found. Please provide an API key.`
- **Invalid vendor:** `Invalid enum value. Expected 'openai' | 'mistral' | 'anthropic' | 'google' | 'ollama'`
- **Invalid file format:** Files must be images (PNG, JPG, JPEG) or PDFs

### Supported File Formats

- **Images:** PNG, JPG, JPEG, WebP
- **Documents:** PDF
- **File size:** Up to 20MB (varies by AI provider)

## FatturaPA (Italian E-Invoicing) Support

The AI Invoice Extractor provides comprehensive support for FatturaPA, the Italian electronic invoicing standard mandated by the Agenzia delle Entrate (Italian Revenue Agency).

### Supported Document Types

| Code | Description | Support |
|------|-------------|---------|
| **TD01** | Domestic invoice | ✅ Full support |
| **TD17** | Domestic reverse charge integration | ✅ Full support |
| **TD18** | Intra-EU purchase integration | ✅ Full support |
| **TD19** | Extra-EU purchase integration | ✅ Full support |
| **TD20-27** | Specialized invoice types | ✅ Basic support |

### Key Features

- **🏢 Complete Party Data:** Italian VAT IDs, Codice Fiscale, REA registration, PEC addresses
- **🌍 Cross-Border Support:** Foreign VAT IDs, tax representatives, currency conversion
- **💰 Tax Compliance:** All Italian VAT rates, nature codes (N1-N7), withholding taxes
- **🏛️ Public Administration:** CIG/CUP codes, office codes, administrative references  
- **📋 Line Items:** Product codes, service periods, discounts, custom information
- **💳 Payment Terms:** All Italian payment methods (MP01-MP22), IBAN/BIC, installments
- **📎 References:** Order numbers, contracts, transport documents
- **🔧 Export Formats:** SDI-compliant XML, structured JSON, validation format

### Extracted Fields

The extractor captures **300+ fields** including:

#### Document Header
- Document type code (TD01, TD17-TD19, etc.)
- Invoice number, issue date, due date
- Currency code and exchange rates (for cross-border)
- Transmission format and country codes

#### Party Information (Supplier & Customer)
- Legal name and form
- Italian VAT ID (`IT` + 11 digits) and Tax ID (Codice Fiscale)
- Foreign VAT IDs for cross-border transactions  
- Complete addresses with Italian province codes
- Contact information (phone, email, PEC)
- REA registration details (office, number, share capital)
- Tax representative information (for foreign suppliers)

#### Tax Details
- Multiple VAT rates and amounts
- Nature codes for exemptions (N1-N7 with descriptions)
- Withholding taxes (RT01, RT02 types)
- Administrative references for PA invoices

#### Line Items
- Descriptions, quantities, unit prices, totals
- Discounts and markups (percentage and amount)
- VAT rates per line item
- Product codes (EAN, internal, etc.)
- Service periods (start/end dates)
- Cross-border customs information

#### Payment Information
- Payment conditions (TP01-TP03)
- Payment methods (MP01-MP22)
- Bank details (IBAN, BIC, bank name)
- Installment schedules
- Early payment discounts and late penalties

#### References & Additional Data
- CIG (tender codes) and CUP (project codes) for PA
- Order numbers and contract references
- Transport and delivery information
- Digital signature details
- Attachments and notes

### Usage Examples

#### Basic FatturaPA Extraction
```sh
# Extract Italian domestic invoice
npx ai-invoice-extractor -k sk-key fattura-domestica.pdf

# Extract cross-border invoice (German supplier to Italian customer)
npx ai-invoice-extractor -k sk-key fattura-crossborder.pdf

# Extract with pretty formatting
npx ai-invoice-extractor -k sk-key -p fattura.pdf
```

#### Programmatic Usage
```javascript
import { Extractor } from 'ai-invoice-extractor';
import { FatturapaXmlExporter, FatturapaJsonExporter } from 'ai-invoice-extractor/exporters';

// Extract invoice data
const extractor = Extractor.create({
  vendor: 'openai',
  model: 'gpt-4o',
  apiKey: 'sk-your-key'
});

const invoiceData = await extractor.analyseFile({
  path: 'fattura.pdf',
  prompt: 'EXTRACT_INVOICE_FATTURAPA',
  output: fatturapaInvoiceSchema
});

// Export to XML (SDI-compliant)
const xmlExporter = new FatturapaXmlExporter({
  formatOutput: true,
  validateRequired: true
});
const xml = xmlExporter.export(invoiceData);

// Export to JSON (structured)
const jsonExporter = new FatturapaJsonExporter({
  includeMetadata: true,
  cleanNullValues: true
});
const json = jsonExporter.export(invoiceData);

// Export for validation
const validationJson = jsonExporter.exportForValidation(invoiceData);
```

#### XML Output Sample
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ns2:FatturaElettronica versione="FPR12" xmlns:ns2="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>12345678901</IdCodice>
      </IdTrasmittente>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>IT12345678901</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>Tech Solutions S.r.l.</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
    </CedentePrestatore>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>2024-03-15</Data>
        <Numero>INV-2024-001</Numero>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <!-- ... more XML content ... -->
  </FatturaElettronicaBody>
</ns2:FatturaElettronica>
```

#### JSON Output Sample
```json
{
  "header": {
    "transmission": {
      "sender_country": "IT",
      "sender_code": "IT12345678901",
      "format": "FPR12"
    },
    "supplier": {
      "identification": {
        "vat_id": "IT12345678901",
        "tax_id": "12345678901"
      },
      "legal_info": {
        "name": "Tech Solutions S.r.l."
      },
      "address": {
        "street": "Via Roma",
        "city": "Milano",
        "postal_code": "20121",
        "province": "MI",
        "country": "IT"
      }
    }
  },
  "body": {
    "general_data": {
      "document_type": "TD01",
      "currency": { "code": "EUR" },
      "date": "2024-03-15",
      "number": "INV-2024-001",
      "totals": {
        "taxable_amount": 1000.00,
        "vat_amount": 220.00,
        "total_amount": 1220.00
      }
    },
    "line_items": [
      {
        "line_number": 1,
        "description": "Servizi di consulenza IT",
        "quantity": 1,
        "unit_price": 1000.00,
        "total_price": 1000.00,
        "vat": {
          "rate": 22.00,
          "amount": 220.00
        }
      }
    ]
  }
}
```

### Validation & Compliance

The XML exporter generates output that is:
- ✅ **SDI Compliant:** Validates against Italian Sistema di Interscambio
- ✅ **Schema Valid:** Follows FatturaPA XSD 1.2.1 specification  
- ✅ **Tax Authority Ready:** Can be submitted directly to Agenzia delle Entrate
- ✅ **Cross-Border Ready:** Handles TD17-TD19 scenarios correctly

### Examples & Testing

The repository includes comprehensive examples:
- `examples/fatturapa/domestic-invoice-sample.json` - Italian domestic invoice (TD01)
- `examples/fatturapa/crossborder-invoice-sample.json` - Cross-border invoice (TD18)
- Complete test suite with 15+ scenarios covering all document types

## Contributing 

We use [Bun](https://bun.sh/) instead of npm:

```sh
bun install
bun run src/cli.ts -h                                          # run the CLI and get help
bun run src/cli.ts -k [openai-api-key] examples/receipt.png    # run the CLI and get invoice data with openai
```

If you are on Windows, consider using bun@1.2.5 as we know there is no problem.

## Copyright

&copy; [WellApp][wellapp] - Under [MIT license][license].

[wellapp]: https://extract.wellapp.ai/
[license]: ./LICENSE
