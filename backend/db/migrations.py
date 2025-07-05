import uuid
from typing import List
from .db import Database


class Migration:
    def __init__(self, db: Database):
        self.db = db
    
    def create_tables(self) -> None:
        """Create all tables according to the database plan"""
        
        # Create generation_metrics table
        self.db.execute("""
            CREATE TABLE IF NOT EXISTS generation_metrics (
                id TEXT PRIMARY KEY,
                voice_id TEXT NOT NULL,
                token_count INTEGER NOT NULL CHECK(token_count >= 0),
                text_length INTEGER NOT NULL CHECK(text_length >= 0),
                api_type TEXT NOT NULL CHECK(api_type IN ('voice_generation', 'tts', 'prompt_improvement')),
                created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ','now'))
            )
        """)
        
        # Create error_logs table
        self.db.execute("""
            CREATE TABLE IF NOT EXISTS error_logs (
                id TEXT PRIMARY KEY,
                voice_id TEXT NOT NULL,
                error_message TEXT NOT NULL,
                api_type TEXT NOT NULL CHECK(api_type IN ('voice_generation', 'tts', 'prompt_improvement')),
                created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ','now'))
            )
        """)
        
        self.db.commit()
    
    def create_indexes(self) -> None:
        """Create indexes for better performance"""
        
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_generation_metrics_created_at ON generation_metrics(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_generation_metrics_voice_id ON generation_metrics(voice_id)",
            "CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_error_logs_voice_id ON error_logs(voice_id)"
        ]
        
        for index_sql in indexes:
            self.db.execute(index_sql)
        
        self.db.commit()
    
    def drop_tables(self) -> None:
        """Drop all tables (for testing or rollback)"""
        
        tables = ["generation_metrics", "error_logs"]
        
        for table in tables:
            self.db.execute(f"DROP TABLE IF EXISTS {table}")
        
        self.db.commit()
    
    def run_migration(self) -> None:
        """Run the complete migration"""
        
        print("Running database migration...")
        
        try:
            with self.db.transaction():
                self.create_tables()
                self.create_indexes()
                print("Migration completed successfully!")
        
        except Exception as e:
            print(f"Migration failed: {e}")
            raise
    
    def seed_data(self) -> None:
        """Add sample data for testing (optional)"""
        
        sample_data = [
            (
                str(uuid.uuid4()),
                "voice_001",
                150,
                500,
                "voice_generation"
            ),
            (
                str(uuid.uuid4()),
                "voice_002",
                200,
                750,
                "tts"
            )
        ]
        
        self.db.execute_many("""
            INSERT INTO generation_metrics (id, voice_id, token_count, text_length, api_type)
            VALUES (?, ?, ?, ?, ?)
        """, sample_data)
        
        self.db.commit()
        print("Sample data added successfully!")


def run_migrations(db_path: str = "app.db") -> None:
    """Main function to run migrations"""
    
    with Database(db_path) as db:
        migration = Migration(db)
        migration.run_migration()


if __name__ == "__main__":
    run_migrations() 