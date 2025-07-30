import xml.etree.ElementTree as ET
from .base_exporter import BaseExporter
from .exporter_factory import ExporterFactory

@ExporterFactory.register("xml")
class XMLExporter(BaseExporter):
    def _export(self, data: dict, output_path: str):
        root = ET.Element("Invoice")
        for key, value in data.items():
            ET.SubElement(root, key).text = str(value)
        tree = ET.ElementTree(root)
        tree.write(output_path, encoding="utf-8", xml_declaration=True)
