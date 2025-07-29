from .base_exporter import BaseExporter
from .exporter_factory import ExporterFactory   

@ExporterFactory.register("quickbooks")
class QuickBooksExporter(BaseExporter):
    def _export(self, data: dict, output_path: str):
        with open(output_path, 'w') as f:
            f.write("!TRNS\tTRNSTYPE\tDATE\tACCNT\tAMOUNT\tNAME\n")
            f.write(f"TRNS\tINVOICE\t{data.get('date')}\tAccounts Receivable\t{data.get('amount')}\t{data.get('customer', 'Client')}\n")
            f.write("ENDTRNS\n")
