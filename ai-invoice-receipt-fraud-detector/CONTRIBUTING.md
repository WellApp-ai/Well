# 🤝 Contributing to AI invoice receipt fraud detector

Thanks for your interest in improving this project! This document covers how the codebase is structured, how to set it up locally, and how to contribute effectively.

---

## 📦 Project Overview

This is a monorepo TypeScript project using [pnpm workspaces](https://pnpm.io/workspaces).

```
oss-invoice-detector/
├── packages/
│   ├── core       # Detection engine, analysis logic
│   ├── types      # Shared interfaces (DetectionResult, DocumentInput)
│   ├── models     # LLM adapters (OpenAI, Mistral…)
│   ├── cli        # Command-line interface (CLI tool)
│   └── samples    # Sample documents to test with
├── .env           # API keys for LLMs (not committed)
```

---

## 🚀 Setup Instructions

### 1. Install dependencies

```bash
pnpm install
```

> Requires `pnpm` and Node.js 20+

### 2. Build all packages

```bash
pnpm run build
```

This runs a clean and full `tsc -b` build for all sub-packages.

---

## 3. 📁 Insert the file

file to analyze location : packages/samples

---

### 4. Run the CLI

```bash
pnpm run analyze --file example.pdf
```

Optional:

```bash
pnpm run analyze --file example.pdf --output result.json
```

---

## 🧪 Local Development Scripts

| Script            | Description                              |
|------------------|------------------------------------------|
| `pnpm run build`  | Clean + build all packages               |
| `pnpm run clean`  | Delete all `dist/` folders + build info  |
| `pnpm run analyze`| Run the CLI locally                      |

---

## 🧠 LLM Adapter System

LLMs are handled through `useLLMBackend()` and custom adapters.

### Adding a New LLM Provider

1. Create a file under `packages/models/src/` named `your_provider_generator.ts`
2. Implement the `LLMBackend` interface:

```ts
import type { LLMBackend } from './base';
import type { DetectionResult } from '@fraud-detector/types';

export const yourBackend: LLMBackend = {
  name: 'your-provider',
  async generate(prompt: string): Promise<DetectionResult> {
    // Make API call to your LLM and return DetectionResult
  }
}
```

3. Register it in `llm.ts` inside `useLLMBackend()`:

```ts
if (type === 'your-provider') {
  currentLLM = yourBackend;
}
```

---

## 🧪 Output Format

All detections return a `DetectionResult`:

```ts
interface DetectionResult {
  is_fake: boolean;
  confidence: number; // 0–100
  indicators: Array<{
    category: 'visual' | 'textual' | 'metadata' | 'behavioral' | 'ai_generated';
    value: string;
    description: string;
  }>;
}
```

Defined in:  
- `packages/types/src/DetectionResult.ts`  
- `packages/types/schemas/detection-result.schema.json`

---

## 📜 TypeScript Guidelines

- Each package is `composite: true` and has its own `tsconfig.json`
- Import other packages via `@fraud-detector/...`
- Build order is enforced via `references` in `tsconfig`

---

## 🔐 .env Setup

Create a `.env` file at the root with:

```
OPENAI_API_KEY=sk-...
```

> Only needed if using OpenAI or other LLM adapters

---

## 💬 Questions?

Open an issue or start a discussion in the repo if you get stuck!

---

Thanks again for contributing ❤️

