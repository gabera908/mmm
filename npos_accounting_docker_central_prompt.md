# البرومبت النهائي — نظام محاسبي مركزي للمؤسسات غير الربحية عبر Docker

أنت مهندس برمجيات Senior Software Architect ومتخصص في:

- الأنظمة المحاسبية ERP
- Fund Accounting
- المؤسسات غير الربحية Non-Profit Organizations
- Python
- FastAPI
- React
- TypeScript
- PostgreSQL
- Docker
- Docker Compose
- Nginx
- REST API
- أمن التطبيقات
- الأنظمة متعددة المستخدمين

أريد منك إنشاء نظام محاسبي احترافي ومتكامل للمؤسسات غير الربحية، يكون مصممًا من البداية ليعمل على جهاز مركزي Central Server باستخدام Docker، بحيث يتم الوصول إلى النظام من أجهزة الكمبيوتر واللابتوب والهواتف والأجهزة اللوحية عن طريق متصفح الويب.

## 1. المرجع الأساسي للمشروع

يوجد ملف `README.md` مرفق مع هذا الطلب.

اعتبر ملف `README.md` هو المرجع الأساسي للمتطلبات الوظيفية والمحاسبية للمشروع.

يجب تنفيذ جميع الوظائف الأساسية المذكورة فيه وعدم حذفها.

المتطلبات الأساسية تشمل:

- Fund Accounting
- شجرة الحسابات
- القيود اليومية
- اليومية الأمريكية
- الأستاذ العام
- ميزان المراجعة
- التقارير المالية
- المشاريع ومراكز التكلفة
- المانحين
- الموازنات
- المستخدمين والصلاحيات
- العملات وأسعار الصرف
- السنوات والفترات المالية
- إغلاق الفترات
- Audit Log
- PDF
- Excel

العملة الأساسية للنظام:

`EGP - الجنيه المصري`

## 2. القرار المعماري الإلزامي

ممنوع بناء النظام كتطبيق Desktop يعتمد على:

- PyQt6
- X11
- VNC
- Remote Desktop

الهدف هو بناء Web Application حقيقي.

المستخدم لا يقوم بتثبيت البرنامج على جهازه.

البنية:

```text
Docker Server
      ↓
Network
      ↓
Web Browser
      ↓
Accounting System
```

مثال:

```text
http://192.168.1.100
```

أو لاحقًا:

```text
https://accounting.example.com
```

## 3. التكنولوجيا الإلزامية

### Backend

- Python 3.12+
- FastAPI
- SQLAlchemy 2.x
- Pydantic
- Alembic
- PostgreSQL

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui أو مكتبة UI احترافية مناسبة

### Reverse Proxy

- Nginx

### Containerization

- Docker
- Docker Compose

### Reports

- ReportLab أو HTML to PDF
- openpyxl أو XlsxWriter

### Charts

- Recharts

### Authentication

- JWT
- Refresh Token
- Argon2 أو bcrypt

### Testing

- pytest
- Vitest
- React Testing Library

## 4. شكل النظام المركزي

```text
                    INTERNET / LAN
                         │
                         ▼
                 ┌───────────────┐
                 │     NGINX     │
                 │ Reverse Proxy │
                 └───────┬───────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       ┌─────────────┐       ┌─────────────┐
       │   React     │       │   FastAPI   │
       │  Frontend   │◄─────►│   Backend   │
       └─────────────┘       └──────┬──────┘
                                    │
                                    ▼
                            ┌─────────────┐
                            │ PostgreSQL  │
                            └──────┬──────┘
                                   │
                                   ▼
                            Docker Volume
```

يجب أن تكون PostgreSQL داخل Docker Container.

يجب تخزين بيانات PostgreSQL داخل Docker Volume دائم.

لا يجوز تخزين قاعدة البيانات داخل Container filesystem فقط.

## 5. Docker

يجب إنشاء:

