# Well App AI - Contribute Building Operators that Conquer the International Invoice Infrastructure 

> You don't have to waste time retrieving invoices. AI can.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/opeojlhedogedjbonianohhoijlgknna.svg)](https://chrome.google.com/webstore/detail/opeojlhedogedjbonianohhoijlgknna)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features & Benefits](#features--benefits)
- [Use Cases](#use-cases)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [MCP Integration](#mcp-integration)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Roadmap](#roadmap)
- [FAQ](#faq)

---

## Overview

**Well is the Chrome extension that becomes every founder's best friend when accounting season hits.**

It automates supplier invoice retrieval and pipes the data directly into your accounting tools, ERP, or dashboards — with zero effort.

Built for founders, solo operators, and lean teams, Well replaces hours of repetitive clicking, dragging, chasing, and copy-pasting. What used to eat up days across tax seasons now takes one click.

At its core, Well is a **Chrome extension** that automates browser workflows on your behalf — boosting productivity when batch-retrieving invoices. You can also use it on the go: as you browse, Well catches invoices for you.

**Features include:**
- WhatsApp and email ingestion
- Google Drive and Slack integrations
- AI-generated workflow blueprints
- Self-healing automations that adapt to changes
- Multi-format export support (JSON, CSV, XML, UBL, QuickBooks, Xero)
- Built-in validation for invoice data integrity
- Extensible plugin system for custom formats
- Compatibility with e-invoicing standards including Factur-X and UBL 2.1

We believe invoice exchange should follow a universal protocol: instant, standardized, and automated. You shouldn't have to think about it. With Well, you won't.

---

## Features & Benefits

- **100,000+ web portals covered**  
  From the most-used SaaS, utilities, and e-commerce platforms to long-tail portals you thought no one could automate.

- **Omnichannel capture**  
  Collect invoices from Gmail, WhatsApp, PDFs, and more — in real time.

- **Works with your stack**  
  Seamlessly connects to your accounting tools, ERP, CRM, and spreadsheets — no extra setup.

- **Self-healing workflows**  
  Well adapts on the fly when supplier interfaces change.

- **Privacy-first by design**  
  No passwords stored. Fully compliant with GDPR and CCPA.

- **Export Formats**
  Well supports exporting invoice data to multiple formats:

  | Format | Description | Best For |
  |--------|-------------|----------|
  | **JSON** | Standard JSON format | APIs, Web Apps |
  | **CSV** | Comma-separated values | Spreadsheets, Data Analysis |
  | **XML** | Standard XML format | Enterprise Systems |
  | **UBL** | Universal Business Language 2.1 | International e-Invoicing |
  | **QuickBooks** | IIF format | QuickBooks Desktop |
  | **Xero** | Xero-compatible CSV | Xero Accounting |

- **Data Validation**
  - Automatic validation of required fields
  - Type checking for amounts and dates
  - Extensible validation rules
  - Clear error messages for data issues

---

## Use Cases

- **Founder on the move**  
  One click, zero effort — Well retrieves invoices from emails, browsers, or WhatsApp.

- **Operator prepping for month-end**  
  Pull 50+ invoices from 15+ portals in under 5 minutes — no mental load.

- **Finance lead applying the 5S mindset**  
  Enforce structure at the source: sort, shine, sustain — and automate.

- **Manager tracking team budgets**  
  Monitor vendor spend in real time, catch budget drift, and uncover savings.

- **Accountant building a clean audit trail**  
  Substantiate expenses for tax time with complete, standardized records.

---

## How It Works

### Basic Usage

```python
from exporters import get_exporter

# Get an exporter instance
exporter = get_exporter('json')  # or 'csv', 'xml', 'ubl', 'quickbooks', 'xero'

# Export data
data = {
    'invoice_number': 'INV-1234',
    'date': '2025-07-29',
    'amount': 199.99,
    'customer': 'Acme Corp',
    # ... other fields
}

exporter.export(data, 'invoice.json')
```

### Required Fields
All invoices must include these required fields:
- `invoice_number` (str): Unique identifier for the invoice
- `date` (str): Invoice date in YYYY-MM-DD format
- `amount` (float): Total invoice amount (must be positive)
- `customer` (str): Name of the customer

1. **Browse our provider gallery**  
   Visit [wellapp.ai/providers](http://wellapp.ai/providers) to explore thousands of supported portals.

2. **Launch the Chrome extension**  
   Install and pin the extension. One click to launch invoice retrieval.

3. **Auto-detect invoices as you browse**  
   Well's AI suggests retrieval when it sees a paid invoice.

4. **Batch-retrieve during tax season**  
   Run large-scale retrievals in a few clicks.

5. **Generate new blueprints with AI**  
   Use Contributor Mode to teach Well new workflows without code.

6. **Let it self-heal**  
   When a portal changes, Well adapts — no manual fixes needed.

---

## Installation

1. Install from the [Chrome Web Store](https://chrome.google.com/webstore/detail/opeojlhedogedjbonianohhoijlgknna).
2. Pin the extension to your toolbar.
3. Log in to start syncing with your accounting tools.

---

## MCP Integration

Connect your AI assistant to Well using the **Model Context Protocol (MCP)**.

Query your invoices, companies, and contacts directly from Claude, Cursor, Windsurf, or ChatGPT.

### Quick Start

```
https://api.wellapp.ai/v1/mcp
```

Add this URL to your MCP client and authenticate with your Well account.

### Documentation

- [MCP Overview](./docs/mcp/README.md)
- [Quickstart Guide](./docs/mcp/QUICKSTART.md)
- [Client Setup](./docs/mcp/CLIENTS.md) - Claude, Cursor, Windsurf, VS Code
- [Tools Reference](./docs/mcp/TOOLS.md)
- [Troubleshooting](./docs/mcp/TROUBLESHOOTING.md)

### Available Tools

| Tool | Description |
|------|-------------|
| `well_get_schema` | Discover available data types and fields |
| `well_query_records` | Query invoices, companies, people, documents |
| `well_create_company` | Create a new company |
| `well_create_person` | Create a new contact |

For full documentation, visit [docs.wellapp.ai/mcp](https://docs.wellapp.ai/mcp)

---

## Extending Well

### Adding New Export Formats

1. Create a new Python file in the `exporters` directory
2. Create a class that inherits from `BaseExporter`
3. Implement the `_export` method
4. Add the `@ExporterFactory.register()` decorator

Example:

```python
from .base_exporter import BaseExporter
from .exporter_factory import ExporterFactory

@ExporterFactory.register("myformat")
class MyFormatExporter(BaseExporter):
    """Exports invoice data to MyFormat."""
    
    def _export(self, data: dict, output_path: str) -> None:
        with open(output_path, 'w') as f:
            f.write(f"MyFormat: {data['invoice_number']}")
```

## Contributing

We welcome contributions from the community. To propose a fix, feature, or improvement:

- Open a pull request
- Submit an issue
- Or contribute a new blueprint via Contributor Mode

Please review our [CONTRIBUTING.md](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## Acknowledgments

Thanks to all contributors and early users who helped shape Well. Special thanks to the open source libraries and protocols that made this possible.

---

## Roadmap

- [ ] Launch public beta
- [ ] Expand support to 200K+ portals
- [ ] Add mobile retrieval assistant
- [ ] Enable Zapier and Make integrations
- [ ] Build a contributor leaderboard

---

## FAQ

**Q: Is my data safe with Well?**  
A: Yes. We store no passwords, follow strict encryption standards, and comply with GDPR and CCPA.

**Q: Can I use Well outside Chrome?**  
A: Currently, Well is available as a Chrome extension. Other browsers may be supported in the future.

**Q: How do I add a new portal?**  
A: Use Contributor Mode to guide the AI through your workflow. A blueprint is generated instantly.
