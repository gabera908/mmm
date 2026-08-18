import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, Role
from app.models.account import Account, AccountType
from app.models.fund import Fund
from app.models.donor import Donor
from app.models.project import Project
from app.models.journal import JournalEntry, JournalEntryLine
from app.models.budget import Budget
from app.models.donation import Donation
from app.models.currency import Currency
from app.models.fiscal_year import FiscalYear, AccountingPeriod
from app.models.company_settings import CompanySettings


def seed_roles(db: Session) -> dict:
    roles_data = [
        {"name": "Administrator", "description": "مدير النظام - كامل الصلاحيات", "permissions": "*"},
        {"name": "Accountant", "description": "محاسب رئيسي - إدارة الحسابات والقيود والتقارير", "permissions": "view_accounts,create_journals,view_reports,manage_donations,manage_projects"},
        {"name": "Viewer", "description": "مستعرض - صلاحية الاطلاع والقراءة فقط", "permissions": "view_accounts,view_reports,view_journals"},
    ]
    role_map = {}
    for r in roles_data:
        role = db.query(Role).filter(Role.name == r["name"]).first()
        if not role:
            role = Role(name=r["name"], description=r["description"], permissions=r["permissions"], is_active=True)
            db.add(role)
            db.commit()
            db.refresh(role)
        role_map[r["name"]] = role
    return role_map


