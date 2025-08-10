import xml.etree.ElementTree as ET
from .base_exporter import BaseExporter
from .exporter_factory import ExporterFactory

@ExporterFactory.register("ubl")
class UBLExporter(BaseExporter):
    def _export(self, data: dict, output_path: str):
        invoice = ET.Element("Invoice", xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2")
        ET.SubElement(invoice, "ID").text = data.get("invoice_number", "INV-001")
        ET.SubElement(invoice, "IssueDate").text = data.get("date", "2025-01-01")
        ET.SubElement(invoice, "LegalMonetaryTotal").text = str(data.get("amount", 0))
        tree = ET.ElementTree(invoice)
        tree.write(output_path, encoding="utf-8", xml_declaration=True)
