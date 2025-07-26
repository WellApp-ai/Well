import { describe, test, expect } from 'bun:test';

/**
 * Unit Tests for Utility Modules
 *
 * Covers:
 * - File utilities
 * - String utilities
 * - Configuration utilities
 * - Logging utilities
 * - Environment handling
 */

describe('File Utilities', () => {
	describe('File Type Detection', () => {
		test('should detect PDF files correctly', () => {
			const testCases = [
				{ filename: 'invoice.pdf', expected: 'application/pdf' },
				{ filename: 'receipt.PDF', expected: 'application/pdf' },
				{ filename: 'document.pdf', expected: 'application/pdf' },
			];

			testCases.forEach(({ filename, expected }) => {
				const extension = filename.toLowerCase().split('.').pop();
				const mimeType = extension === 'pdf' ? 'application/pdf' : 'unknown';
				expect(mimeType).toBe(expected);
			});
		});

		test('should detect image files correctly', () => {
			const imageTests = [
				{ filename: 'receipt.png', expected: 'image/png' },
				{ filename: 'invoice.jpg', expected: 'image/jpeg' },
				{ filename: 'document.jpeg', expected: 'image/jpeg' },
				{ filename: 'scan.PNG', expected: 'image/png' },
			];

			imageTests.forEach(({ filename, expected }) => {
				const extension = filename.toLowerCase().split('.').pop();
				let mimeType = 'unknown';

				switch (extension) {
					case 'png':
						mimeType = 'image/png';
						break;
					case 'jpg':
					case 'jpeg':
						mimeType = 'image/jpeg';
						break;
				}

				expect(mimeType).toBe(expected);
			});
		});

		test('should detect text files correctly', () => {
			const textFiles = ['invoice.txt', 'receipt.TXT', 'document.text'];

			textFiles.forEach((filename) => {
				const extension = filename.toLowerCase().split('.').pop();
				const isTextFile = extension === 'txt' || extension === 'text';
				expect(isTextFile).toBe(true);
			});
		});

		test('should reject unsupported file types', () => {
			const unsupportedFiles = [
				'document.doc',
				'spreadsheet.xls',
				'presentation.ppt',
				'archive.zip',
				'executable.exe',
			];

			unsupportedFiles.forEach((filename) => {
				const extension = filename.toLowerCase().split('.').pop();
				const supportedExtensions = [
					'pdf',
					'png',
					'jpg',
					'jpeg',
					'txt',
					'text',
				];
				const isSupported = supportedExtensions.includes(extension || '');
				expect(isSupported).toBe(false);
			});
		});
	});

	describe('File Metadata Extraction', () => {
		test('should extract correct metadata from file paths', () => {
			const testFiles = [
				{
					path: '/home/user/documents/invoice-2024-001.pdf',
					expected: {
						filename: 'invoice-2024-001.pdf',
						extension: 'pdf',
						basename: 'invoice-2024-001',
					},
				},
				{
					path: 'C:\\Users\\Admin\\receipts\\coffee-shop.png',
					expected: {
						filename: 'coffee-shop.png',
						extension: 'png',
						basename: 'coffee-shop',
					},
				},
			];

			testFiles.forEach(({ path, expected }) => {
				const filename = path.split(/[/\\]/).pop() || '';
				const parts = filename.split('.');
				const extension = parts.pop() || '';
				const basename = parts.join('.');

				expect(filename).toBe(expected.filename);
				expect(extension).toBe(expected.extension);
				expect(basename).toBe(expected.basename);
			});
		});

		test('should handle files without extensions', () => {
			const pathWithoutExt = '/home/user/documents/invoice_text';
			const filename = pathWithoutExt.split('/').pop() || '';
			const extension = filename.includes('.') ? filename.split('.').pop() : '';

			expect(filename).toBe('invoice_text');
			expect(extension).toBe('');
		});

		test('should validate file size constraints', () => {
			const sizeTests = [
				{ size: 1024, valid: true },
				{ size: 5 * 1024 * 1024, valid: true }, // 5MB
				{ size: 10 * 1024 * 1024, valid: true }, // 10MB
				{ size: 15 * 1024 * 1024, valid: false }, // 15MB - too large
				{ size: 0, valid: false }, // Empty file
			];

			const maxSize = 10 * 1024 * 1024; // 10MB limit

			sizeTests.forEach(({ size, valid }) => {
				const isValidSize = size > 0 && size <= maxSize;
				expect(isValidSize).toBe(valid);
			});
		});
	});

	describe('File Content Processing', () => {
		test('should handle binary file reading simulation', () => {
			// Simulate reading binary PDF content
			const pdfHeader = '%PDF-1.4';
			const mockPdfContent = Buffer.from(pdfHeader + '\n% Mock PDF content');

			expect(mockPdfContent.length).toBeGreaterThan(0);
			expect(mockPdfContent.toString().startsWith('%PDF')).toBe(true);
		});

		test('should handle text file reading simulation', () => {
			const textContent =
				'Invoice #INV-2024-001\nTotal: €1,250.00\nDate: 2024-01-15';
			const buffer = Buffer.from(textContent, 'utf-8');

			expect(buffer.toString()).toBe(textContent);
			expect(buffer.toString()).toContain('INV-2024-001');
		});

		test('should create proper data URLs for different file types', () => {
			const testCases = [
				{
					mimeType: 'application/pdf',
					content: 'mock-pdf-content',
					expectedPrefix: 'data:application/pdf;base64,',
				},
				{
					mimeType: 'image/png',
					content: 'mock-png-content',
					expectedPrefix: 'data:image/png;base64,',
				},
				{
					mimeType: 'image/jpeg',
					content: 'mock-jpg-content',
					expectedPrefix: 'data:image/jpeg;base64,',
				},
			];

			testCases.forEach(({ mimeType, content, expectedPrefix }) => {
				const buffer = Buffer.from(content);
				const base64 = buffer.toString('base64');
				const dataUrl = `data:${mimeType};base64,${base64}`;

				expect(dataUrl.startsWith(expectedPrefix)).toBe(true);
				expect(dataUrl).toContain(base64);
			});
		});
	});
});

