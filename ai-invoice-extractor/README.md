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
- 🔧 Set AI keys with CLI and environment variables
- ⭐ Pretty print the output
- 🔄 Pipe output with other CLI

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
  -v, --vendor [vendor]    AI vendor
  -m, --model [model]      AI model
  -k, --key [key]          AI key
  -f, --format [format]    Extraction format: basic, facturx, fatturapa (default: basic)
  -o, --output [output]    Output format: json, xml (for fatturapa) (default: json)
  -p, --pretty             Output pretty JSON (default: false)
  -h, --help               display help for command
```

### CLI Options Reference

| Flag | Long Form | Type | Required | Default | Description | Example |
|------|-----------|------|----------|---------|-------------|---------|
| `-v` | `--vendor` | string | No | `openai` | AI vendor to use | `-v mistral` |
| `-m` | `--model` | string | No | Vendor default | AI model to use | `-m gpt-4o` |
| `-k` | `--key` | string | Yes* | - | AI API key | `-k sk-123...` |
| `-f` | `--format` | string | No | `basic` | Extraction format | `-f fatturapa` |
| `-o` | `--output` | string | No | `json` | Output format (XML for FatturaPA) | `-o xml` |
| `-p` | `--pretty` | boolean | No | `false` | Pretty print JSON output | `-p` |
| `-h` | `--help` | - | No | - | Display help information | `-h` |

**\* Required unless provided via environment variable**

#### Extraction Formats

| Format | Description | Output | Use Case |
|--------|-------------|---------|----------|
| `basic` | Simple invoice extraction | JSON | General invoice/receipt processing |
| `facturx` | Factur-X/EN 16931 compliant | JSON | European e-invoicing standard |
| `fatturapa` | Italian FatturaPA compliant | JSON/XML | Italian B2B/B2PA electronic invoicing |

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

#### Extraction Formats
```sh
# Basic invoice extraction (default)
npx ai-invoice-extractor -k sk-key invoice.pdf

# Factur-X compliant extraction
npx ai-invoice-extractor -f facturx -k sk-key invoice.pdf

# Italian FatturaPA extraction (JSON output)
npx ai-invoice-extractor -f fatturapa -k sk-key invoice.pdf

# Italian FatturaPA extraction (XML output)
npx ai-invoice-extractor -f fatturapa -o xml -k sk-key invoice.pdf
```

#### Italian FatturaPA Examples
```sh
# Extract Italian domestic invoice as JSON
npx ai-invoice-extractor -f fatturapa -k sk-key italian-invoice.pdf

# Extract cross-border EU invoice as FatturaPA XML
npx ai-invoice-extractor -f fatturapa -o xml -k sk-key eu-invoice.pdf

# Extract with pretty formatting
npx ai-invoice-extractor -f fatturapa -p -k sk-key invoice.pdf

# Save FatturaPA XML to file
npx ai-invoice-extractor -f fatturapa -o xml -k sk-key invoice.pdf > fattura.xml
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

### Italian E-Invoicing (FatturaPA) Support

This tool provides full support for Italian electronic invoicing (FatturaPA) with comprehensive field extraction and compliant XML output.

#### FatturaPA Features
- **Complete field coverage**: All required and optional FatturaPA fields
- **Document type detection**: Automatic TD01/TD17/TD18/TD19 classification
- **Cross-border support**: Handles intra-EU and San Marino transactions
- **XML compliance**: Generates valid FatturaPA XML for SDI submission
- **Structured JSON**: Clean JSON format for API integration

#### Document Types
- **TD01**: Standard commercial invoice (domestic Italy)
- **TD17**: Integration invoice for intra-EU purchases
- **TD18**: Integration invoice for goods from San Marino
- **TD19**: Integration invoice for services from San Marino

#### Supported FatturaPA Fields
- Header/transmission data (progressive code, recipient, country)
- Complete supplier/customer details (fiscal codes, VAT numbers, addresses)
- Line items with VAT rates and nature codes
- Tax summaries (VAT, withholding, social security)
- Payment details (terms, methods, bank details)
- References (CIG/CUP codes, purchase orders)
- Attachments and additional information

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