- Dockerfile للـ Backend
- Dockerfile للـ Frontend
- Dockerfile أو إعداد مناسب لـ Nginx
- `docker-compose.yml`
- `.env.example`
- `.dockerignore`

يجب أن يعمل المشروع بالأوامر:

```bash
docker compose build
docker compose up -d
```

وبعد التشغيل يستطيع المستخدم فتح:

```text
http://SERVER-IP
```

ويظهر النظام.

## 6. Docker Compose

يجب أن يحتوي `docker-compose.yml` على الأقل على:

- postgres
- backend
- frontend
- nginx

مع إمكانية إضافة:

- backup

إذا احتاج التصميم ذلك.

يجب استخدام:

- healthcheck لـ PostgreSQL
- healthcheck للـ Backend

ويجب أن ينتظر Backend جاهزية PostgreSQL قبل تشغيل migrations.

## 7. قاعدة البيانات

استخدم PostgreSQL وليس SQLite في Production.

يجب إنشاء:

- SQLAlchemy Models
- Alembic migrations
- Indexes
- Foreign Keys
- Unique Constraints
- Check Constraints
- Transactions
- Database constraints

يجب تصميم قاعدة البيانات بحيث تتحمل عدة مستخدمين في نفس الوقت.

## 8. Fund Accounting

هذا النظام مخصص للمؤسسات غير الربحية.

يجب تنفيذ Fund Accounting بشكل حقيقي وليس مجرد حقل نصي.

يجب دعم:

- Funds
- Restricted Funds
- Unrestricted Funds
- Temporarily Restricted Funds
- Permanently Restricted Funds

ويجب أن تكون العمليات المالية قابلة للربط بـ:

- Fund
- Project
- Cost Center
- Donor

مع إمكانية استخراج التقارير لكل Fund.

## 9. شجرة الحسابات

إنشاء Chart of Accounts احترافي.

يدعم 5 مستويات ترميز.

كل حساب يحتوي على:

- id
- code
- name
- parent_id
- account_type
- level
- is_active
- description
- created_at
- updated_at

أنواع الحسابات:

- الأصول
- الخصوم
- صافي الأصول
- الإيرادات
- المصروفات

الوظائف:

- إضافة حساب
- تعديل حساب
- تعطيل حساب
- البحث
- التصفية
- عرض Tree
- عرض الحسابات الفرعية

ممنوع حذف حساب مرتبط بحركات مالية.

## 10. القيود اليومية

إنشاء Journal Entry System.

القيد يحتوي على:

- رقم القيد
- التاريخ
- البيان
- Fund
- Project
- Cost Center
- العملة
- سعر الصرف
- المرجع
- المرفقات

والسطور تحتوي على:

- الحساب
- مدين
- دائن
- Fund
- Project
- Cost Center

قاعدة إلزامية:

```text
Total Debit = Total Credit
```

لا يمكن Post لقيد غير متوازن.

حالات القيد:

- Draft
- Posted
- Cancelled
- Reversed

يجب دعم:

- Create
- Edit
- Post
- Cancel
- Reverse
- Print
- Export

## 11. اليومية الأمريكية

إنشاء شاشة اليومية الأمريكية.

تعرض:

- التاريخ
- رقم القيد
- البيان
- الحساب
- مدين
- دائن
- الرصيد

مع:

- Search
- Filter
- Date Range
- Account Filter
- Fund Filter
- Project Filter
- Export PDF
- Export Excel

## 12. الأستاذ العام

General Ledger.

يجب السماح بالبحث حسب:

- الحساب
- الفترة
- السنة المالية
- Fund
- Project
- Cost Center
- Donor

ويعرض:

- الرصيد الافتتاحي
- المدين
- الدائن
- الرصيد الجاري

## 13. ميزان المراجعة

إنشاء Trial Balance.

يعرض:

- كود الحساب
- اسم الحساب
- الرصيد المدين
- الرصيد الدائن

مع:

