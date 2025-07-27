#!/usr/bin/env python3
"""
Database migration script to add account tracking to check-ins.

This script will:
1. Create an 'accounts' table with predefined accounts (yoshi, aunty anne, wei ching)
2. Add 'account_id' foreign key columns to all check-in tables
3. Populate the accounts table with the specified users
4. Update all existing check-in records to use wei ching (account_id = 1) as default

Run this script from the backend directory to ensure proper imports:
cd backend && python ../scripts/add_account_tracking.py
"""

import os
import sys
from pathlib import Path

# Add the backend app directory to Python path for imports
backend_dir = Path(__file__).parent.parent / "backend" / "app"
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
from sqlmodel import create_engine, Session, select, text, SQLModel, Field

class Account(SQLModel, table=True):
    """Account model for tracking who made check-ins"""
    __tablename__ = "accounts"
    
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, nullable=False)
    created_at: str = Field(default="NOW()")

def connect_to_database():
    """Establish database connection using environment variables"""
    load_dotenv()
    
    password = os.getenv("SUPABASE_PASSWORD")
    host = os.getenv("SUPABASE_POOLER_URL")
    user = os.getenv("SUPABASE_USER")
    port = os.getenv("SUPABASE_PORT")
    
    if not all([password, host, user, port]):
        sys.exit("Missing one or more Supabase environment variables (SUPABASE_PASSWORD, SUPABASE_POOLER_URL, SUPABASE_USER, SUPABASE_PORT)")

    database_url = f"postgresql://{user}:{password}@{host}:{port}/postgres"
    print(f"Connecting to database at: {host}")
    
    return create_engine(database_url, echo=False)

def create_accounts_table(session: Session):
    """Create the accounts table"""
    print("Creating accounts table...")
    
    # Create the table using raw SQL since we need more control
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    session.exec(text(create_table_sql))
    session.commit()
    print("✓ Accounts table created successfully")

def populate_accounts_table(session: Session):
    """Populate accounts table with the three specified users (wei ching gets ID 1)"""
    print("Populating accounts table...")
    
    # Insert wei ching first to ensure she gets ID 1
    account_names = ["wei ching", "yoshi", "aunty anne"]
    
    for name in account_names:
        # Check if account already exists
        existing = session.exec(text("SELECT id FROM accounts WHERE name = :name").params(name=name)).first()
        
        if not existing:
            session.exec(text("INSERT INTO accounts (name) VALUES (:name)").params(name=name))
            print(f"  ✓ Added account: {name}")
        else:
            existing_id = existing[0] if existing else None
            print(f"  - Skipped (exists): {name} (ID: {existing_id})")
    
    session.commit()
    print("✓ Accounts table populated successfully")

def add_account_columns(session: Session):
    """Add account_id foreign key columns to all check-in tables"""
    print("Adding account_id columns to check-in tables...")
    
    check_in_tables = [
        "growth",
        "sleep_time", 
        "meal",
        "poop",
        "symptom"
    ]
    
    for table_name in check_in_tables:
        print(f"  Processing table: {table_name}")
        
        # Check if column already exists
        column_exists_sql = """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = :table_name AND column_name = 'account_id';
        """
        
        existing_column = session.exec(text(column_exists_sql).params(table_name=table_name)).first()
        
        if not existing_column:
            # Add the account_id column with foreign key constraint
            add_column_sql = f"""
            ALTER TABLE {table_name} 
            ADD COLUMN account_id INTEGER,
            ADD CONSTRAINT fk_{table_name}_account_id 
            FOREIGN KEY (account_id) REFERENCES accounts(id);
            """
            
            session.exec(text(add_column_sql))
            print(f"    ✓ Added account_id column to {table_name}")
        else:
            print(f"    - Skipped (column exists): {table_name}")
    
    session.commit()
    print("✓ Account tracking columns added successfully")

