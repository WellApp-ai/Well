import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import type { Mock } from 'bun:test';
import { z } from 'zod';
import {
	BaseExtractor,
	Extractor,
	OpenAIExtractor,
	MistralExtractor,
	AnthropicExtractor,
	GoogleExtractor,
	OllamaExtractor,
} from '@/extractors/extractor';
import { invoiceOutputSchema } from '@/prompts/extract-invoice.prompt';
import { invoiceFacturxOutputSchema } from '@/prompts/extract-invoice-facturx.prompt';
import type { AiConfig } from '@/types';
import { APICallError, NoObjectGeneratedError } from 'ai';

// Mock implementations
const mockGenerateObject = mock(() => Promise.resolve({ object: {} }));
const mockFileUtils = {
	getMetadata: mock(() => ({
		filename: 'test.pdf',
		mimeType: 'application/pdf',
		fileType: 'file',
	})),
	readFile: mock(() => Promise.resolve(Buffer.from('test content'))),
};
const mockLogger = {
	info: mock(() => {}),
	debug: mock(() => {}),
	error: mock(() => {}),
};

// Mock AI SDKs
const mockCreateOpenAI = mock(() =>
	mock(() => ({ provider: 'openai', modelId: 'gpt-4' }))
);
const mockCreateMistral = mock(() =>
	mock(() => ({ provider: 'mistral', modelId: 'mistral-large' }))
);
const mockCreateAnthropic = mock(() =>
	mock(() => ({ provider: 'anthropic', modelId: 'claude-3-opus' }))
);
const mockCreateGoogle = mock(() =>
	mock(() => ({ provider: 'google', modelId: 'gemini-pro' }))
);
const mockCreateOllama = mock(() =>
	mock(() => ({ provider: 'ollama', modelId: 'llama2' }))
);

