# التقنيات المستخدمة في Backend - نظام أتمتة الديوان

## نظرة عامة على المشروع
نظام أتمتة ديوان نقابة المهندسين - نظام إدارة شامل لطلبات المهندسين ومعاملاتهم

---

## 1. بيئة التشغيل (Runtime Environment)

### Node.js
- **الوصف**: بيئة تشغيل JavaScript من جانب الخادم
- **الإصدار**: يدعم ES Modules (type: "module")
- **الاستخدام**: تشغيل تطبيق الـ Backend
- **المميزات**:
  - أداء عالي وقابلية للتوسع
  - نظام بيئي ضخم من المكتبات (npm)
  - معالجة غير متزامنة للطلبات

---

## 2. إطار العمل الرئيسي (Web Framework)

### Express.js v5.1.0
- **الوصف**: إطار عمل ويب سريع ومرن لـ Node.js
- **الاستخدام**: بناء REST API وإدارة المسارات (Routes)
- **المميزات**:
  - Middleware system مرن
  - سهولة إدارة الطلبات والردود
  - دعم قوي للـ Routing

**مثال على الاستخدام في المشروع**:
```javascript
const app = express();
app.use(cors());
app.use(express.json());
app.listen(3000, () => console.log("Server running on port 3000"));
```

---

## 3. قاعدة البيانات (Database)

### PostgreSQL
- **الوصف**: نظام إدارة قواعد بيانات علائقية (RDBMS) قوي ومفتوح المصدر
- **الاستخدام**: تخزين جميع بيانات النظام
- **المميزات**:
  - ACID compliance (ضمان سلامة البيانات)
  - دعم للعلاقات المعقدة
  - قابلية للتوسع
  - أداء عالي للاستعلامات المعقدة

**الجداول الرئيسية**:
- `engineers`: بيانات المهندسين (14 جدول)
- `diwan_employees`: موظفو الديوان
- `membership_requests`: طلبات الانتساب
- `training_requests`: طلبات التدريب
- `office_opening_requests`: طلبات فتح مكتب هندسي
- `promotion_requests`: طلبات الترفيع
- `registry_entries`: السجل العام للمعاملات
- جداول أخرى للمستندات والرسوم

---

## 4. ORM (Object-Relational Mapping)

### Prisma v6.19.0
- **الوصف**: ORM حديث وآمن من الأنواع (Type-safe)
- **الاستخدام**: التفاعل مع قاعدة البيانات
- **المميزات**:
  - Schema Definition Language سهل القراءة
  - Auto-completion و IntelliSense
  - Migration system متقدم
  - Query Builder آمن من SQL Injection

**مثال على الاستخدام**:
```javascript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
```

**مثال على Schema**:
```prisma
model engineers {
  id                   BigInt   @id @default(autoincrement())
  full_name_ar         String
  mobile               String?  @unique
  email                String?  @unique
  username             String?  @unique
  password_hash        String?
  is_active            Boolean  @default(true)
  created_at           DateTime @default(now())
}
```

---

## 5. الأمان والمصادقة (Security & Authentication)

### bcryptjs v3.0.3
- **الوصف**: مكتبة تشفير كلمات المرور
- **الاستخدام**: تشفير كلمات مرور المستخدمين
- **المميزات**:
  - Hashing algorithm قوي (Bcrypt)
  - حماية ضد Brute-force attacks
  - Salt rounds قابلة للتخصيص

**الاستخدام في المشروع**:
- تشفير كلمات مرور المهندسين
- تشفير كلمات مرور موظفي الديوان

### jsonwebtoken v9.0.2
- **الوصف**: مكتبة لتوليد والتحقق من JWT tokens
- **الاستخدام**: نظام المصادقة والتفويض
- **المميزات**:
  - Stateless authentication
  - آمن ومشفر
  - يحمل معلومات المستخدم (payload)

**الاستخدام في المشروع**:
- تسجيل دخول المهندسين
- تسجيل دخول موظفي الديوان
- حماية المسارات (Protected Routes)

---

## 6. معالجة البيانات

### CORS (Cross-Origin Resource Sharing) v2.8.5
- **الوصف**: Middleware لإدارة طلبات من أصول مختلفة
- **الاستخدام**: السماح للـ Frontend بالاتصال بالـ Backend
- **المميزات**:
  - حماية من هجمات CSRF
  - التحكم في الأصول المسموحة

### Express.json() Middleware
- **الوصف**: Built-in middleware في Express
- **الاستخدام**: تحليل JSON في الطلبات
- **المميزات**:
  - تحويل تلقائي لـ JSON إلى JavaScript objects

---

## 7. إدارة الملفات

### Multer v2.0.2
- **الوصد**: Middleware لمعالجة multipart/form-data
- **الاستخدام**: رفع الملفات والمرفقات
- **المميزات**:
  - معالجة رفع الملفات المتعددة
  - التحكم في حجم ونوع الملفات
  - تخزين الملفات بأسماء آمنة

**الاستخدام في المشروع**:
- رفع المستندات المطلوبة (شهادات، صور، وثائق)
- حفظ في جدول `attachments`

---

## 8. أدوات التطوير (Development Tools)

### Nodemon (Dev Dependency)
- **الوصف**: أداة لإعادة تشغيل السيرفر تلقائياً
- **الاستخدام**: تسريع عملية التطوير
- **الأمر**: `npm start` (يستخدم nodemon)

---

