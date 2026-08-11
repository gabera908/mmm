# نظام المحاسبة المركزي للمؤسسات غير الربحية

نظام محاسبي احترافي ومتكامل للمؤسسات غير الربحية، مصمم للعمل على خادم مركزي باستخدام Docker، مع وصول من خلال متصفح الويب من أي جهاز.

## المميزات الرئيسية

- نظام محاسبي Fund Accounting كامل للمؤسسات غير الربحية
- شجرة الحسابات متعددة المستويات
- القيود اليومية واليومية الأمريكية
- الأستاذ العام وميزان المراجعة
- التقارير المالية المتعددة (PDF/Excel)
- إدارة المشاريع والمانحين
- الموازنات ومقارنة الموازنة مع الفعلي
- نظام صلاحيات متقدم (RBAC)
- سجل مراجعة كامل (Audit Log)
- النسخ الاحتياطي والاستعادة
- واجهة عربية RTL احترافية
- دعم متعدد العملات
- السنوات والفترات المالية
- Dashboard تفاعلي

## البنية المعمارية

```
INTERNET / LAN
     │
     ▼
┌───────────────┐
│     NGINX     │
│ Reverse Proxy │
└───────┬───────┘
        │
  ┌──────┴──────┐
  │             │
  ▼             ▼
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

## المتطلبات التقنية

- Docker
- Docker Compose

## التثبيت

### خطوات التثبيت

1. استنساخ المشروع:
```bash
git clone <repository-url>
cd project
```

2. نسخ ملف البيئة:
```bash
cp .env.example .env
```

3. تعديل المتغيرات في ملف `.env` حسب الحاجة

4. بناء وتشغيل الحاويات:
```bash
docker compose build
docker compose up -d
```

5. الوصول للنظام:
```
http://SERVER-IP
```

## التكوين

### متغيرات البيئة

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=npos_accounting
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

APP_NAME=نظام المحاسبة المركزي
APP_VERSION=1.0.0
DEBUG=False
SECRET_KEY=your_secret_key
```

## أول تسجيل دخول

- Username: `admin`
- Password: `admin123`

## النشر في الشبكة المحلية (LAN)

1. تأكد من تثبيت Docker و Docker Compose
2. اتبع خطوات التثبيت أعلاه
3. احصل على عنوان IP للخادم
4. تأكد من أن المنفذ 80 مفتوح في الجدار الناري

## النسخ الاحتياطي

```bash
docker compose exec backend python -m app.scripts.backup
```

## الاختبار

```bash
docker compose exec backend pytest
docker compose exec frontend npm test
```

## الأمان

- JWT Authentication
- Refresh Tokens
- Password Hashing (Argon2)
- RBAC
- Rate Limiting
- CORS
- Secure Headers
- Input Validation
- SQL Injection Protection

## الترخيص

MIT