- إجمالي المدين
- إجمالي الدائن

ويجب التحقق آليًا من التوازن.

يدعم:

- PDF
- Excel
- Print

## 14. التقارير المالية

إنشاء:

1. ميزان المراجعة
2. قائمة المركز المالي
3. قائمة الأنشطة
4. قائمة التدفقات النقدية
5. الأستاذ العام
6. كشف حساب
7. الموازنة مقابل الفعلي
8. تقارير Funds
9. تقارير المشاريع
10. تقارير المانحين
11. تقرير الإيرادات
12. تقرير المصروفات

كل تقرير يدعم:

- التاريخ
- Fund
- Project
- Cost Center
- Account
- PDF
- Excel
- Print

## 15. الموازنات

إنشاء Budget Management.

يدعم:

- السنة المالية
- Fund
- Project
- Account
- Budget Amount
- Actual Amount
- Variance
- Execution %

مثال:

```text
Budget = 100,000 EGP
Actual = 75,000 EGP
Remaining = 25,000 EGP
Execution = 75%
```

## 16. المشاريع

إدارة المشاريع.

البيانات:

- كود المشروع
- اسم المشروع
- الوصف
- Fund
- Donor
- الميزانية
- تاريخ البداية
- تاريخ النهاية
- الحالة

الحالات:

- Draft
- Active
- Completed
- Closed

مع تقارير مالية لكل مشروع.

## 17. المانحون

إدارة Donors.

البيانات:

- اسم المانح
- النوع
- الهاتف
- البريد
- العنوان
- ملاحظات

مع:

- التبرعات
- المشاريع الممولة
- إجمالي التمويل
- التقارير

## 18. العملات

العملة الأساسية:

`EGP`

يجب دعم عملات أخرى.

إنشاء:

- Currencies
- Exchange Rates

مع سعر صرف حسب التاريخ.

## 19. السنة المالية والفترات

إنشاء:

- Fiscal Years
- Accounting Periods

الوظائف:

- فتح سنة
- إغلاق سنة
- فتح فترة
- إغلاق فترة
- ترحيل الأرصدة

قاعدة إلزامية:

لا يمكن تسجيل أو تعديل قيد في فترة مغلقة.

## 20. المستخدمون والصلاحيات

RBAC حقيقي.

الأدوار:

- Administrator
- Accountant
- Project Accountant
- Auditor
- Viewer

الصلاحيات:

- View
- Create
- Edit
- Delete
- Post
- Approve
- Export
- Print

يجب تطبيق الصلاحيات في Backend.

لا تعتمد على إخفاء الأزرار في Frontend فقط.

## 21. Audit Log

يجب تسجيل:

- User
- Action
- Date
- Time
- IP Address
- Table
- Record ID
- Old Value
- New Value

مثال:

```text
المستخدم: Ahmed
العملية: تعديل حساب
القيمة القديمة: ...
القيمة الجديدة: ...
```

لا يستطيع المستخدم العادي حذف Audit Logs.

## 22. Dashboard

إنشاء Dashboard عربية احترافية.

البطاقات:

- إجمالي الأصول
- إجمالي الالتزامات
- صافي الأصول
- الإيرادات
- المصروفات
- التبرعات
- عدد المشاريع
- عدد المانحين

Charts:

- الإيرادات والمصروفات
- Budget vs Actual
- المصروفات حسب المشروع
- التبرعات حسب المانح
- Funds

مع Filters:

- السنة
- الشهر
- Fund
- Project

## 23. الواجهة العربية

الواجهة بالكامل:

- Arabic
- RTL

استخدم:

- Cairo
- أو Tajawal

القائمة:

