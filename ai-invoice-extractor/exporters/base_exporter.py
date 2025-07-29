from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseExporter(ABC):
    REQUIRED_FIELDS = ['invoice_number', 'date', 'amount', 'customer']
    
    def validate(self, data: Dict[str, Any]) -> None:
        missing = [field for field in self.REQUIRED_FIELDS if field not in data]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        
        if not isinstance(data.get('amount'), (int, float)) or data['amount'] < 0:
            raise ValueError("Amount must be a positive number")

    def export(self, data: Dict[str, Any], output_path: str) -> None:
        self.validate(data)
        self._export(data, output_path)
    
    @abstractmethod
    def _export(self, data: Dict[str, Any], output_path: str) -> None:
        pass