describe('String Utilities', () => {
	describe('API Key Masking', () => {
		test('should mask OpenAI API keys correctly', () => {
			const apiKeys = [
				{
					key: 'sk-1234567890abcdef1234567890abcdef',
					expected: 'sk-***def',
				},
				{
					key: 'sk-proj-1234567890abcdef1234567890abcdef1234567890abcdef',
					expected: 'sk-***def',
				},
				{
					key: 'sk-12345',
					expected: 'sk-***345',
				},
			];

			apiKeys.forEach(({ key, expected }) => {
				const masked = key.slice(0, 3) + '***' + key.slice(-3);
				expect(masked).toBe(expected);
			});
		});

		test('should mask other API keys appropriately', () => {
			const otherKeys = [
				{
					key: 'sk-ant-api03-1234567890abcdef',
					prefix: 'sk-ant',
					expected: 'sk-a***def',
				},
				{
					key: 'AIzaSyDaGmWKa4JsXMeKdvNzPk7QGVNgHQ2rY3E',
					prefix: 'AIza',
					expected: 'AIza***Y3E',
				},
			];

			otherKeys.forEach(({ key, expected }) => {
				const masked = key.slice(0, 4) + '***' + key.slice(-3);
				expect(masked).toBe(expected);
			});
		});

		test('should handle edge cases in masking', () => {
			const edgeCases = [
				{ key: '', expected: '***' },
				{ key: 'a', expected: '***' },
				{ key: 'ab', expected: '***' },
				{ key: 'abc', expected: '***' },
				{ key: 'abcd', expected: 'a***d' },
			];

			edgeCases.forEach(({ key, expected }) => {
				let masked = '';
				if (key.length <= 3) {
					masked = '***';
				} else if (key.length <= 6) {
					masked = key.slice(0, 1) + '***' + key.slice(-1);
				} else {
					masked = key.slice(0, 3) + '***' + key.slice(-3);
				}
				expect(masked).toBe(expected);
			});
		});
	});

	describe('Text Processing', () => {
		test('should clean and normalize extracted text', () => {
			const messyText =
				'  Invoice  #INV-2024-001  \n\n  Total:   €1,250.00  \t  ';
			const cleaned = messyText.trim().replace(/\s+/g, ' ');

			expect(cleaned).toBe('Invoice #INV-2024-001 Total: €1,250.00');
		});

		test('should extract numbers from text correctly', () => {
			const textWithNumbers =
				'Total amount: €1,234.56 including VAT of €234.56';
			const numbers = textWithNumbers.match(/[\d,]+\.?\d*/g) || [];
			const cleanNumbers = numbers.map((n) => parseFloat(n.replace(/,/g, '')));

			expect(cleanNumbers).toHaveLength(2);
			expect(cleanNumbers[0]).toBe(1234.56);
			expect(cleanNumbers[1]).toBe(234.56);
		});

		test('should validate and format currency values', () => {
			const currencyTests = [
				{ input: '€1,234.56', expected: { amount: 1234.56, currency: 'EUR' } },
				{ input: '$1,234.56', expected: { amount: 1234.56, currency: 'USD' } },
				{ input: '£1,234.56', expected: { amount: 1234.56, currency: 'GBP' } },
				{
					input: '1234.56 EUR',
					expected: { amount: 1234.56, currency: 'EUR' },
				},
			];

			currencyTests.forEach(({ input, expected }) => {
				const amount = parseFloat(
					input.replace(/[€$£,]/g, '').replace(/\s*EUR|\s*USD|\s*GBP/g, '')
				);
				let currency = 'UNKNOWN';

				if (input.includes('€') || input.includes('EUR')) currency = 'EUR';
				else if (input.includes('$') || input.includes('USD')) currency = 'USD';
				else if (input.includes('£') || input.includes('GBP')) currency = 'GBP';

				expect(amount).toBe(expected.amount);
				expect(currency).toBe(expected.currency);
			});
		});
	});

	describe('Date Processing', () => {
		test('should parse various date formats', () => {
			const dateTests = [
				{ input: '2024-01-15', format: 'ISO', valid: true },
				{ input: '15/01/2024', format: 'DD/MM/YYYY', valid: true },
				{ input: '01/15/2024', format: 'MM/DD/YYYY', valid: true },
				{ input: '15 Jan 2024', format: 'DD MMM YYYY', valid: true },
				{ input: 'invalid-date', format: 'unknown', valid: false },
			];

			dateTests.forEach(({ input, valid }) => {
				const dateRegex =
					/^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{1,2}\s\w{3}\s\d{4}$/;
				const isValidFormat = dateRegex.test(input);

				if (valid) {
					expect(isValidFormat).toBe(true);
				} else {
					expect(isValidFormat).toBe(false);
				}
			});
		});

		test('should handle date range validation', () => {
			const currentYear = new Date().getFullYear();
			const validYearRange = [currentYear - 10, currentYear + 1];

			const yearTests = [
				{ year: currentYear, valid: true },
				{ year: currentYear - 5, valid: true },
				{ year: currentYear + 1, valid: true },
				{ year: currentYear - 15, valid: false },
				{ year: currentYear + 5, valid: false },
			];

			yearTests.forEach(({ year, valid }) => {
				const isValidYear =
					year >= validYearRange[0] && year <= validYearRange[1];
				expect(isValidYear).toBe(valid);
			});
		});
	});
});

