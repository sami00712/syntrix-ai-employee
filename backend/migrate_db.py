import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Add welcome_message column if it doesn't exist
        cur.execute("""
            ALTER TABLE business 
            ADD COLUMN IF NOT EXISTS welcome_message VARCHAR DEFAULT 'Hello! How can I help you today?';
        """)

        # Add button_color column if it doesn't exist
        cur.execute("""
            ALTER TABLE business 
            ADD COLUMN IF NOT EXISTS button_color VARCHAR DEFAULT '#4F46E5';
        """)

        # Add header_color column if it doesn't exist
        cur.execute("""
            ALTER TABLE business 
            ADD COLUMN IF NOT EXISTS header_color VARCHAR DEFAULT '#4F46E5';
        """)

        # Add text_color column if it doesn't exist
        cur.execute("""
            ALTER TABLE business 
            ADD COLUMN IF NOT EXISTS text_color VARCHAR DEFAULT '#FFFFFF';
        """)

        # Add background_color column if it doesn't exist
        cur.execute("""
            ALTER TABLE business 
            ADD COLUMN IF NOT EXISTS background_color VARCHAR DEFAULT '#FFFFFF';
        """)

        # Add widget_icon column if it doesn't exist
        cur.execute("""
            ALTER TABLE business 
            ADD COLUMN IF NOT EXISTS widget_icon VARCHAR DEFAULT 'bot';
        """)
        
        conn.commit()
        print("Migration successful: Added theme customization columns to business table.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
