"""Synchronous database initialization for reliable startup."""
import sqlite3
import sys
from pathlib import Path
from utils.auth import get_password_hash


def init_database():
    """Initialize database with synchronous SQLite operations."""
    print("=" * 60)
    print("  DATABASE INITIALIZATION (Synchronous)")
    print("=" * 60)
    print()
    
    db_path = Path(__file__).parent / "qms_erp.db"
    
    try:
        # Connect to database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        print("[1/3] Creating roles table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS roles (
                id TEXT PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                permissions TEXT,
                created_at TEXT
            )
        """)
        conn.commit()
        print("✓ Roles table ready")
        
        print()
        print("[2/3] Creating users table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                role_id TEXT NOT NULL,
                department TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT,
                updated_at TEXT,
                FOREIGN KEY (role_id) REFERENCES roles (id)
            )
        """)
        conn.commit()
        print("✓ Users table ready")
        
        print()
        print("[3/3] Seeding admin data...")
        
        # Check if admin role exists
        cursor.execute("SELECT id FROM roles WHERE id = ?", ("role-admin",))
        if cursor.fetchone() is None:
            print("  Creating admin role...")
            cursor.execute("""
                INSERT INTO roles (id, name, description, permissions, created_at)
                VALUES (?, ?, ?, ?, datetime('now'))
            """, (
                "role-admin",
                "System Admin",
                "Full system access",
                '{"all": true}'
            ))
            conn.commit()
            print("  ✓ Admin role created")
        else:
            print("  ✓ Admin role already exists")
        
        # Check if admin user exists
        cursor.execute("SELECT id FROM users WHERE username = ?", ("admin",))
        existing_user = cursor.fetchone()
        
        if existing_user is None:
            print("  Creating admin user...")
            password_hash = get_password_hash("Admin@123")
            cursor.execute("""
                INSERT INTO users (
                    id, email, username, password_hash,
                    first_name, last_name, department, role_id,
                    is_active, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            """, (
                "user-admin",
                "admin@qms-erp.com",
                "admin",
                password_hash,
                "System",
                "Administrator",
                "IT",
                "role-admin",
                1
            ))
            conn.commit()
            print("  ✓ Admin user created")
        else:
            print("  ✓ Admin user already exists")
            print("  Updating password to 'Admin@123'...")
            password_hash = get_password_hash("Admin@123")
            cursor.execute("""
                UPDATE users 
                SET password_hash = ?, is_active = 1, updated_at = datetime('now')
                WHERE username = ?
            """, (password_hash, "admin"))
            conn.commit()
            print("  ✓ Password updated")
        
        cursor.close()
        conn.close()
        
        print()
        print("=" * 60)
        print("  DATABASE INITIALIZATION COMPLETE!")
        print("=" * 60)
        print()
        print("Login credentials:")
        print("  Username: admin")
        print("  Password: Admin@123")
        print()
        
        return True
        
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