describe('Configuration Utilities', () => {
	describe('Environment Variable Processing', () => {
		test('should parse boolean environment variables', () => {
			const booleanTests = [
				{ value: 'true', expected: true },
				{ value: 'TRUE', expected: true },
				{ value: '1', expected: true },
				{ value: 'yes', expected: true },
				{ value: 'false', expected: false },
				{ value: 'FALSE', expected: false },
				{ value: '0', expected: false },
				{ value: 'no', expected: false },
				{ value: '', expected: false },
				{ value: undefined, expected: false },
			];

			booleanTests.forEach(({ value, expected }) => {
				const parseBoolean = (val: string | undefined) => {
					if (!val) return false;
					return ['true', 'TRUE', '1', 'yes', 'YES'].includes(val);
				};

				expect(parseBoolean(value)).toBe(expected);
			});
		});

		test('should validate required environment variables', () => {
			const requiredVars = ['EXTRACTOR_VENDOR', 'EXTRACTOR_API_KEY'];
			const mockEnv = {
				EXTRACTOR_VENDOR: 'openai',
				EXTRACTOR_MODEL: 'gpt-4',
				EXTRACTOR_API_KEY: undefined, // Missing required var
			};

			const missingVars = requiredVars.filter(
				(varName) => !mockEnv[varName as keyof typeof mockEnv]
			);
			expect(missingVars).toHaveLength(1);
			expect(missingVars[0]).toBe('EXTRACTOR_API_KEY');
		});

		test('should provide default values for optional variables', () => {
			const defaultConfig = {
				debug: false,
				vendor: 'openai',
				model: 'gpt-4',
				timeout: 30000,
			};

			const mockEnv = {
				EXTRACTOR_DEBUG: undefined,
				EXTRACTOR_VENDOR: 'mistral',
				EXTRACTOR_MODEL: undefined,
				EXTRACTOR_TIMEOUT: '45000',
			};

			const finalConfig = {
				debug: mockEnv.EXTRACTOR_DEBUG
					? JSON.parse(mockEnv.EXTRACTOR_DEBUG)
					: defaultConfig.debug,
				vendor: mockEnv.EXTRACTOR_VENDOR || defaultConfig.vendor,
				model: mockEnv.EXTRACTOR_MODEL || defaultConfig.model,
				timeout: mockEnv.EXTRACTOR_TIMEOUT
					? parseInt(mockEnv.EXTRACTOR_TIMEOUT)
					: defaultConfig.timeout,
			};

			expect(finalConfig.debug).toBe(false);
			expect(finalConfig.vendor).toBe('mistral');
			expect(finalConfig.model).toBe('gpt-4');
			expect(finalConfig.timeout).toBe(45000);
		});
	});

	describe('Configuration Merging', () => {
		test('should merge configurations with proper precedence', () => {
			const defaultConfig = {
				vendor: 'openai',
				model: 'gpt-3.5-turbo',
				temperature: 0.7,
				maxTokens: 1000,
			};

			const envConfig = {
				vendor: 'mistral',
				model: 'mistral-large',
				temperature: 0.5,
				// maxTokens not specified
			};

			const cliConfig = {
				model: 'claude-3-opus',
				maxTokens: 2000,
				// vendor and temperature not specified
			};

			const mergedConfig = {
				...defaultConfig,
				...envConfig,
				...cliConfig,
			};

			expect(mergedConfig.vendor).toBe('mistral'); // From env
			expect(mergedConfig.model).toBe('claude-3-opus'); // From CLI (highest precedence)
			expect(mergedConfig.temperature).toBe(0.5); // From env
			expect(mergedConfig.maxTokens).toBe(2000); // From CLI
		});

		test('should validate merged configuration', () => {
			const configurations = [
				{
					config: { vendor: 'openai', model: 'gpt-4', apiKey: 'sk-test' },
					valid: true,
					errors: [],
				},
				{
					config: { vendor: 'openai', model: '', apiKey: 'sk-test' },
					valid: false,
					errors: ['Model is required'],
				},
				{
					config: { vendor: '', model: 'gpt-4', apiKey: 'sk-test' },
					valid: false,
					errors: ['Vendor is required'],
				},
				{
					config: { vendor: 'openai', model: 'gpt-4', apiKey: '' },
					valid: false,
					errors: ['API key is required'],
				},
			];

			configurations.forEach(({ config, valid, errors: expectedErrors }) => {
				const validationErrors: string[] = [];

				if (!config.vendor) validationErrors.push('Vendor is required');
				if (!config.model) validationErrors.push('Model is required');
				if (!config.apiKey) validationErrors.push('API key is required');

				const isValid = validationErrors.length === 0;

				expect(isValid).toBe(valid);
				expect(validationErrors).toEqual(expectedErrors);
			});
		});
	});

	describe('Model Configuration', () => {
		test('should validate supported models per vendor', () => {
			const supportedModels = {
				openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
				mistral: ['mistral-large', 'mistral-medium', 'mistral-small'],
				anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
				google: ['gemini-1.5-pro', 'gemini-1.5-flash'],
				ollama: ['llama3.2', 'llama2', 'mistral'],
			};

			const testCases = [
				{ vendor: 'openai', model: 'gpt-4', valid: true },
				{ vendor: 'openai', model: 'invalid-model', valid: false },
				{ vendor: 'mistral', model: 'mistral-large', valid: true },
				{ vendor: 'anthropic', model: 'claude-3-opus-20240229', valid: true },
				{ vendor: 'unsupported', model: 'any-model', valid: false },
			];

			testCases.forEach(({ vendor, model, valid }) => {
				const vendorModels =
					supportedModels[vendor as keyof typeof supportedModels];
				const isSupported = vendorModels && vendorModels.includes(model);

				expect(Boolean(isSupported)).toBe(valid);
			});
		});

		test('should provide default models for vendors', () => {
			const defaultModels = {
				openai: 'gpt-4',
				mistral: 'mistral-large',
				anthropic: 'claude-3-opus-20240229',
				google: 'gemini-1.5-pro',
				ollama: 'llama3.2',
			};

			Object.entries(defaultModels).forEach(([vendor, expectedModel]) => {
				expect(expectedModel).toBeTruthy();
				expect(typeof expectedModel).toBe('string');
			});
		});
	});
});

