"""Seed script to populate initial data for the QMS-ERP system."""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal, init_db
from models import (
    User, Role, Document, TrainingMatrix, TrainingRecord,
    Nonconformance, CAPARecord, Audit, Item, WorkOrder
)
from utils.auth import get_password_hash


async def seed_data():
    """Seed the database with initial data."""
    async with AsyncSessionLocal() as db:
        # Check if data already exists
        from sqlalchemy import select
        result = await db.execute(select(Role))
        if result.scalars().first():
            print("Database already seeded. Skipping...")
            return
        
        print("Seeding database...")
        
        # Create Roles
        roles = [
            Role(
                id="role-admin",
                name="System Admin",
                description="Full system access",
                permissions={"all": True}
            ),
            Role(
                id="role-qa-manager",
                name="QA Manager",
                description="Quality Assurance Manager",
                permissions={"nc.create": True, "nc.approve": True, "capa.create": True, "capa.approve": True, "audit.create": True}
            ),
            Role(
                id="role-qa-engineer",
                name="QA Engineer",
                description="Quality Assurance Engineer",
                permissions={"nc.create": True, "nc.view": True, "capa.create": True, "capa.view": True}
            ),
            Role(
                id="role-production",
                name="Production Manager",
                description="Production/Manufacturing Manager",
                permissions={"wo.create": True, "wo.approve": True, "item.view": True}
            ),
            Role(
                id="role-operator",
                name="Operator",
                description="Production Operator",
                permissions={"wo.view": True, "wo.update": True}
            ),
        ]
        for role in roles:
            db.add(role)
        await db.commit()
        print("[OK] Roles created")
        
        # Create Users
        users = [
            User(
                id="user-admin",
                email="admin@qms-erp.com",
                username="admin",
                password_hash=get_password_hash("Admin@123"),
                first_name="System",
                last_name="Administrator",
                department="IT",
                role_id="role-admin"
            ),
            User(
                id="user-qa-mgr",
                email="qa.manager@qms-erp.com",
                username="qa_manager",
                password_hash=get_password_hash("QaManager@123"),
                first_name="John",
                last_name="Smith",
                department="Quality Assurance",
                role_id="role-qa-manager"
            ),
            User(
                id="user-qa-eng",
                email="qa.engineer@qms-erp.com",
                username="qa_engineer",
                password_hash=get_password_hash("QaEngineer@123"),
                first_name="Sarah",
                last_name="Johnson",
                department="Quality Assurance",
                role_id="role-qa-engineer"
            ),
            User(
                id="user-prod-mgr",
                email="prod.manager@qms-erp.com",
                username="prod_manager",
                password_hash=get_password_hash("ProdManager@123"),
                first_name="Mike",
                last_name="Williams",
                department="Manufacturing",
                role_id="role-production"
            ),
        ]
        for user in users:
            db.add(user)
        await db.commit()
        print("[OK] Users created")
        
        # Create Documents
        documents = [
            Document(
                id="doc-001",
                doc_number="DOC-2024-00001",
                title="Quality Manual",
                description="Company Quality Management System Manual",
                document_type="Manual",
                status="Approved",
                current_revision=3,
                created_by="user-qa-mgr"
            ),
            Document(
                id="doc-002",
                doc_number="DOC-2024-00002",
                title="Design Control Procedure",
                description="Procedure for design and development controls",
                document_type="Procedure",
                status="Approved",
                current_revision=2,
                created_by="user-qa-mgr"
            ),
            Document(
                id="doc-003",
                doc_number="DOC-2024-00003",
                title="NC/CAPA Procedure",
                description="Nonconformance and Corrective Action procedure",
                document_type="Procedure",
                status="Approved",
                current_revision=4,
                created_by="user-qa-mgr"
            ),
            Document(
                id="doc-004",
                doc_number="DOC-2024-00004",
                title="Production Work Instruction",
                description="Work instruction for product assembly",
                document_type="Work Instruction",
                status="Draft",
                current_revision=1,
                created_by="user-prod-mgr"
            ),
        ]
        for doc in documents:
            db.add(doc)
        await db.commit()
        print("[OK] Documents created")
        
        # Create Items (Products)
        items = [
            Item(
                id="item-001",
                item_code="MD-1001",
                description="Surgical Scalpel Handle",
                item_type="Finished Good",
                unit_of_measure="EA",
                device_class="Class II",
                status="Active"
            ),
            Item(
                id="item-002",
                item_code="MD-1002",
                description="Scalpel Blade #10",
                item_type="Component",
                unit_of_measure="EA",
                device_class="Class II",
                status="Active"
            ),
            Item(
                id="item-003",
                item_code="MD-2001",
                description="Catheter Assembly",
                item_type="Finished Good",
                unit_of_measure="EA",
                device_class="Class III",
                status="Active"
            ),
            Item(
                id="item-004",
                item_code="RM-001",
                description="Stainless Steel 316L",
                item_type="Raw Material",
                unit_of_measure="KG",
                status="Active"
            ),
        ]
        for item in items:
            db.add(item)
        await db.commit()
        print("[OK] Items created")
        
        # Create Nonconformances
        ncs = [
            Nonconformance(
                id="nc-001",
                nc_number="NC-2024-00001",
                title="Dimensional Out of Spec",
                description="Lot 2024-001 dimensions exceeded upper tolerance",
                severity="Major",
                source="Incoming Inspection",
                product_affected="item-002",
                lot_number="2024-001",
                quantity_affected=50,
                discovered_date=datetime.utcnow().date() - timedelta(days=5),
                discovered_by="user-qa-eng",
                status="Under Investigation",
                created_by="user-qa-eng"
            ),
            Nonconformance(
                id="nc-002",
                nc_number="NC-2024-00002",
                title="Packaging Label Error",
                description="Wrong UDI printed on labels",
                severity="Minor",
                source="Final Inspection",
                product_affected="item-001",
                lot_number="2024-002",
                quantity_affected=100,
                discovered_date=datetime.utcnow().date() - timedelta(days=2),
                discovered_by="user-qa-eng",
                status="Open",
                created_by="user-qa-eng"
            ),
        ]
        for nc in ncs:
            db.add(nc)
        await db.commit()
        print("[OK] Nonconformances created")
        
        # Create CAPAs
        capas = [
            CAPARecord(
                id="capa-001",
                capa_number="CAPA-2024-00001",
                title="Supplier Quality Improvement",
                capa_type="Corrective",
                description="Implement supplier quality monitoring program",
                nc_id="nc-001",
                owner_id="user-qa-mgr",
                priority="High",
                status="In Progress",
                due_date=datetime.utcnow().date() + timedelta(days=30)
            ),
        ]
        for capa in capas:
            db.add(capa)
        await db.commit()
        print("[OK] CAPAs created")
        
        # Create Audit
        audits = [
            Audit(
                id="audit-001",
                audit_number="AUD-2024-00001",
                title="ISO 13485 Internal Audit",
                audit_type="Internal",
                scope="Quality Management System",
                start_date=datetime.utcnow().date() + timedelta(days=14),
                auditee_department="Manufacturing",
                led_by="user-qa-mgr",
                status="Planned"
            ),
        ]
        for audit in audits:
            db.add(audit)
        await db.commit()
        print("[OK] Audits created")
        
        # Create Work Orders
        work_orders = [
            WorkOrder(
                id="wo-001",
                work_order_number="WO-2024-00001",
                item_id="item-001",
                quantity_ordered=100,
                priority="Normal",
                status="Released",
                start_date=datetime.utcnow(),
                scheduled_completion=datetime.utcnow() + timedelta(days=7),
                lot_number="2024-003",
                created_by="user-prod-mgr"
            ),
            WorkOrder(
                id="wo-002",
                work_order_number="WO-2024-00002",
                item_id="item-003",
                quantity_ordered=50,
                priority="High",
                status="Planned",
                scheduled_completion=datetime.utcnow() + timedelta(days=14),
                created_by="user-prod-mgr"
            ),
        ]
        for wo in work_orders:
            db.add(wo)
        await db.commit()
        print("[OK] Work Orders created")
        
        # Create Training Matrix
        training = [
            TrainingMatrix(
                id="train-001",
                role_id="role-qa-engineer",
                training_name="GMP Training",
                training_code="GMP-101",
                description="Good Manufacturing Practices fundamentals",
                is_required=True,
                frequency_months=12
            ),
            TrainingMatrix(
                id="train-002",
                role_id="role-operator",
                training_name="Equipment Operation",
                training_code="EQ-201",
                description="Manufacturing equipment operation training",
                is_required=True,
                frequency_months=24
            ),
        ]
        for t in training:
            db.add(t)
        await db.commit()
        print("[OK] Training Matrix created")
        
        print("\nDatabase seeding completed successfully!")
        print("\nTest Credentials:")
        print("   Admin: admin / Admin@123")
        print("   QA Manager: qa_manager / QaManager@123")
        print("   QA Engineer: qa_engineer / QaEngineer@123")
        print("   Production Manager: prod_manager / ProdManager@123")


async def main():
    """Main entry point."""
    await init_db()
    await seed_data()


if __name__ == "__main__":
    asyncio.run(main())