def seed_users(db: Session, role_map: dict) -> dict:
    users_data = [
        {
            "username": "admin",
            "email": "admin@example.com",
            "full_name": "مدير النظام",
            "password": "admin123",
            "role_name": "Administrator",
            "is_superuser": True,
        },
        {
            "username": "accountant",
            "email": "accountant@example.com",
            "full_name": "الأستاذ أحمد المحاسب",
            "password": "accountant123",
            "role_name": "Accountant",
            "is_superuser": False,
        },
        {
            "username": "viewer",
            "email": "viewer@example.com",
            "full_name": "أ. مريم المستعرضة",
            "password": "viewer123",
            "role_name": "Viewer",
            "is_superuser": False,
        },
    ]
    user_map = {}
    for u in users_data:
        user = db.query(User).filter(User.username == u["username"]).first()
        if not user:
            role = role_map.get(u["role_name"])
            user = User(
                username=u["username"],
                email=u["email"],
                full_name=u["full_name"],
                hashed_password=get_password_hash(u["password"]),
                role_id=role.id if role else None,
                is_active=True,
                is_superuser=u["is_superuser"],
                must_change_password=False,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        user_map[u["username"]] = user
    return user_map


def seed_account_types(db: Session) -> dict:
    types_data = [
        {"name": "الأصول", "code": "AST"},
        {"name": "الخصوم", "code": "LIA"},
        {"name": "صافي الأصول", "code": "NET"},
        {"name": "الإيرادات", "code": "REV"},
        {"name": "المصروفات", "code": "EXP"},
    ]
    type_map = {}
    for t in types_data:
        atype = db.query(AccountType).filter(AccountType.code == t["code"]).first()
        if not atype:
            atype = AccountType(name=t["name"], code=t["code"], is_active=True)
            db.add(atype)
            db.commit()
            db.refresh(atype)
        type_map[t["code"]] = atype
    return type_map


def seed_accounts(db: Session, type_map: dict) -> dict:
    # Level 1 Main Headers
    main_accounts = [
        {"code": "1000", "name": "الأصول", "type_code": "AST", "level": 1, "is_header": True},
        {"code": "2000", "name": "الخصوم", "type_code": "LIA", "level": 1, "is_header": True},
        {"code": "3000", "name": "صافي الأصول", "type_code": "NET", "level": 1, "is_header": True},
        {"code": "4000", "name": "الإيرادات", "type_code": "REV", "level": 1, "is_header": True},
        {"code": "5000", "name": "المصروفات", "type_code": "EXP", "level": 1, "is_header": True},
    ]

    for acc in main_accounts:
        existing = db.query(Account).filter(Account.code == acc["code"]).first()
        if not existing:
            account = Account(
                code=acc["code"],
                name=acc["name"],
                account_type_id=type_map[acc["type_code"]].id,
                level=acc["level"],
                is_header=acc["is_header"],
                is_active=True,
            )
            db.add(account)
    db.commit()

    all_accs = db.query(Account).all()
    acc_by_code = {a.code: a for a in all_accs}

    sub_accounts = [
        # Assets (1000)
        {"code": "1100", "name": "الأصول المتداولة", "type_code": "AST", "level": 2, "parent": "1000", "is_header": True},
        {"code": "1110", "name": "الخزينة الرئيسية", "type_code": "AST", "level": 3, "parent": "1100", "is_header": False},
        {"code": "1120", "name": "بنك مصر - حساب الجاري", "type_code": "AST", "level": 3, "parent": "1100", "is_header": False},
        {"code": "1130", "name": "البنك الأهلي - حساب التبرعات", "type_code": "AST", "level": 3, "parent": "1100", "is_header": False},
        {"code": "1140", "name": "عُهد وذمم موظفين", "type_code": "AST", "level": 3, "parent": "1100", "is_header": False},
        {"code": "1200", "name": "الأصول الثابتة", "type_code": "AST", "level": 2, "parent": "1000", "is_header": True},
        {"code": "1210", "name": "المباني والعقارات", "type_code": "AST", "level": 3, "parent": "1200", "is_header": False},
        {"code": "1220", "name": "السيارات ووسائل النقل", "type_code": "AST", "level": 3, "parent": "1200", "is_header": False},
        {"code": "1230", "name": "أجهزة ومعدات تقنية", "type_code": "AST", "level": 3, "parent": "1200", "is_header": False},

        # Liabilities (2000)
        {"code": "2100", "name": "الخصوم المتداولة", "type_code": "LIA", "level": 2, "parent": "2000", "is_header": True},
        {"code": "2110", "name": "حسابات الموردين", "type_code": "LIA", "level": 3, "parent": "2100", "is_header": False},
        {"code": "2120", "name": "المصروفات المستحقة", "type_code": "LIA", "level": 3, "parent": "2100", "is_header": False},

        # Net Assets (3000)
        {"code": "3100", "name": "صافي الأصول المتاحة", "type_code": "NET", "level": 2, "parent": "3000", "is_header": True},
        {"code": "3110", "name": "صافي الأصول غير المقيدة", "type_code": "NET", "level": 3, "parent": "3100", "is_header": False},
        {"code": "3120", "name": "صافي الأصول المقيدة", "type_code": "NET", "level": 3, "parent": "3100", "is_header": False},

        # Revenue (4000)
        {"code": "4100", "name": "إيرادات التبرعات", "type_code": "REV", "level": 2, "parent": "4000", "is_header": True},
        {"code": "4110", "name": "تبرعات أفراد", "type_code": "REV", "level": 3, "parent": "4100", "is_header": False},
        {"code": "4120", "name": "تبرعات شركات ومؤسسات", "type_code": "REV", "level": 3, "parent": "4100", "is_header": False},
        {"code": "4130", "name": "منح ودعم جهات منحة", "type_code": "REV", "level": 3, "parent": "4100", "is_header": False},
        {"code": "4140", "name": "زكاة وصدقات", "type_code": "REV", "level": 3, "parent": "4100", "is_header": False},

        # Expenses (5000)
        {"code": "5100", "name": "المصروفات العمومية والإدارية", "type_code": "EXP", "level": 2, "parent": "5000", "is_header": True},
        {"code": "5110", "name": "رواتب وأجور", "type_code": "EXP", "level": 3, "parent": "5100", "is_header": False},
        {"code": "5120", "name": "إيجارات وتجهيزات", "type_code": "EXP", "level": 3, "parent": "5100", "is_header": False},
        {"code": "5130", "name": "أدوات ومستلزمات مكتبية", "type_code": "EXP", "level": 3, "parent": "5100", "is_header": False},
        {"code": "5140", "name": "مصاريف كهرباء ومياه وصيانة", "type_code": "EXP", "level": 3, "parent": "5100", "is_header": False},
        {"code": "5200", "name": "مصروفات البرامج والمشاريع", "type_code": "EXP", "level": 2, "parent": "5000", "is_header": True},
        {"code": "5210", "name": "مصروفات المشاريع الإغاثية والغذائية", "type_code": "EXP", "level": 3, "parent": "5200", "is_header": False},
        {"code": "5220", "name": "مصروفات المشاريع الطبية", "type_code": "EXP", "level": 3, "parent": "5200", "is_header": False},
        {"code": "5230", "name": "مصروفات كفالة الطلاب والتعليم", "type_code": "EXP", "level": 3, "parent": "5200", "is_header": False},
    ]

    for acc in sub_accounts:
        existing = db.query(Account).filter(Account.code == acc["code"]).first()
        if not existing:
            parent_acc = acc_by_code.get(acc["parent"])
            account = Account(
                code=acc["code"],
                name=acc["name"],
                account_type_id=type_map[acc["type_code"]].id,
                level=acc["level"],
                parent_id=parent_acc.id if parent_acc else None,
                is_header=acc["is_header"],
                is_active=True,
            )
            db.add(account)
            db.commit()
            all_accs = db.query(Account).all()
            acc_by_code = {a.code: a for a in all_accs}

    return {a.code: a for a in db.query(Account).all()}


def seed_funds(db: Session) -> dict:
    funds_data = [
        {"code": "GEN", "name": "الصندوق العام (غير مقيد)", "fund_type": "unrestricted", "description": "يستخدم للمصاريف الأنشطة والأعمال العامة للجمعية"},
        {"code": "ZAK", "name": "صندوق الزكاة والصدقات", "fund_type": "restricted", "description": "مخصص لمصارف الزكاة والصدقات الشرعية"},
        {"code": "EMG", "name": "صندوق الإغاثة والطوارئ", "fund_type": "temporarily_restricted", "description": "مخصص للكوارث والحالات الإنسانية العاجلة"},
        {"code": "EDU", "name": "صندوق كفالة التعليم", "fund_type": "restricted", "description": "مخصص لمنح وكفالة الطلاب والبرامج التعليمية"},
        {"code": "MED", "name": "صندوق العلاج والرعاية الطبية", "fund_type": "restricted", "description": "مخصص لتوفير العلاج والمستلزمات الطبية للمحتاجين"},
    ]
    fund_map = {}
    for f in funds_data:
        fund = db.query(Fund).filter(Fund.code == f["code"]).first()
        if not fund:
            fund = Fund(code=f["code"], name=f["name"], fund_type=f["fund_type"], description=f["description"], is_active=True)
            db.add(fund)
            db.commit()
            db.refresh(fund)
        fund_map[f["code"]] = fund
    return fund_map


def seed_currencies(db: Session) -> dict:
    currencies_data = [
        {"code": "EGP", "name": "جنيه مصري", "symbol": "ج.م", "is_base": True, "exchange_rate": 1.0},
        {"code": "USD", "name": "دولار أمريكي", "symbol": "$", "is_base": False, "exchange_rate": 48.50},
        {"code": "EUR", "name": "يورو", "symbol": "€", "is_base": False, "exchange_rate": 52.00},
        {"code": "SAR", "name": "ريال سعودي", "symbol": "ر.س", "is_base": False, "exchange_rate": 12.90},
    ]
    curr_map = {}
    for c in currencies_data:
        curr = db.query(Currency).filter(Currency.code == c["code"]).first()
        if not curr:
            curr = Currency(code=c["code"], name=c["name"], symbol=c["symbol"], is_base=c["is_base"], is_active=True)
            db.add(curr)
            db.commit()
            db.refresh(curr)
        curr_map[c["code"]] = curr
    return curr_map


def seed_fiscal_years(db: Session) -> dict:
    current_year_num = date.today().year
    years_data = [
        {"year": current_year_num - 1, "is_closed": True},
        {"year": current_year_num, "is_closed": False},
    ]
    fy_map = {}
    for ydata in years_data:
        ynum = ydata["year"]
        fy = db.query(FiscalYear).filter(FiscalYear.year == ynum).first()
        if not fy:
            start_d = date(ynum, 1, 1)
            end_d = date(ynum, 12, 31)
            fy = FiscalYear(year=ynum, start_date=start_d, end_date=end_d, is_closed=ydata["is_closed"])
            db.add(fy)
            db.commit()
            db.refresh(fy)

            for i in range(1, 13):
                m_start = date(ynum, i, 1)
                m_end = date(ynum, 12, 31) if i == 12 else (date(ynum, i + 1, 1) - timedelta(days=1))
                period = AccountingPeriod(
                    fiscal_year_id=fy.id,
                    name=f"شهر {i:02d} - {ynum}",
                    start_date=m_start,
                    end_date=m_end,
                    is_closed=ydata["is_closed"],
                )
                db.add(period)
            db.commit()
        fy_map[ynum] = fy
    return fy_map


def seed_company_settings(db: Session):
    cs = db.query(CompanySettings).first()
    if not cs:
        cs = CompanySettings(
            company_name="جمعية الأمل الخيرية لرعاية المجتمع",
            base_currency="EGP",
            fiscal_year=date.today().year,
            date_format="%Y-%m-%d",
            number_format="###,##0.00",
        )
        db.add(cs)
        db.commit()
    else:
        cs.company_name = "جمعية الأمل الخيرية لرعاية المجتمع"
        db.commit()


def seed_donors(db: Session) -> dict:
    donors_data = [
        {
            "name": "شركة الأمل للتجارة والصناعة",
            "donor_type": "شركة",
            "phone": "01012345678",
            "email": "info@alamal-corp.com",
            "address": "القاهرة - المنطقة الصناعية",
            "notes": "تبرعات ومساهمات سنوية في مشاريع التنمية",
        },
        {
            "name": "مؤسسة مصر الخيرية للتنمية",
            "donor_type": "مؤسسة",
            "phone": "01122334455",
            "email": "contact@misr-foundation.org",
            "address": "الجيزة - شارع التحرير",
            "notes": "شريك استراتيجي في مشاريع كفالة التعليم والعيادات",
        },
        {
            "name": "د. أحمد محمود السعيد",
            "donor_type": "فرد",
            "phone": "01200112233",
            "email": "ahmed.elsaeed@gmail.com",
            "address": "الإسكندرية - سموحة",
            "notes": "تبرعات شخصية زكاة وصدقات جاريه",
        },
        {
            "name": "السيدة / سارة عبد الله العتيبي",
            "donor_type": "فرد",
            "phone": "+966501234567",
            "email": "sarah.alotaibi@yahoo.com",
            "address": "الرياض - المملكة العربية السعودية",
            "notes": "تبرع بالدولار لصالح صندوق الإغاثة والمستشفى",
        },
        {
            "name": "فاعلو خير (مجهول)",
            "donor_type": "فاعل خير",
            "phone": "0000000000",
            "email": "anonymous@charity.org",
            "address": "تبرعات صندوق الخزينة المباشر",
            "notes": "تبرعات عينية ونقدية مباشر من فاعلي الخير",
        },
    ]
    donor_map = {}
    for d in donors_data:
        donor = db.query(Donor).filter(Donor.name == d["name"]).first()
        if not donor:
            donor = Donor(
                name=d["name"],
                donor_type=d["donor_type"],
                phone=d["phone"],
                email=d["email"],
                address=d["address"],
                notes=d["notes"],
                is_active=True,
            )
            db.add(donor)
            db.commit()
            db.refresh(donor)
        donor_map[d["name"]] = donor
    return donor_map


def seed_projects(db: Session, fund_map: dict, donor_map: dict) -> dict:
    proj_year = date.today().year
    projects_data = [
        {
            "code": "PRJ-001",
            "name": "مشروع السلال الغذائية وكفالة الأسر",
            "description": "توزيع سلال غذائية ومساعدات عينية للأسر الأشد احتياجاً",
            "fund_code": "EMG",
            "donor_name": "شركة الأمل للتجارة والصناعة",
            "budget": 600000.00,
            "start_date": date(proj_year, 1, 1),
            "end_date": date(proj_year, 12, 31),
            "status": "active",
        },
        {
            "code": "PRJ-002",
            "name": "إنشاء وتجهيز المجمع الطبي الخيري",
            "description": "تجهيز عيادات مجهزة بالمستلزمات والأجهزة لعلاج المرضى الفقراء",
            "fund_code": "MED",
            "donor_name": "مؤسسة مصر الخيرية للتنمية",
            "budget": 1500000.00,
            "start_date": date(proj_year, 2, 1),
            "end_date": date(proj_year, 11, 30),
            "status": "active",
        },
        {
            "code": "PRJ-003",
            "name": "مشروع كفالة 100 طالب علم متميز",
            "description": "توفير المصروفات والكتب الجامعية للطلاب المتفوقين والمحتاجين",
            "fund_code": "EDU",
            "donor_name": "د. أحمد محمود السعيد",
            "budget": 400000.00,
            "start_date": date(proj_year, 1, 15),
            "end_date": date(proj_year, 10, 15),
            "status": "active",
        },
        {
            "code": "PRJ-004",
            "name": "حملة كسوة الشتاء والإغاثة العاجلة",
            "description": "توزيع أغطية وكسوة شتوية للأسر والقرى الأكثر احتياجاً",
            "fund_code": "ZAK",
            "donor_name": "السيدة / سارة عبد الله العتيبي",
            "budget": 300000.00,
            "start_date": date(proj_year - 1, 11, 1),
            "end_date": date(proj_year, 2, 28),
            "status": "completed",
        },
    ]

    proj_map = {}
    for p in projects_data:
        proj = db.query(Project).filter(Project.code == p["code"]).first()
        if not proj:
            fund = fund_map.get(p["fund_code"])
            donor = donor_map.get(p["donor_name"])
            proj = Project(
                code=p["code"],
                name=p["name"],
                description=p["description"],
                fund_id=fund.id if fund else None,
                donor_id=donor.id if donor else None,
                budget=p["budget"],
                start_date=p["start_date"],
                end_date=p["end_date"],
                status=p["status"],
            )
            db.add(proj)
            db.commit()
            db.refresh(proj)
        proj_map[p["code"]] = proj
    return proj_map


def seed_budgets(db: Session, account_map: dict, fund_map: dict, proj_map: dict):
    cur_year = date.today().year
    budgets_data = [
        {"acc": "5110", "fund": "GEN", "proj": None, "budget": 800000.00, "actual": 130000.00, "notes": "موازنة رواتب الكادر الوظيفي"},
        {"acc": "5120", "fund": "GEN", "proj": None, "budget": 300000.00, "actual": 50000.00, "notes": "موازنة الإيجارات والمقرات"},
        {"acc": "5210", "fund": "EMG", "proj": "PRJ-001", "budget": 600000.00, "actual": 120000.00, "notes": "موازنة السلال الغذائية"},
        {"acc": "5220", "fund": "MED", "proj": "PRJ-002", "budget": 1500000.00, "actual": 250000.00, "notes": "موازنة تجهيزات المجمع الطبي"},
        {"acc": "5230", "fund": "EDU", "proj": "PRJ-003", "budget": 400000.00, "actual": 80000.00, "notes": "موازنة كفالة الطلاب"},
    ]

    for b in budgets_data:
        acc = account_map.get(b["acc"])
        if not acc:
            continue
        fund = fund_map.get(b["fund"])
        proj = proj_map.get(b["proj"]) if b["proj"] else None

        existing = db.query(Budget).filter(
            Budget.fiscal_year == cur_year,
            Budget.account_id == acc.id,
            Budget.fund_id == (fund.id if fund else None),
            Budget.project_id == (proj.id if proj else None),
        ).first()

        if not existing:
            bobj = Budget(
                fiscal_year=cur_year,
                account_id=acc.id,
                fund_id=fund.id if fund else None,
                project_id=proj.id if proj else None,
                budget_amount=b["budget"],
                actual_amount=b["actual"],
                notes=b["notes"],
            )
            db.add(bobj)
    db.commit()


def seed_donations(db: Session, donor_map: dict, fund_map: dict, proj_map: dict, user_map: dict):
    cur_year = date.today().year
    admin = user_map.get("admin")
    d_user_id = admin.id if admin else None

    donations_data = [
        {
            "date": date(cur_year, 1, 10),
            "donor": "شركة الأمل للتجارة والصناعة",
            "fund": "EMG",
            "proj": "PRJ-001",
            "amount": 200000.00,
            "currency": "EGP",
            "payment_method": "تحويل بنكي",
            "ref": "BANK-TRF-9011",
            "notes": "تبرع لصالح مشروع السلال الغذائية",
        },
        {
            "date": date(cur_year, 1, 15),
            "donor": "مؤسسة مصر الخيرية للتنمية",
            "fund": "MED",
            "proj": "PRJ-002",
            "amount": 500000.00,
            "currency": "EGP",
            "payment_method": "تحويل بنكي",
            "ref": "BANK-TRF-9088",
            "notes": "الدفعة الأولى لمشروع تجهيز المجمع الطبي",
        },
        {
            "date": date(cur_year, 1, 20),
            "donor": "د. أحمد محمود السعيد",
            "fund": "EDU",
            "proj": "PRJ-003",
            "amount": 100000.00,
            "currency": "EGP",
            "payment_method": "شيك بنكي",
            "ref": "CHK-40912",
            "notes": "تبرع لكفالة طلاب العلم المتميزين",
        },
        {
            "date": date(cur_year, 2, 1),
            "donor": "السيدة / سارة عبد الله العتيبي",
            "fund": "EMG",
            "proj": "PRJ-001",
            "amount": 5000.00,
            "currency": "USD",
            "exchange_rate": 48.50,
            "payment_method": "بطاقة إلكترونية",
            "ref": "VISA-8871",
            "notes": "تبرع بالدولار الأمريكي لدعم السلال الغذائية",
        },
        {
            "date": date(cur_year, 2, 5),
            "donor": "فاعلو خير (مجهول)",
            "fund": "ZAK",
            "proj": None,
            "amount": 35000.00,
            "currency": "EGP",
            "payment_method": "إيداع نقدي",
            "ref": "CASH-REC-104",
            "notes": "تبرع نقدي مباشر بالخزينة لـ صندوق الزكاة",
        },
    ]

    for d in donations_data:
        donor = donor_map.get(d["donor"])
        fund = fund_map.get(d["fund"])
        proj = proj_map.get(d["proj"]) if d["proj"] else None
        if not donor or not fund:
            continue

        existing = db.query(Donation).filter(Donation.reference == d["ref"]).first()
        if not existing:
            don = Donation(
                donation_date=d["date"],
                donor_id=donor.id,
                fund_id=fund.id,
                project_id=proj.id if proj else None,
                amount=d["amount"],
                currency=d.get("currency", "EGP"),
                exchange_rate=d.get("exchange_rate", 1.0),
                payment_method=d["payment_method"],
                reference=d["ref"],
                notes=d["notes"],
                created_by=d_user_id,
            )
            db.add(don)
    db.commit()


def seed_journals(db: Session, account_map: dict, fund_map: dict, proj_map: dict, user_map: dict):
    cur_year = date.today().year
    admin = user_map.get("admin")
    user_id = admin.id if admin else None

    # Check if journal entries already created
    if db.query(JournalEntry).filter(JournalEntry.entry_number.like("JV-%")).first():
        return

    entries_data = [
        {
            "num": f"JV-{cur_year}-001",
            "date": date(cur_year, 1, 1),
            "desc": "قيد افتتاح الأرصدة النقدية والبنكية وصافي الأصول بداية العام",
            "ref": "OPENING-2026",
            "fund": "GEN",
            "proj": None,
            "status": "posted",
            "lines": [
                {"acc": "1110", "debit": 150000.00, "credit": 0.00, "desc": "رصيد الخزينة الرئيسية الافتتاحي"},
                {"acc": "1120", "debit": 450000.00, "credit": 0.00, "desc": "رصيد بنك مصر الجاري الافتتاحي"},
                {"acc": "1130", "debit": 850000.00, "credit": 0.00, "desc": "رصيد حساب التبرعات البنك الأهلي"},
                {"acc": "3110", "debit": 0.00, "credit": 1450000.00, "desc": "رصيد صافي الأصول غير المقيدة الافتتاحي"},
            ],
        },
        {
            "num": f"JV-{cur_year}-002",
            "date": date(cur_year, 1, 10),
            "desc": "تحصيل تبرع شركة الأمل لصالح مشروع السلال الغذائية",
            "ref": "BANK-TRF-9011",
            "fund": "EMG",
            "proj": "PRJ-001",
            "status": "posted",
            "lines": [
                {"acc": "1130", "debit": 200000.00, "credit": 0.00, "desc": "إيداع بالحساب البنكي للتبرعات"},
                {"acc": "4120", "debit": 0.00, "credit": 200000.00, "desc": "إيرادات تبرعات شركات ومؤسسات"},
            ],
        },
        {
            "num": f"JV-{cur_year}-003",
            "date": date(cur_year, 1, 15),
            "desc": "تحصيل الدفعة الأولى لتجهيز المجمع الطبي الخيري",
            "ref": "BANK-TRF-9088",
            "fund": "MED",
            "proj": "PRJ-002",
            "status": "posted",
            "lines": [
                {"acc": "1130", "debit": 500000.00, "credit": 0.00, "desc": "إيداع بالحساب البنكي للتبرعات"},
                {"acc": "4130", "debit": 0.00, "credit": 500000.00, "desc": "إيرادات منح ودعم جهات منحة"},
            ],
        },
        {
            "num": f"JV-{cur_year}-004",
            "date": date(cur_year, 1, 25),
            "desc": "صرف رواتب وأجور موظفي وكادر الجمعية لشهر يناير",
            "ref": "SAL-JAN-2026",
            "fund": "GEN",
            "proj": None,
            "status": "posted",
            "lines": [
                {"acc": "5110", "debit": 65000.00, "credit": 0.00, "desc": "إثبات مصروف الرواتب والأجور"},
                {"acc": "1120", "debit": 0.00, "credit": 65000.00, "desc": "سداد تحويلات من بنك مصر الجاري"},
            ],
        },
        {
            "num": f"JV-{cur_year}-005",
            "date": date(cur_year, 1, 28),
            "desc": "سداد إيجارات ومصروفات مقرات ومستودعات الجمعية",
            "ref": "RENT-JAN-2026",
            "fund": "GEN",
            "proj": None,
            "status": "posted",
            "lines": [
                {"acc": "5120", "debit": 25000.00, "credit": 0.00, "desc": "مصروفات إيجارات وتجهيزات مقرات"},
                {"acc": "1120", "debit": 0.00, "credit": 25000.00, "desc": "سداد شيك بنك مصر الجاري"},
            ],
        },
        {
            "num": f"JV-{cur_year}-006",
            "date": date(cur_year, 2, 2),
            "desc": "شراء 5 أجهزة حواسب ومستلزمات مكتبية للجمعية",
            "ref": "INV-COMP-402",
            "fund": "GEN",
            "proj": None,
            "status": "posted",
            "lines": [
                {"acc": "1230", "debit": 45000.00, "credit": 0.00, "desc": "شراء أجهزة حواسب ومعدات تقنية جديدة"},
                {"acc": "5130", "debit": 8000.00, "credit": 0.00, "desc": "شراء مستلزمات وأدوات مكتبية"},
                {"acc": "1120", "debit": 0.00, "credit": 53000.00, "desc": "سداد الخصم من حساب بنك مصر"},
            ],
        },
        {
            "num": f"JV-{cur_year}-007",
            "date": date(cur_year, 2, 10),
            "desc": "شراء سلال غذائية ومواد تموينية لصالح (مشروع PRJ-001)",
            "ref": "PO-FOOD-1002",
            "fund": "EMG",
            "proj": "PRJ-001",
            "status": "posted",
            "lines": [
                {"acc": "5210", "debit": 120000.00, "credit": 0.00, "desc": "مصروفات شراء 1000 سلة غذائية رمضانية"},
                {"acc": "1130", "debit": 0.00, "credit": 120000.00, "desc": "سداد شيك البنك الأهلي - حساب التبرعات"},
            ],
        },
        {
            "num": f"JV-{cur_year}-008",
            "date": date(cur_year, 2, 15),
            "desc": "شراء وتوريد أجهزة ومعدات طبية للمجمع الطبي الخيري (مشروع PRJ-002)",
            "ref": "INV-MED-771",
            "fund": "MED",
            "proj": "PRJ-002",
            "status": "posted",
            "lines": [
                {"acc": "5220", "debit": 250000.00, "credit": 0.00, "desc": "تجهيزات ومعدات طبية للعيادة الخارجية"},
                {"acc": "1130", "debit": 0.00, "credit": 250000.00, "desc": "تحويل من حساب البنك الأهلي تبرعات"},
            ],
        },
    ]

    for entry_data in entries_data:
        fund = fund_map.get(entry_data["fund"])
        proj = proj_map.get(entry_data["proj"]) if entry_data["proj"] else None

        je = JournalEntry(
            entry_number=entry_data["num"],
            entry_date=entry_data["date"],
            description=entry_data["desc"],
            reference=entry_data["ref"],
            status=entry_data["status"],
            currency="EGP",
            exchange_rate=1.0,
            fund_id=fund.id if fund else None,
            project_id=proj.id if proj else None,
            created_by=user_id,
            posted_at=datetime.combine(entry_data["date"], datetime.min.time()),
        )
        db.add(je)
        db.commit()
        db.refresh(je)

        line_num = 1
        for ld in entry_data["lines"]:
            acc = account_map.get(ld["acc"])
            if not acc:
                continue
            jel = JournalEntryLine(
                journal_entry_id=je.id,
                account_id=acc.id,
                fund_id=fund.id if fund else None,
                project_id=proj.id if proj else None,
                debit=ld["debit"],
                credit=ld["credit"],
                description=ld["desc"],
                line_number=line_num,
            )
            db.add(jel)
            line_num += 1
        db.commit()


def run_seed(db: Session = None, force_reset: bool = False):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        if force_reset:
            print("Resetting existing data...")
            db.query(JournalEntryLine).delete()
            db.query(JournalEntry).delete()
            db.query(Donation).delete()
            db.query(Budget).delete()
            db.query(Project).delete()
            db.query(Donor).delete()
            db.commit()

        print("Seeding roles...")
        role_map = seed_roles(db)

        print("Seeding users...")
        user_map = seed_users(db, role_map)

        print("Seeding account types...")
        type_map = seed_account_types(db)

        print("Seeding chart of accounts...")
        account_map = seed_accounts(db, type_map)

        print("Seeding funds...")
        fund_map = seed_funds(db)

        print("Seeding currencies...")
        curr_map = seed_currencies(db)

        print("Seeding fiscal years...")
        fy_map = seed_fiscal_years(db)

        print("Seeding company settings...")
        seed_company_settings(db)

        print("Seeding donors...")
        donor_map = seed_donors(db)

        print("Seeding projects...")
        proj_map = seed_projects(db, fund_map, donor_map)

        print("Seeding budgets...")
        seed_budgets(db, account_map, fund_map, proj_map)

        print("Seeding donations...")
        seed_donations(db, donor_map, fund_map, proj_map, user_map)

        print("Seeding journal entries & general ledger lines...")
        seed_journals(db, account_map, fund_map, proj_map, user_map)

        print("Database mock data seeded successfully!")
        return {"status": "success", "message": "تم إضافة البيانات الوهمية بنجاح بنسبة 100%"}
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if should_close:
            db.close()


def main():
    force = "--reset" in sys.argv or "--force" in sys.argv
    run_seed(force_reset=force)


if __name__ == "__main__":
    main()
