#!/usr/bin/env node

import { analyzeDocument, type DocumentInput } from '@fraud-detector/core';
import { useLLMBackend } from '@fraud-detector/models';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ Missing API KEY. Check your .env file');
  process.exit(1);
}

useLLMBackend('openai', {
  provider: 'openai',
  apiKey,
});

const argv = yargs(hideBin(process.argv))
  .option('file', {
    alias: 'f',
    type: 'string',
    describe: 'name of the file inside packages/samples (PDF, image or JSON)',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    describe: 'JSon file path (optional)',
  })
  .help()
  .argv as unknown as { file: string; output?: string };

async function run() {
  const DEFAULT_DIR = path.resolve(process.cwd(), 'packages/samples');
  const filePath = path.join(DEFAULT_DIR, argv.file);
  const ext = path.extname(argv.file).toLowerCase();

  let input: DocumentInput;

  if (ext === '.pdf' || ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
    input = {
      type: 'file',
      path: filePath,
      mimeType: ext === '.pdf' ? 'application/pdf' : 'image/png',
    };
  } else if (ext === '.json') {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    input = {
      type: 'structured',
      data: json,
    };
  } else {
    console.error('❌ unsupported type file :', ext);
    process.exit(1);
  }

  try {
    const result = await analyzeDocument(input);

    if (argv.output) {
      const outputPath = path.resolve(process.cwd(), argv.output);
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
      console.log(`✅ Result saved : ${outputPath}`);
    } else {
      console.log('\n✅ Analyze result:\n', JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.error('❌ Analyze error :', err);
  }
}

run();
