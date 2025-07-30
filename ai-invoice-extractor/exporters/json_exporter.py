import json
from .base_exporter import BaseExporter
from .exporter_factory import ExporterFactory

@ExporterFactory.register("json")
class JSONExporter(BaseExporter):
    def _export(self, data: dict, output_path: str):
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
