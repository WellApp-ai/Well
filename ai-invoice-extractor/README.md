<a href="https://wellapp.ai/">
    <img alt="Extract Invoice AI" src="https://github.com/wellapp/extract-invoice-ai/raw/main/assets/header.png" />
</a>

<div align="center">
    <img src="https://img.shields.io/npm/v/ai-invoice-extractor" alt="NPM Version" />
    <img src="https://img.shields.io/github/license/wellapp-ai/well" alt="License" />
    <img src="https://img.shields.io/github/actions/workflow/status/wellapp-ai/well/ai-invoice-extractor-ci" alt="Build Status">
</a>
</div>
<br />
<div align="center"><strong>Extract Receipt & Invoice Data</strong></div>
<div align="center"> Lightweight, customizable and open source.</div>
<br />
<div align="center">
<a href="https://">Website</a> 
<span> · </span>
<a href="https://">X</a>
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

## Docs

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

Use also environment variables instead of `-v`, `-m` and `-k`:
```sh
# EXTRACTOR_VENDOR="openai" # openai (default) | mistral | google | anthropic | ollama
# EXTRACTOR_MODEL="o4-mini" # o4-mini (default with openai)
EXTRACTOR_API_KEY=
```

CLI options override environment variables. For example, if the environment variable is set to 'openai', but you specify 'mistral' or 'anthropic' via the CLI, the selected AI vendor will be 'mistral' or 'anthropic', respectively.

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

[wellapp]: https://wellapp.ai/
[license]: ./LICENSE