describe('Extractor Unit Tests', () => {
	let mockModel: any;
	let mockGenerateObject: any;

	beforeEach(() => {
		// Reset all mocks
		// Mock setup for Bun test environment

		// Mock the language model
		mockModel = {
			provider: 'openai',
			modelId: 'gpt-4',
		};

		// Mock generateObject function with Bun mock
		mockGenerateObject = mock();
		const aiModule = require('ai');
		aiModule.generateObject = mockGenerateObject;
	});

	afterEach(() => {
		// Cleanup mocks for Bun test
	});

	describe('BaseExtractor', () => {
		class TestExtractor extends BaseExtractor {
			constructor() {
				super(mockModel);
			}
		}

		let extractor: TestExtractor;

		beforeEach(() => {
			extractor = new TestExtractor();

			// Mock FileUtils
			const FileUtils = require('@/utils/file').FileUtils;
			FileUtils.getMetadata = jest.fn().mockReturnValue({
				filename: 'test-invoice.pdf',
				mimeType: 'application/pdf',
				fileType: 'file',
			});
			FileUtils.readFile = jest
				.fn()
				.mockResolvedValue(Buffer.from('mock pdf content'));
		});

		test('should successfully analyze a PDF file', async () => {
			const expectedResult = {
				invoice_number: { value: 'INV-001', confidence: 0.95 },
				total_amount: { value: 100.5, confidence: 0.9 },
			};

			mockGenerateObject.mockResolvedValue({ object: expectedResult });

			const result = await extractor.analyseFile({
				path: '/test/invoice.pdf',
				prompt: 'EXTRACT_INVOICE',
				output: invoiceOutputSchema,
			});

			expect(result).toEqual(expectedResult);
			expect(mockGenerateObject).toHaveBeenCalledWith({
				model: mockModel,
				schema: invoiceOutputSchema,
				system: expect.any(String),
				messages: expect.arrayContaining([
					{
						role: 'user',
						content: expect.arrayContaining([
							{
								type: 'file',
								data: expect.any(URL),
								mimeType: 'application/pdf',
								filename: 'test-invoice.pdf',
							},
						]),
					},
				]),
			});
		});

		test('should successfully analyze an image file', async () => {
			const FileUtils = require('@/utils/file').FileUtils;
			FileUtils.getMetadata.mockReturnValue({
				filename: 'receipt.png',
				mimeType: 'image/png',
				fileType: 'image',
			});

			const expectedResult = {
				document_type: { value: 'receipt', confidence: 0.88 },
				supplier: { name: { value: 'Coffee Shop', confidence: 0.92 } },
			};

			mockGenerateObject.mockResolvedValue({ object: expectedResult });

			const result = await extractor.analyseFile({
				path: '/test/receipt.png',
				prompt: 'EXTRACT_INVOICE',
				output: invoiceOutputSchema,
			});

			expect(result).toEqual(expectedResult);
			expect(mockGenerateObject).toHaveBeenCalledWith({
				model: mockModel,
				schema: invoiceOutputSchema,
				system: expect.any(String),
				messages: expect.arrayContaining([
					{
						role: 'user',
						content: expect.arrayContaining([
							{
								type: 'image',
								image: expect.any(URL),
								mimeType: 'image/png',
							},
						]),
					},
				]),
			});
		});

		test('should handle text files correctly', async () => {
			const FileUtils = require('@/utils/file').FileUtils;
			FileUtils.getMetadata.mockReturnValue({
				filename: 'invoice.txt',
				mimeType: 'text/plain',
				fileType: 'text',
			});
			FileUtils.readFile.mockResolvedValue(Buffer.from('Invoice text content'));

			const expectedResult = { parsed: 'text result' };
			mockGenerateObject.mockResolvedValue({ object: expectedResult });

			const result = await extractor.analyseFile({
				path: '/test/invoice.txt',
				prompt: 'EXTRACT_INVOICE',
				output: invoiceOutputSchema,
			});

			expect(result).toEqual(expectedResult);
			expect(mockGenerateObject).toHaveBeenCalledWith({
				model: mockModel,
				schema: invoiceOutputSchema,
				system: expect.any(String),
				prompt: 'Invoice text content',
			});
		});

		test('should throw error for unsupported file types', async () => {
			const FileUtils = require('@/utils/file').FileUtils;
			FileUtils.getMetadata.mockReturnValue({
				filename: 'document.doc',
				mimeType: 'application/msword',
				fileType: 'unsupported',
			});

			await expect(
				extractor.analyseFile({
					path: '/test/document.doc',
					prompt: 'EXTRACT_INVOICE',
					output: invoiceOutputSchema,
				})
			).rejects.toThrow('Only image, text and PDF files are supported.');
		});

		test('should handle APICallError correctly', async () => {
			const apiError = new APICallError({
				message: 'Rate limit exceeded',
				url: 'https://api.openai.com',
				requestBodyValues: {},
				statusCode: 429,
				responseHeaders: {},
				responseBody: 'Too many requests',
			});

			mockGenerateObject.mockRejectedValue(apiError);

			await expect(
				extractor.analyseFile({
					path: '/test/invoice.pdf',
					prompt: 'EXTRACT_INVOICE',
					output: invoiceOutputSchema,
				})
			).rejects.toThrow(
				'AI_API_CALL_ERROR: openai:gpt-4 returned: Rate limit exceeded'
			);
		});

		test('should handle NoObjectGeneratedError correctly', async () => {
			const noObjectError = new NoObjectGeneratedError({
				text: 'Unable to parse response',
				cause: 'Invalid JSON',
			});

			mockGenerateObject.mockRejectedValue(noObjectError);

			await expect(
				extractor.analyseFile({
					path: '/test/invoice.pdf',
					prompt: 'EXTRACT_INVOICE',
					output: invoiceOutputSchema,
				})
			).rejects.toThrow('openai:gpt-4 returned: Unable to parse response');
		});

		test('should handle generic errors correctly', async () => {
			const genericError = new Error('Network timeout');
			mockGenerateObject.mockRejectedValue(genericError);

			await expect(
				extractor.analyseFile({
					path: '/test/invoice.pdf',
					prompt: 'EXTRACT_INVOICE',
					output: invoiceOutputSchema,
				})
			).rejects.toThrow('openai:gpt-4 returned: Network timeout');
		});

		test('should use custom prompt when provided', async () => {
			const customPrompt = 'Extract only the total amount from this invoice';
			const expectedResult = { total: 123.45 };

			mockGenerateObject.mockResolvedValue({ object: expectedResult });

			await extractor.analyseFile({
				path: '/test/invoice.pdf',
				prompt: customPrompt,
				output: invoiceOutputSchema,
			});

			expect(mockGenerateObject).toHaveBeenCalledWith({
				model: mockModel,
				schema: invoiceOutputSchema,
				system: customPrompt,
				messages: expect.any(Array),
			});
		});
	});

	describe('Extractor Factory', () => {
		test('should create OpenAI extractor', () => {
			const config: AiConfig = {
				vendor: 'openai',
				model: 'gpt-4',
				apiKey: 'sk-test-key',
			};

			const extractor = Extractor.create(config);
			expect(extractor).toBeInstanceOf(OpenAIExtractor);
		});

		test('should create Mistral extractor', () => {
			const config: AiConfig = {
				vendor: 'mistral',
				model: 'mistral-large',
				apiKey: 'test-key',
			};

			const extractor = Extractor.create(config);
			expect(extractor).toBeInstanceOf(MistralExtractor);
		});

		test('should create Anthropic extractor', () => {
			const config: AiConfig = {
				vendor: 'anthropic',
				model: 'claude-3-opus-20240229',
				apiKey: 'sk-ant-test',
			};

			const extractor = Extractor.create(config);
			expect(extractor).toBeInstanceOf(AnthropicExtractor);
		});

		test('should create Google extractor', () => {
			const config: AiConfig = {
				vendor: 'google',
				model: 'gemini-pro',
				apiKey: 'test-key',
			};

			const extractor = Extractor.create(config);
			expect(extractor).toBeInstanceOf(GoogleExtractor);
		});

		test('should create Ollama extractor', () => {
			const config: AiConfig = {
				vendor: 'ollama',
				model: 'llama2',
				apiKey: 'test-key',
			};

			const extractor = Extractor.create(config);
			expect(extractor).toBeInstanceOf(OllamaExtractor);
		});

		test('should throw error for unsupported vendor', () => {
			const config = {
				vendor: 'unsupported',
				model: 'test-model',
				apiKey: 'test-key',
			} as any;

			expect(() => Extractor.create(config)).toThrow(
				'Unsupported vendor: unsupported'
			);
		});
	});

	describe('Vendor-specific Extractors', () => {
		test('should create OpenAI extractor with correct configuration', () => {
			const openaiMock = require('@ai-sdk/openai');
			const mockOpenaiProvider = jest.fn().mockReturnValue(mockModel);
			openaiMock.createOpenAI = jest.fn().mockReturnValue(mockOpenaiProvider);

			const extractor = new OpenAIExtractor('gpt-4', 'sk-test-key');

			expect(openaiMock.createOpenAI).toHaveBeenCalledWith({
				apiKey: 'sk-test-key',
			});
			expect(mockOpenaiProvider).toHaveBeenCalledWith('gpt-4');
		});

		test('should create Mistral extractor with correct configuration', () => {
			const mistralMock = require('@ai-sdk/mistral');
			const mockMistralProvider = jest.fn().mockReturnValue(mockModel);
			mistralMock.createMistral = jest
				.fn()
				.mockReturnValue(mockMistralProvider);

			const extractor = new MistralExtractor('mistral-large', 'test-key');

			expect(mistralMock.createMistral).toHaveBeenCalledWith({
				apiKey: 'test-key',
			});
			expect(mockMistralProvider).toHaveBeenCalledWith('mistral-large');
		});

		test('should mask API keys in logs', () => {
			const loggerMock = require('@/libs/logger').logger;
			loggerMock.debug = jest.fn();

			new OpenAIExtractor('gpt-4', 'sk-1234567890abcdef');

			expect(loggerMock.debug).toHaveBeenCalledWith(
				expect.stringContaining('sk-123***def')
			);
		});
	});
});
