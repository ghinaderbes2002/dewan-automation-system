# نظام ديوان الأتمتة - ملخص المشروع

## 📋 معلومات عامة

| البند | القيمة |
|-------|--------|
| اسم المشروع | Dewan Automation System |
| الإصدار | 1.0.0 |
| نوع التطبيق | REST API |
| المنفذ | 3000 |

---

## 🛠️ التقنيات المستخدمة

### Backend
| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| Node.js | - | Runtime |
| Express.js | 5.1.0 | Web Framework |
| Prisma ORM | 6.19.0 | Database ORM |
| PostgreSQL | - | Database |

### المصادقة والأمان
| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| jsonwebtoken (JWT) | 9.0.2 | إنشاء والتحقق من التوكنات |
| bcryptjs | 3.0.3 | تشفير كلمات المرور |

### أخرى
| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| cors | 2.8.5 | Cross-Origin Resource Sharing |
| multer | 2.0.2 | رفع الملفات |

---

## 🔐 نظام المصادقة (Authentication)

### نوعين من المستخدمين:

#### 1. موظفي الديوان (Diwan Employees)
- **جدول**: `diwan_employees`
- **تسجيل الدخول**: `POST /auth/login`
- **Middleware**: `auth.js`
- **الأدوار**:
  - `ADMIN` - مدير النظام
  - `ISSUING` - موظف صادر ووارد
  - `AUDITOR` - موظف تدقيق
  - `MEMBERSHIP_AND_SERVICE` - موظف انتساب وضم خدمة

#### 2. المهندسين (Engineers)
- **جدول**: `engineers`
- **تسجيل حساب**: `POST /engineers/register`
- **تسجيل الدخول**: `POST /engineers/login`
- **Middleware**: `authEngineer.js`

---

## 🔑 كيف يعمل نظام المصادقة

### للموظفين (`middlewares/auth.js`):

```javascript
// 1. استخراج التوكن من Header
const token = req.headers.authorization?.split(" ")[1];

// 2. التحقق من التوكن
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 3. حفظ المستخدم في req.user
req.user = decoded;

// 4. التحقق من الصلاحيات (الأدوار)
allowRoles("MEMBERSHIP_AND_SERVICE") // مثال
```

### للمهندسين (`middlewares/authEngineer.js`):

```javascript
// 1. استخراج التوكن من Header
const token = req.headers.authorization?.split(" ")[1];

// 2. التحقق من التوكن
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 3. التأكد أن المستخدم مهندس
if (decoded.userType !== "engineer") {
  return res.status(403).json({ message: "غير مصرح" });
}

// 4. حفظ المهندس في req.engineer
req.engineer = decoded;
```

---

## 📦 هيكل التوكن (JWT Payload)

### توكن الموظف:
```json
{
  "id": 18,
  "full_name": "مدير النظام",
  "role": "ADMIN",
  "iat": 1768239199,
  "exp": 1768843999
}
```

### توكن المهندس:
```json
{
  "id": 5,
  "email": "engineer@email.com",
  "userType": "engineer",
  "iat": 1768239199,
  "exp": 1770831199
}
```

---

## 🗂️ هيكل المشروع

```
dewan-automation-system/
├── index.js                    # نقطة البداية
├── package.json
├── .env                        # المتغيرات البيئية
│
├── prisma/
│   ├── schema.prisma          # تعريف قاعدة البيانات
│   └── migrations/            # ملفات الهجرة
│
├── middlewares/
│   ├── auth.js                # مصادقة الموظفين
│   ├── authEngineer.js        # مصادقة المهندسين
│   └── upload.js              # رفع الملفات
│
├── routes/
│   ├── auth/
│   │   └── authRoute.js       # /auth/*
│   │
│   ├── engineers/
│   │   └── engineersRoute.js  # /engineers/*
│   │
│   ├── admin/
│   │   ├── employees/         # /employees/*
│   │   └── offices/           # /offices/*
│   │
│   ├── Requests/
│   │   ├── membershipRequestsRoutes.js    # /Requests/*
│   │   ├── trainingRequestsRoutes.js      # /training_requests/*
│   │   ├── officeOpeningRoutes.js         # /office_opening_requests/*
│   │   └── promotionRequestsRoute.js      # /promotion_requests/*
│   │
│   ├── auditor/
│   │   └── auditorRoute.js    # /auditor/*
│   │
│   └── registryEntries/
│       └── registryEntriesRoute.js  # /registry/*
│
└── controller/
    ├── auth/
    │   └── authController.js
    │
    ├── engineers/
    │   └── engineersController.js
    │
    └── Requests/
        └── membershipRequestsController.js
```