## 9. المعمارية (Architecture)

### نمط REST API
- **الوصف**: معمارية قياسية للـ Web Services
- **المميزات**:
  - Stateless communication
  - استخدام HTTP Methods (GET, POST, PUT, DELETE)
  - هيكلة واضحة للمسارات

### المسارات الرئيسية (API Routes):

```
/auth                     - المصادقة (تسجيل الدخول)
/employees                - إدارة الموظفين
/Requests                 - طلبات الانتساب
/registry                 - السجل العام
/training_requests        - طلبات التدريب
/office_opening_requests  - طلبات فتح المكاتب
/promotion_requests       - طلبات الترفيع
/auditor                  - التدقيق
/offices                  - المكاتب الهندسية
/engineers                - المهندسين
```

### نمط MVC المعدل
- **الهيكلة**:
  - `routes/`: تعريف المسارات
  - `controllers/`: منطق الأعمال (Business Logic)
  - `prisma/schema.prisma`: طبقة البيانات (Data Layer)

---

## 10. إدارة الصلاحيات (Authorization)

### نظام الأدوار (Role-Based Access Control)
```javascript
enum EmployeeRole {
  ADMIN                   // مدير النظام
  ISSUING                 // موظف صادر ووارد
  AUDITOR                 // موظف تدقيق
  MEMBERSHIP_AND_SERVICE  // موظف انتساب وضم خدمة
}
```

---

## 11. إدارة البيانات

### Prisma Migrations
- **الوصف**: نظام إدارة تغييرات قاعدة البيانات
- **الاستخدام**: تتبع التغييرات في الـ Schema

### Prisma Seeding
- **الوصف**: ملء قاعدة البيانات ببيانات أولية
- **الأمر**: `npm run seed`
- **الملف**: `prisma/seed.js`

---

## 12. المتغيرات البيئية (Environment Variables)

### .env File
```env
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
JWT_SECRET="your-secret-key"
PORT=3000
```

---

## المميزات التقنية للنظام

### 1. الأمان
- ✅ تشفير كلمات المرور (bcrypt)
- ✅ مصادقة قوية (JWT)
- ✅ حماية من SQL Injection (Prisma ORM)
- ✅ CORS policy

### 2. قابلية التوسع
- ✅ معمارية Modular
- ✅ فصل المسؤوليات (Separation of Concerns)
- ✅ استخدام PostgreSQL القابل للتوسع

### 3. الأداء
- ✅ Non-blocking I/O (Node.js)
- ✅ Efficient database queries (Prisma)
- ✅ Connection pooling

### 4. قابلية الصيانة
- ✅ كود واضح ومنظم
- ✅ استخدام ES Modules
- ✅ Type safety مع Prisma

---

## مخطط البنية التقنية (Technology Stack Diagram)

```
┌─────────────────────────────────────────┐
│         Client (Frontend)               │
│         React/Angular/Vue               │
└──────────────┬──────────────────────────┘
               │ HTTP/HTTPS Requests
               ▼
┌─────────────────────────────────────────┐
│         CORS Middleware                 │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│         Express.js Server               │
│    ┌─────────────────────────────┐     │
│    │  Routes (API Endpoints)     │     │
│    └────────┬────────────────────┘     │
│             ▼                           │
│    ┌─────────────────────────────┐     │
│    │  JWT Authentication         │     │
│    │  (jsonwebtoken)             │     │
│    └────────┬────────────────────┘     │
│             ▼                           │
│    ┌─────────────────────────────┐     │
│    │  Controllers                │     │
│    │  (Business Logic)           │     │
│    └────────┬────────────────────┘     │
│             ▼                           │
│    ┌─────────────────────────────┐     │
│    │  Prisma ORM Client          │     │
│    └────────┬────────────────────┘     │
└─────────────┼───────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│      PostgreSQL Database                │
│  ┌───────────────────────────────┐     │
│  │  Tables:                      │     │
│  │  - engineers                  │     │
│  │  - diwan_employees            │     │
│  │  - membership_requests        │     │
│  │  - training_requests          │     │
│  │  - office_opening_requests    │     │
│  │  - promotion_requests         │     │
│  │  - registry_entries           │     │
│  │  - attachments                │     │
│  │  - ... and more               │     │
│  └───────────────────────────────┘     │
└─────────────────────────────────────────┘
```

---

## ملخص التقنيات (Technologies Summary)

| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| Node.js | Latest | Runtime Environment |
| Express.js | 5.1.0 | Web Framework |
| PostgreSQL | Latest | Database |
| Prisma | 6.19.0 | ORM |
| bcryptjs | 3.0.3 | Password Hashing |
| jsonwebtoken | 9.0.2 | Authentication |
| cors | 2.8.5 | CORS Handling |
| multer | 2.0.2 | File Uploads |

---

## الخلاصة

تم بناء Backend نظام أتمتة الديوان باستخدام تقنيات حديثة وموثوقة توفر:
- **الأمان**: تشفير قوي ومصادقة آمنة
- **الأداء**: سرعة عالية في معالجة الطلبات
- **قابلية الصيانة**: كود واضح ومنظم
- **قابلية التوسع**: إمكانية إضافة ميزات جديدة بسهولة
- **الموثوقية**: استخدام تقنيات مُختبرة في production

---

**تاريخ الإنشاء**: 2026
**مشروع التخرج**: نظام أتمتة ديوان نقابة المهندسين
