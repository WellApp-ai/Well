import os
import pytest
from exporters.exporter_factory import get_exporter

sample_invoice = {
    "invoice_number": "INV-1234",
    "amount": 199.99,
    "date": "2025-07-27",
    "due_date": "2025-08-15",
    "customer": "Acme Corp"
}

export_formats = ["json", "csv", "xml", "ubl", "quickbooks", "xero"]

@pytest.mark.parametrize("fmt", export_formats)
def test_exporter_output(tmp_path, fmt):
    exporter = get_exporter(fmt)
    output_file = tmp_path / f"invoice.{fmt if fmt != 'quickbooks' else 'iif'}"

    exporter.export(sample_invoice, str(output_file))

    assert output_file.exists(), f"{fmt} exporter did not create output"
    assert output_file.stat().st_size > 0, f"{fmt} output file is empty"
