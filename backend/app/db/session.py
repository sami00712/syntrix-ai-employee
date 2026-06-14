from sqlmodel import create_engine, Session, SQLModel, text
from app.core.config import settings

# Handle SQLite vs PostgreSQL connection arguments
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Use connection pooling for PostgreSQL
engine_args = {
    "connect_args": connect_args,
}

if not settings.DATABASE_URL.startswith("sqlite"):
    # PostgreSQL production-ready configuration
    engine_args.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 1800,
        "pool_pre_ping": True,
    })

engine = create_engine(settings.DATABASE_URL, **engine_args)

def init_db():
    try:
        # Only create missing tables, do not drop existing data
        SQLModel.metadata.create_all(engine)
        
        # Manual migration for new columns
        with engine.connect() as conn:
            # Check if button_color exists
            try:
                conn.execute(text("ALTER TABLE business ADD COLUMN IF NOT EXISTS button_color VARCHAR DEFAULT '#4F46E5'"))
                conn.commit()
            except Exception as e:
                print(f"Migration (button_color) skipped or failed: {e}")
                
            try:
                conn.execute(text("ALTER TABLE business ADD COLUMN IF NOT EXISTS welcome_message VARCHAR DEFAULT 'Hello! How can I help you today?'"))
                conn.commit()
            except Exception as e:
                print(f"Migration (welcome_message) skipped or failed: {e}")
                
            try:
                conn.execute(text("ALTER TABLE testimonial ADD COLUMN IF NOT EXISTS user_name VARCHAR DEFAULT ''"))
                conn.commit()
            except Exception as e:
                print(f"Migration (testimonial.user_name) skipped or failed: {e}")
                
            try:
                conn.execute(text("ALTER TABLE testimonial ADD COLUMN IF NOT EXISTS business_name VARCHAR DEFAULT ''"))
                conn.commit()
            except Exception as e:
                print(f"Migration (testimonial.business_name) skipped or failed: {e}")
                
        print("Database: Schema checked/created successfully.")
    except Exception as e:
        print(f"Database Init Error: {e}")

def get_session():
    with Session(engine) as session:
        yield session
