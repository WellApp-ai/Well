# exporter_factory.py
from typing import Dict, Type

class ExporterFactory:
    _exporters: Dict[str, Type['BaseExporter']] = {}
    
    @classmethod
    def register(cls, name: str) -> callable:
        """Decorator to register exporter classes."""
        def wrapper(exporter_cls: Type['BaseExporter']) -> Type['BaseExporter']:
            cls._exporters[name.lower()] = exporter_cls
            return exporter_cls
        return wrapper
    
    @classmethod
    def get_exporter(cls, format_name: str) -> 'BaseExporter':
        """Get an exporter instance by format name."""
        exporter_cls = cls._exporters.get(format_name.lower())
        if not exporter_cls:
            raise ValueError(f"Unsupported export format: {format_name}")
        return exporter_cls()

# For backward compatibility
get_exporter = ExporterFactory.get_exporter