def update_existing_records(session: Session):
    """Update all existing check-in records to use wei ching (account_id = 1) as default"""
    print("Updating existing check-in records with default account...")
    
    check_in_tables = [
        "growth",
        "sleep_time", 
        "meal",
        "poop",
        "symptom"
    ]
    
    # Get wei ching's account ID (should be 1) - use scalar() to get single value
    try:
        wei_ching_id = session.exec(text("SELECT id FROM accounts WHERE name = 'wei ching'")).scalar()
        if wei_ching_id is None:
            print("❌ Error: wei ching account not found!")
            return
        print(f"Using account ID {wei_ching_id} for wei ching")
    except Exception as e:
        print(f"❌ Error getting wei ching account ID: {e}")
        return
    
    for table_name in check_in_tables:
        # Update all records where account_id is NULL
        update_sql = f"""
        UPDATE {table_name} 
        SET account_id = :account_id 
        WHERE account_id IS NULL;
        """
        
        result = session.exec(text(update_sql).params(account_id=wei_ching_id))
        updated_count = result.rowcount
        
        print(f"  ✓ Updated {updated_count} records in {table_name}")
    
    session.commit()
    print("✓ Existing records updated successfully")

def create_indexes(session: Session):
    """Create indexes on account_id columns for better performance"""
    print("Creating indexes on account_id columns...")
    
    check_in_tables = [
        "growth",
        "sleep_time", 
        "meal",
        "poop",
        "symptom"
    ]
    
    for table_name in check_in_tables:
        index_name = f"idx_{table_name}_account_id"
        
        # Check if index already exists
        index_exists_sql = """
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = :table_name AND indexname = :index_name;
        """
        
        existing_index = session.exec(text(index_exists_sql).params(
            table_name=table_name, 
            index_name=index_name
        )).first()
        
        if not existing_index:
            create_index_sql = f"CREATE INDEX {index_name} ON {table_name}(account_id);"
            session.exec(text(create_index_sql))
            print(f"  ✓ Created index on {table_name}.account_id")
        else:
            print(f"  - Skipped (index exists): {table_name}")
    
    session.commit()
    print("✓ Indexes created successfully")

def verify_migration(session: Session):
    """Verify that the migration was successful"""
    print("\nVerifying migration...")
    
    # Check accounts table
    accounts_count = session.exec(text("SELECT COUNT(*) FROM accounts")).scalar()
    print(f"✓ Accounts table has {accounts_count} records")
    
    # List all accounts
    accounts = session.exec(text("SELECT id, name FROM accounts ORDER BY id")).all()
    for account in accounts:
        print(f"  - ID {account[0]}: {account[1]}")
    
    # Check that all check-in tables have the account_id column
    check_in_tables = ["growth", "sleep_time", "meal", "poop", "symptom"]
    
    for table_name in check_in_tables:
        column_check_sql = """
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = :table_name AND column_name = 'account_id';
        """
        
        column_info = session.exec(text(column_check_sql).params(table_name=table_name)).first()
        
        if column_info:
            print(f"✓ {table_name}.account_id: {column_info[1]} ({'nullable' if column_info[2] == 'YES' else 'not null'})")
        else:
            print(f"✗ Missing account_id column in {table_name}")
    
    # Check that existing records have been updated
    print("\nChecking existing records...")
    for table_name in check_in_tables:
        # Count total records
        total_count = session.exec(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
        
        # Count records with account_id
        with_account_count = session.exec(text(f"SELECT COUNT(*) FROM {table_name} WHERE account_id IS NOT NULL")).scalar()
        
        # Count records assigned to wei ching (should be account_id = 1)
        wei_ching_count = session.exec(text(f"SELECT COUNT(*) FROM {table_name} WHERE account_id = 1")).scalar()
        
        print(f"  {table_name}: {total_count} total, {with_account_count} with account, {wei_ching_count} assigned to wei ching")
    
    print("\n✓ Migration verification completed!")

def main():
    """Main migration function"""
    print("🚀 Starting account tracking migration...")
    print("="*50)
    
    try:
        engine = connect_to_database()
        
        with Session(engine) as session:
            # Step 1: Create accounts table
            create_accounts_table(session)
            
            # Step 2: Populate accounts table (wei ching gets ID 1)
            populate_accounts_table(session)
            
            # Step 3: Add account_id columns to check-in tables
            add_account_columns(session)
            
            # Step 4: Update existing records to use wei ching as default
            update_existing_records(session)
            
            # Step 5: Create indexes for performance
            create_indexes(session)
            
            # Step 6: Verify migration
            verify_migration(session)
            
        print("="*50)
        print("✅ Migration completed successfully!")
        print("\nNext steps:")
        print("1. Update your check-in forms to include account selection")
        print("2. All existing check-ins are now assigned to wei ching")
        print("3. Test the new account tracking functionality")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()