---

## 🌐 الـ API Endpoints

### المصادقة (Auth)
| Method | Endpoint | الوصف | المصادقة |
|--------|----------|-------|----------|
| POST | `/auth/login` | تسجيل دخول الموظف | ❌ |
| GET | `/auth/me` | معلومات الموظف الحالي | ✅ موظف |

### المهندسين (Engineers)
| Method | Endpoint | الوصف | المصادقة |
|--------|----------|-------|----------|
| POST | `/engineers/register` | تسجيل مهندس جديد | ❌ |
| POST | `/engineers/login` | تسجيل دخول المهندس | ❌ |
| GET | `/engineers/me` | معلومات المهندس الحالي | ✅ مهندس |
| GET | `/engineers/my-requests` | طلبات المهندس | ✅ مهندس |
| POST | `/engineers/requests/membership` | تقديم طلب انتساب | ✅ مهندس |
| POST | `/engineers/requests/training` | تقديم طلب تدريب | ✅ مهندس |
| POST | `/engineers/requests/office-opening` | تقديم طلب فتح مكتب | ✅ مهندس |
| POST | `/engineers/requests/promotion` | تقديم طلب ترقية | ✅ مهندس |

### طلبات الانتساب (Membership Requests)
| Method | Endpoint | الوصف | المصادقة |
|--------|----------|-------|----------|
| GET | `/Requests` | كل الطلبات | ✅ MEMBERSHIP_AND_SERVICE |
| POST | `/Requests` | إنشاء طلب | ✅ MEMBERSHIP_AND_SERVICE |
| GET | `/Requests/:id` | طلب محدد | ✅ MEMBERSHIP_AND_SERVICE |
| PATCH | `/Requests/:id` | تحديث طلب | ✅ MEMBERSHIP_AND_SERVICE |
| DELETE | `/Requests/:id` | حذف طلب | ✅ MEMBERSHIP_AND_SERVICE |
| POST | `/Requests/:id/approve` | اعتماد طلب | ✅ MEMBERSHIP_AND_SERVICE |

---

## 🔄 سير العمل (Workflow)

### تسجيل المهندس والانتساب:

```
1. المهندس يسجل حساب جديد
   POST /engineers/register
   ↓
2. المهندس يسجل دخول
   POST /engineers/login → يحصل على token
   ↓
3. المهندس يقدم طلب انتساب
   POST /engineers/requests/membership
   status = "pending"
   ↓
4. موظف الانتساب يشوف الطلب
   GET /Requests
   ↓
5. موظف الانتساب يوافق
   POST /Requests/:id/approve
   ↓
6. المهندس يصير مسجل بالنقابة
   is_registered = true
```

---

## ⚙️ المتغيرات البيئية (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/Dewan1"
JWT_SECRET="your-secret-key"
```

---

## 🚀 تشغيل المشروع

```bash
# تثبيت الحزم
npm install

# توليد Prisma Client
npx prisma generate

# تشغيل الـ migrations
npx prisma migrate dev

# تشغيل السيرفر
npm start
```

---

## 📊 جداول قاعدة البيانات

| الجدول | الوصف |
|--------|-------|
| `engineers` | المهندسين |
| `diwan_employees` | موظفي الديوان |
| `membership_requests` | طلبات الانتساب |
| `training_requests` | طلبات التدريب |
| `office_opening_requests` | طلبات فتح المكاتب |
| `promotion_requests` | طلبات الترقية |
| `engineering_offices` | المكاتب الهندسية |
| `membership_documents` | مستندات الانتساب |
| `membership_fees` | رسوم الانتساب |
| `death_aid_forms` | نماذج إعانة الوفاة |
| `registry_entries` | قيود السجل |
| `attachments` | المرفقات |
| `office_division_links` | روابط شعبة المكاتب |
| `promotion_qualifications` | مؤهلات الترقية |
| `promotion_experiences` | خبرات الترقية |

---

## 📝 ملاحظات مهمة

1. **صلاحية توكن الموظف**: 7 أيام
2. **صلاحية توكن المهندس**: 30 يوم
3. **تشفير كلمات المرور**: bcrypt مع 10 rounds
4. **BigInt**: يتم تحويله لـ Number عند الإرجاع للـ frontend
