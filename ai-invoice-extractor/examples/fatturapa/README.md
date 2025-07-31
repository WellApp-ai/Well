# FatturaPA Examples

This directory contains sample invoices in various formats demonstrating FatturaPA support:

## Domestic Invoices (TD01)
- `domestic-invoice-sample.json` - Sample Italian domestic invoice
- `domestic-invoice-golden.xml` - Expected XML output
- `domestic-invoice-golden.json` - Expected JSON output

## Cross-Border Invoices (TD17-TD19)
- `crossborder-invoice-sample.json` - Sample cross-border invoice
- `crossborder-invoice-golden.xml` - Expected XML output  
- `crossborder-invoice-golden.json` - Expected JSON output

## Public Administration
- `pa-invoice-sample.json` - Sample PA invoice with CIG/CUP codes
- `pa-invoice-golden.xml` - Expected XML output
- `pa-invoice-golden.json` - Expected JSON output

## Usage

These examples can be used for:
- Testing the FatturaPA extraction and export functionality
- Validating output against Italian SDI requirements
- Understanding the complete FatturaPA data structure
- Development and integration testing