```text
لوحة التحكم

المحاسبة
├── شجرة الحسابات
├── القيود اليومية
├── اليومية الأمريكية
├── الأستاذ العام
└── ميزان المراجعة

التمويل
├── Funds
├── المشاريع
├── المانحون
└── التبرعات

الموازنات
├── الموازنات
└── الموازنة مقابل الفعلي

التقارير
├── التقارير المالية
├── تقارير المشاريع
├── تقارير Funds
└── تقارير المانحين

الإدارة
├── المستخدمون
├── الصلاحيات
├── السنوات المالية
├── الفترات
├── العملات
├── سجل المراجعة
├── النسخ الاحتياطي
└── الإعدادات
```

## 24. تصميم الواجهة

أريد UI احترافي يشبه أنظمة ERP الحديثة.

المطلوب:

- Sidebar
- Topbar
- Dashboard Cards
- Tables
- Forms
- Modal Dialogs
- Toast Notifications
- Loading States
- Empty States
- Error States
- Confirmation Dialogs

دعم:

- Desktop
- Tablet
- Mobile

## 25. البحث

إنشاء Global Search.

يبحث في:

- الحسابات
- القيود
- المشاريع
- المانحين
- Funds
- التقارير

مع دعم البحث باللغة العربية.

## 26. النسخ الاحتياطي

هذه وظيفة أساسية.

يجب إنشاء نظام Backup لقاعدة PostgreSQL.

يدعم:

- Manual Backup
- Automatic Backup
- Restore
- Backup History
- Backup Timestamp

يجب ألا يتم حذف آخر نسخة احتياطية.

يفضل استخدام `pg_dump`.

يجب تخزين النسخ في Volume منفصل:

```text
backup_data
```

مثال:

```text
/backups
```

## 27. الحفاظ على البيانات

عند تنفيذ:

```bash
docker compose restart
```

أو:

```bash
docker compose down
```

يجب ألا تضيع البيانات.

يجب استخدام:

```yaml
postgres_data:/var/lib/postgresql/data
```

ويجب عدم استخدام:

```bash
docker compose down -v
```

في تعليمات التشغيل العادية.

## 28. الأمن

طبق:

- JWT Authentication
- Refresh Tokens
- Password Hashing
- RBAC
- Rate Limiting
- CORS
- Secure Headers
- Input Validation
- SQL Injection Protection
- Password Policy
- Account Lockout عند محاولات الدخول المتكررة

لا تخزن:

- Passwords
- JWT Secrets
- Database Passwords

داخل الكود.

استخدم:

```text
.env
```

## 29. إعدادات المؤسسة

صفحة:

`إعدادات المؤسسة`

تحتوي على:

- اسم المؤسسة
- الشعار
- العنوان
- الهاتف
- البريد
- العملة الأساسية
- السنة المالية
- تنسيق التاريخ
- تنسيق الأرقام
- إعدادات التقارير
- إعدادات النسخ الاحتياطي

## 30. التقارير PDF

يجب أن تكون التقارير:

Arabic RTL

وتحتوي على:

- Logo
- اسم المؤسسة
- عنوان التقرير
- الفترة
- التاريخ
- المستخدم
- رقم الصفحة

مع دعم اللغة العربية بشكل صحيح.

## 31. Excel

كل التقارير الرئيسية يجب أن تدعم Excel.

يجب أن يكون الملف:

- منظم
- بعناوين
- Headers
- Totals
- Formatting
- Arabic

## 32. API

إنشاء REST API موثق باستخدام Swagger/OpenAPI.

Endpoints:

```text
/api/auth
/api/users
/api/roles
/api/permissions
/api/accounts
/api/funds
/api/projects
/api/donors
/api/donations
/api/journals
/api/ledger
/api/trial-balance
/api/budgets
/api/reports
/api/fiscal-years
/api/periods
/api/currencies
/api/exchange-rates
/api/audit-logs
/api/settings
/api/backups
```

## 33. صحة النظام

إنشاء:

```text
/health
```

و:

```text
/api/health
```

لفحص:

- Backend
- Database
- Storage

Docker healthcheck يجب أن يستخدمها.

## 34. Logging

إنشاء Logging احترافي.

