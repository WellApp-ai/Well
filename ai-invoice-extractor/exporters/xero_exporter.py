import csv
from .base_exporter import BaseExporter
from .exporter_factory import ExporterFactory

@ExporterFactory.register("xero")
class XeroExporter(BaseExporter):
    def _export(self, data: dict, output_path: str):
        fields = ["InvoiceNumber", "Date", "DueDate", "Amount"]
        row = [
            data.get("invoice_number", "INV-001"),
            data.get("date", "2025-01-01"),
            data.get("due_date", "2025-01-31"),
            data.get("amount", 0)
        ]
        with open(output_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(fields)
            writer.writerow(row)
