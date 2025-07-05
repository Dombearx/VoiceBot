import sqlite3
from pathlib import Path
from typing import Any, List, Dict, Optional
from contextlib import contextmanager


class Database:
    def __init__(self, db_path: str = "app.db"):
        self.db_path = Path(db_path)
        self._connection: Optional[sqlite3.Connection] = None
    
    def connect(self) -> None:
        if self._connection is None:
            self._connection = sqlite3.connect(self.db_path)
            self._connection.row_factory = sqlite3.Row
    
    def disconnect(self) -> None:
        if self._connection:
            self._connection.close()
            self._connection = None
    
    def execute(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
        if not self._connection:
            raise ValueError("Database not connected. Call connect() first.")
        return self._connection.execute(query, params)
    
    def execute_many(self, query: str, params_list: List[tuple]) -> sqlite3.Cursor:
        if not self._connection:
            raise ValueError("Database not connected. Call connect() first.")
        return self._connection.executemany(query, params_list)
    
    def fetch_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        cursor = self.execute(query, params)
        row = cursor.fetchone()
        return dict(row) if row else None
    
    def fetch_all(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        cursor = self.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]
    
    def commit(self) -> None:
        if not self._connection:
            raise ValueError("Database not connected. Call connect() first.")
        self._connection.commit()
    
    def rollback(self) -> None:
        if not self._connection:
            raise ValueError("Database not connected. Call connect() first.")
        self._connection.rollback()
    
    @contextmanager
    def transaction(self):
        if not self._connection:
            raise ValueError("Database not connected. Call connect() first.")
        try:
            yield self._connection
            self._connection.commit()
        except Exception:
            self._connection.rollback()
            raise
    
    def __enter__(self):
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect() 