يسجل:

- Errors
- Warnings
- Authentication Events
- Database Errors
- API Errors
- Important Accounting Operations

لا تسجل كلمات المرور أو البيانات السرية في Logs.

## 35. الاختبارات

استخدم pytest.

يجب اختبار:

- Login
- Permissions
- Accounts
- Journal Entries
- Debit/Credit Balance
- Posting
- Reversal
- Ledger
- Trial Balance
- Budget
- Fund Accounting
- Fiscal Period Closing
- Audit Log

Frontend:

- Vitest
- React Testing Library

## 36. هيكل المشروع

أنشئ:

```text
project-root/

├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── reports/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── migrations/
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
│
├── nginx/
│   ├── nginx.conf
│   └── Dockerfile
│
├── backups/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .dockerignore
└── README.md
```

## 37. طريقة التنفيذ

لا تنشئ Prototype ناقص.

لا تضع:

```text
TODO
Not implemented
Coming soon
Placeholder Code
Fake API
Fake Database
Mock Accounting Logic
```

أريد كوداً حقيقياً قابلاً للتشغيل.

عند إنشاء أي ملف، اكتب:

```text
FILE:
backend/app/models/account.py
```

ثم الكود الكامل للملف.

لا تختصر الملفات.

لا تقل:

> وباقي الكود مشابه

بل اكتب الكود كاملاً.

## 38. ترتيب التنفيذ

نفذ المشروع بالترتيب التالي:

```text
PHASE 1  - Architecture
PHASE 2  - Database Design
PHASE 3  - SQLAlchemy Models
PHASE 4  - Alembic
PHASE 5  - Authentication
PHASE 6  - RBAC
PHASE 7  - Chart of Accounts
PHASE 8  - Fund Accounting
PHASE 9  - Journal Entries
PHASE 10 - General Ledger
PHASE 11 - Trial Balance
PHASE 12 - Projects
PHASE 13 - Donors
PHASE 14 - Budgets
PHASE 15 - Fiscal Years
PHASE 16 - Currencies
PHASE 17 - Reports
PHASE 18 - Audit Log
PHASE 19 - Dashboard
PHASE 20 - React Frontend
PHASE 21 - Arabic RTL UI
PHASE 22 - PDF / Excel
PHASE 23 - Backup / Restore
PHASE 24 - Docker
PHASE 25 - Nginx
PHASE 26 - Testing
PHASE 27 - Documentation
```

## 39. Seed Data

أنشئ Seed Data حقيقية للتجربة.

المستخدم:

```text
Username: admin
Password: admin123
```

لكن يجب إجبار Admin على تغيير كلمة المرور عند أول تسجيل دخول.

أنشئ:

- Default Fiscal Year
- Default Currency: EGP
- Default Funds
- Default Account Types
- Default Chart of Accounts مناسب لمؤسسة غير ربحية

## 40. تشغيل النظام

بعد الانتهاء يجب أن يكون تشغيل النظام:

```bash
git clone ...

cd project

cp .env.example .env

docker compose build

docker compose up -d
```

ثم:

```text
http://SERVER-IP
```

## 41. تشغيل داخل الشبكة المحلية

يجب أن يعمل النظام داخل LAN.

مثال:

```text
Server:
192.168.1.100
```

المستخدمون:

```text
192.168.1.20
192.168.1.21
192.168.1.22
```

يمكن للجميع فتح:

```text
http://192.168.1.100
```

في المتصفح.

لا يحتاج المستخدمون إلى Docker.

Docker موجود فقط على Server.

## 42. الوصول من الإنترنت

يجب أن يكون التصميم قابلاً للنشر مستقبلاً على Internet.

مثلاً:

```text
https://accounting.example.com
```

مع:

- Nginx
- HTTPS
- SSL Certificate
- Reverse Proxy

ولا تجعل التطبيق مرتبطاً بعنوان IP ثابت داخل الكود.

## 43. الأداء

