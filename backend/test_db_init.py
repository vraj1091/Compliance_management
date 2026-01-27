"""Test database initialization locally."""
import sqlite3
import sys
from pathlib import Path


def test_database():
    """Test if database is properly initialized."""
    print("=" * 60)
    print("  DATABASE TEST")
    print("=" * 60)
    print()
    
    db_path = Path(__file__).parent / "qms_erp.db"
    
    if not db_path.exists():
        print("✗ Database file does not exist!")
        return False
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check roles table
        print("[1/4] Checking roles table...")
        cursor.execute("SELECT COUNT(*) FROM roles")
        role_count = cursor.fetchone()[0]
        print(f"  ✓ Found {role_count} role(s)")
        
        # Check admin role
        print("[2/4] Checking admin role...")
        cursor.execute("SELECT id, name FROM roles WHERE id = ?", ("role-admin",))
        admin_role = cursor.fetchone()
        if admin_role:
            print(f"  ✓ Admin role exists: {admin_role[1]}")
        else:
            print("  ✗ Admin role NOT found!")
            return False
        
        # Check users table
        print("[3/4] Checking users table...")
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"  ✓ Found {user_count} user(s)")
        
        # Check admin user
        print("[4/4] Checking admin user...")
        cursor.execute("""
            SELECT id, username, email, is_active, role_id 
            FROM users WHERE username = ?
        """, ("admin",))
        admin_user = cursor.fetchone()
        if admin_user:
            print(f"  ✓ Admin user exists:")
            print(f"    - ID: {admin_user[0]}")
            print(f"    - Username: {admin_user[1]}")
            print(f"    - Email: {admin_user[2]}")
            print(f"    - Active: {bool(admin_user[3])}")
            print(f"    - Role ID: {admin_user[4]}")
        else:
            print("  ✗ Admin user NOT found!")
            return False
        
        cursor.close()
        conn.close()
        
        print()
        print("=" * 60)
        print("  DATABASE TEST PASSED!")
        print("=" * 60)
        print()
        print("You can now login with:")
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
    success = test_database()
    sys.exit(0 if success else 1)