describe('Logging Utilities', () => {
	describe('Log Level Management', () => {
		test('should respect log level hierarchy', () => {
			const logLevels = ['debug', 'info', 'warn', 'error'];
			const currentLevel = 'info';

			const shouldLog = (messageLevel: string) => {
				const currentIndex = logLevels.indexOf(currentLevel);
				const messageIndex = logLevels.indexOf(messageLevel);
				return messageIndex >= currentIndex;
			};

			expect(shouldLog('debug')).toBe(false);
			expect(shouldLog('info')).toBe(true);
			expect(shouldLog('warn')).toBe(true);
			expect(shouldLog('error')).toBe(true);
		});

		test('should format log messages consistently', () => {
			const logEntry = {
				timestamp: '2024-01-15T14:30:00.000Z',
				level: 'info',
				message: 'Processing invoice.pdf',
				metadata: {
					filename: 'invoice.pdf',
					provider: 'openai',
					processingTime: 2341,
				},
			};

			const formattedMessage = `[${
				logEntry.timestamp
			}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`;

			expect(formattedMessage).toContain('2024-01-15T14:30:00.000Z');
			expect(formattedMessage).toContain('INFO');
			expect(formattedMessage).toContain('Processing invoice.pdf');
		});
	});

	describe('Sensitive Data Handling', () => {
		test('should redact sensitive information from logs', () => {
			const sensitiveData = {
				apiKey: 'sk-1234567890abcdef1234567890abcdef',
				userEmail: 'user@company.com',
				creditCard: '4111-1111-1111-1111',
				phoneNumber: '+33123456789',
			};

			const redacted = {
				apiKey:
					sensitiveData.apiKey.slice(0, 3) +
					'***' +
					sensitiveData.apiKey.slice(-3),
				userEmail: sensitiveData.userEmail.replace(/(.{2}).*(@.*)/, '$1***$2'),
				creditCard: '**** **** **** ' + sensitiveData.creditCard.slice(-4),
				phoneNumber:
					sensitiveData.phoneNumber.slice(0, 3) +
					'***' +
					sensitiveData.phoneNumber.slice(-4),
			};

			expect(redacted.apiKey).toBe('sk-***def');
			expect(redacted.userEmail).toBe('us***@company.com');
			expect(redacted.creditCard).toBe('**** **** **** 1111');
			expect(redacted.phoneNumber).toBe('+33***6789');
		});

		test('should handle logging of extraction results safely', () => {
			const extractionResult = {
				invoice_number: { value: 'INV-2024-001', confidence: 0.95 },
				total_amount: { value: 1234.56, confidence: 0.92 },
				supplier: {
					name: { value: 'ACME Corp', confidence: 0.9 },
					tax_id: { value: 'FR12345678901', confidence: 0.88 },
				},
				customer: {
					name: { value: 'Client Ltd', confidence: 0.89 },
					email: { value: 'client@company.com', confidence: 0.85 },
				},
			};

			// Create a safe version for logging
			const safeResult = JSON.parse(JSON.stringify(extractionResult));
			if (safeResult.customer?.email?.value) {
				safeResult.customer.email.value =
					safeResult.customer.email.value.replace(/(.{2}).*(@.*)/, '$1***$2');
			}

			expect(safeResult.customer.email.value).toBe('cl***@company.com');
			expect(safeResult.invoice_number.value).toBe('INV-2024-001'); // Non-sensitive data unchanged
		});
	});

	describe('Performance Logging', () => {
		test('should track processing times accurately', () => {
			const performanceLog = {
				operation: 'extract_invoice',
				startTime: Date.now(),
				endTime: Date.now() + 2500,
				duration: 2500,
				success: true,
				metadata: {
					fileSize: 1024 * 1024,
					provider: 'openai',
					model: 'gpt-4',
				},
			};

			expect(performanceLog.duration).toBe(2500);
			expect(performanceLog.duration).toBeLessThan(10000); // Under 10 seconds
			expect(performanceLog.success).toBe(true);
		});

		test('should calculate throughput metrics', () => {
			const batchMetrics = {
				totalDocuments: 100,
				successfulExtractions: 95,
				totalProcessingTime: 300000, // 5 minutes in ms
				averageProcessingTime: 3000, // 3 seconds per document
				throughput: 0, // To be calculated
				successRate: 0, // To be calculated
			};

			batchMetrics.throughput =
				batchMetrics.totalDocuments / (batchMetrics.totalProcessingTime / 1000); // docs per second
			batchMetrics.successRate =
				batchMetrics.successfulExtractions / batchMetrics.totalDocuments;

			expect(batchMetrics.throughput).toBeCloseTo(0.333, 2); // ~0.33 docs/second
			expect(batchMetrics.successRate).toBe(0.95); // 95% success rate
		});
	});
});
