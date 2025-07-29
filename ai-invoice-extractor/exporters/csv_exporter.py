import csv
from .base_exporter import BaseExporter
from .exporter_factory import ExporterFactory

@ExporterFactory.register("csv")
class CSVExporter(BaseExporter):
    def _export(self, data: dict, output_path: str):
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(data.keys())
            writer.writerow(data.values())