صمم النظام ليعمل مع عدة مستخدمين متزامنين.

استخدم:

- Database Indexes
- Pagination
- Lazy Loading
- Query Optimization
- Connection Pooling
- Caching عند الحاجة

لا تقم بتحميل آلاف السجلات دفعة واحدة إلى Frontend.

## 44. قواعد محاسبية إلزامية

لا تسمح بـ:

- قيد غير متوازن.
- قيد بدون حساب.
- قيد في فترة مغلقة.
- استخدام حساب غير نشط.
- حذف حساب مستخدم في قيد.
- حذف Fund مرتبط بحركات.
- حذف Project مرتبط بحركات.
- تعديل Posted Journal بدون صلاحية.
- تجاوز الصلاحيات.

يجب تطبيق هذه القواعد في Backend.

## 45. جودة المشروع

المشروع يجب أن يكون:

- Production Ready
- Secure
- Scalable
- Maintainable
- Modular
- Tested
- Dockerized
- Arabic RTL
- Multi-user
- Non-Profit Accounting System

## 46. README

أنشئ README.md شامل يحتوي على:

- Project Overview
- Architecture
- Requirements
- Installation
- Docker Installation
- Configuration
- Environment Variables
- Database
- Migrations
- Seed
- First Login
- LAN Deployment
- Internet Deployment
- SSL
- Backup
- Restore
- Update
- Upgrade
- Troubleshooting
- Security
- Testing

## 47. نقطة مهمة جداً

لا تستخدم:

- PyQt6
- X11
- VNC
- SQLite في Production

ولا تجعل المستخدم يحتاج إلى تثبيت:

- Python
- Node.js
- Docker

Docker مطلوب فقط على الجهاز المركزي Server.

المستخدم النهائي يحتاج فقط إلى Web Browser.

## 48. النتيجة النهائية

أريد نظاماً بهذه الصورة:

```text
                         SERVER
                           │
                    ┌──────┴──────┐
                    │    Docker   │
                    │             │
                    │ Nginx       │
                    │ React       │
                    │ FastAPI     │
                    │ PostgreSQL  │
                    │ Backup      │
                    └──────┬──────┘
                           │
                     Local Network
                           │
          ┌────────────────┼────────────────┐
          │                │                │
        PC 1             PC 2           Mobile
          │                │                │
       Browser          Browser         Browser
```

جميع المستخدمين يتعاملون مع نفس قاعدة البيانات المركزية.

جميع القيود والحسابات والتقارير والصلاحيات مركزية.

البيانات محفوظة داخل PostgreSQL Docker Volume.

النسخ الاحتياطية محفوظة في Backup Volume.

## 49. البداية

قبل كتابة الكود:

1. اقرأ README.md المرفق بالكامل.
2. استخرج جميع المتطلبات.
3. أنشئ Requirements Matrix.
4. أنشئ Architecture.
5. أنشئ Database ERD.
6. أنشئ Folder Structure.
7. وضح العلاقة بين الجداول.
8. وضح API Architecture.
9. وضح Docker Architecture.

بعد ذلك ابدأ التنفيذ.

لا تغير المتطلبات المحاسبية الموجودة في README.md دون توضيح السبب.

إذا كان هناك تعارض بين متطلبين، توقف عند نقطة التعارض واشرحه قبل التنفيذ.

لا تفترض وجود وظيفة محاسبية غير موجودة في المتطلبات إلا إذا كانت ضرورية تقنياً لتنفيذ وظيفة مطلوبة.

الهدف النهائي:

نظام محاسبي مركزي للمؤسسات غير الربحية يعمل بالكامل داخل Docker، ويُستخدم من خلال المتصفح، مع قاعدة بيانات PostgreSQL مركزية، وواجهة عربية RTL، ونظام صلاحيات، وتقارير، وFund Accounting، ونسخ احتياطي، وأمان، وقابلية للتوسع والإنتاج.
