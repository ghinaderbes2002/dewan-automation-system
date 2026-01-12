# شرح مشروع نظام أتمتة الديوان - Dewan Automation System

## 🎯 فكرة المشروع

هاد المشروع هو نظام لإدارة نقابة المهندسين. بيسمح للموظفين يديروا طلبات المهندسين مثل:
- طلبات الانتساب للنقابة
- طلبات فتح مكاتب هندسية
- طلبات التدريب
- طلبات الترقية

---

## 📊 قاعدة البيانات (Database Schema)

المشروع بيستخدم **PostgreSQL** كقاعدة بيانات، وبنتعامل معها عن طريق **Prisma** (أداة بتسهل التعامل مع قاعدة البيانات).

### الجداول الأساسية:

#### 1️⃣ **diwan_employees** - جدول الموظفين
```
- id: رقم الموظف
- full_name: الاسم الكامل
- job_role: الدور الوظيفي (ADMIN / ISSUING / AUDITOR / MEMBERSHIP_AND_SERVICE)
- username: اسم المستخدم
- password_hash: كلمة المرور المشفرة
- is_active: هل الحساب فعال؟
```

**الأدوار الوظيفية:**
- `ADMIN`: مدير النظام
- `ISSUING`: موظف الصادر والوارد
- `AUDITOR`: موظف التدقيق
- `MEMBERSHIP_AND_SERVICE`: موظف الانتساب وضم الخدمة

---

#### 2️⃣ **engineers** - جدول المهندسين
```
- id: رقم المهندس
- full_name_ar: الاسم بالعربي
- full_name_en: الاسم بالإنجليزي
- national_id_number: الرقم الوطني
- nationality: الجنسية
- birth_date: تاريخ الميلاد
- phone, mobile, email: معلومات التواصل
- address: العنوان
```

---

#### 3️⃣ **membership_requests** - طلبات الانتساب
هاد الجدول بيخزن كل طلب انتساب لمهندس جديد للنقابة.

**أهم الحقول:**
```
- id: رقم الطلب
- engineer_id: رقم المهندس (بعد القبول)
- full_name_ar: الاسم الكامل بالعربي
- national_id_number: الرقم الوطني
- university_name: اسم الجامعة
- degree_title: اسم الشهادة
- specialization: الاختصاص
- status: حالة الطلب (draft / approved / rejected)
- received_by_employee_id: رقم الموظف اللي استلم الطلب
```

**جداول مرتبطة بطلب الانتساب:**
- `membership_documents`: المستندات المطلوبة (صورة الهوية، الشهادة، إلخ...)
- `membership_fees`: الرسوم المدفوعة
- `death_aid_forms`: استمارة الإعانة عند الوفاة

---

#### 4️⃣ **training_requests** - طلبات التدريب
```
- engineer_id: رقم المهندس المتدرب
- host_office_id: رقم المكتب المضيف
- planned_training_duration_months: مدة التدريب بالأشهر
- status: حالة الطلب
```

---

#### 5️⃣ **office_opening_requests** - طلبات فتح مكاتب
```
- engineer_id: رقم المهندس
- office_name: اسم المكتب
- office_type: نوع المكتب
- specialization: الاختصاص
- status: حالة الطلب
```

---

#### 6️⃣ **registry_entries** - سجل الصادر والوارد
```
- registry_no: رقم السجل
- direction: الاتجاه (وارد أو صادر)
- date: التاريخ
- from_entity: من جهة
- to_entity: إلى جهة
- subject: الموضوع
```

---

## 🔐 نظام الأمان (Authentication)

### كيف بيشتغل تسجيل الدخول؟

1. **الموظف بيدخل username و password**
2. **النظام بيتحقق من البيانات** من جدول `diwan_employees`
3. **بيقارن كلمة المرور المشفرة** باستخدام `bcrypt`
4. **إذا صحيحة، بيعطيه Token (JWT)** - هاد التوكن زي "مفتاح دخول" للنظام
5. **الموظف بيستخدم هاد التوكن** مع كل طلب بعدين

### الملف المسؤول: `authController.js`

```javascript
// دالة تسجيل الدخول
export const login = async (req, res) => {
  const { username, password } = req.body;  // جبنا البيانات من الطلب

  // بندور عالموظف بقاعدة البيانات
  const employee = await prisma.diwan_employees.findUnique({
    where: { username }
  });

  // إذا ما لقيناه أو الحساب معطل
  if (!employee || !employee.is_active) {
    return res.status(400).json({ message: "خطأ بالبيانات" });
  }

  // بنقارن كلمة المرور
  const valid = await bcrypt.compare(password, employee.password_hash);

  if (!valid) {
    return res.status(400).json({ message: "كلمة المرور خاطئة" });
  }

  // بننشئ توكن فيه معلومات الموظف
  const token = jwt.sign(
    { id: employee.id, full_name: employee.full_name, role: employee.job_role },
    process.env.JWT_SECRET,  // مفتاح سري
    { expiresIn: "7d" }      // التوكن بيصلح لمدة 7 أيام
  );

  // بنرجع التوكن للموظف
  res.json({ token, employee: {...} });
}
```

---

## 🛡️ نظام الصلاحيات (Authorization)

### الملف: `middlewares/auth.js`

في عندنا وظيفتين مهمات:

#### 1. **التحقق من التوكن** - `auth`
```javascript
export const auth = (req, res, next) => {
  // بنجيب التوكن من الـ headers
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "لازم تسجل دخول أولاً" });
  }

  // بنتحقق إنو التوكن صحيح
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // بنخزن معلومات المستخدم بالطلب
  req.user = decoded;
  next();  // كمل للخطوة التالية
}
```

#### 2. **التحقق من الصلاحيات** - `allowRoles`
```javascript
export const allowRoles = (requiredRole) => {
  return (req, res, next) => {
    // بنتأكد إنو دور الموظف هو المطلوب
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "ما عندك صلاحية" });
    }
    next();
  }
}
```

---

## 🌐 الـ Endpoints (نقاط الوصول)

### 1. **المصادقة (Authentication)**
**المسار الأساسي:** `/auth`

| الطريقة | المسار | الوظيفة | الصلاحية |
|---------|--------|---------|----------|
| POST | `/auth/login` | تسجيل الدخول | بدون |
| GET | `/auth/me` | جلب معلومات المستخدم الحالي | أي موظف مسجل |

**مثال على الاستخدام:**
```javascript
// تسجيل الدخول
POST /auth/login
Body: { "username": "admin", "password": "123456" }
Response: { "token": "eyJhbGc...", "employee": {...} }

// جلب معلوماتي
GET /auth/me
Headers: { "Authorization": "Bearer eyJhbGc..." }
Response: { "id": 1, "full_name": "أحمد محمد", "role": "ADMIN" }
```

---

### 2. **إدارة الموظفين**
**المسار الأساسي:** `/employees`

| الطريقة | المسار | الوظيفة | الصلاحية |
|---------|--------|---------|----------|
| POST | `/employees` | إنشاء موظف جديد | موظف مسجل |
| GET | `/employees` | جلب كل الموظفين | موظف مسجل |
| PATCH | `/employees/:id` | تعديل موظف | بدون تحقق |
| DELETE | `/employees/:id` | حذف موظف | بدون تحقق |

**مثال:**
```javascript
// إنشاء موظف
POST /employees
Headers: { "Authorization": "Bearer token..." }
Body: {
  "full_name": "محمد أحمد",
  "job_role": "ISSUING",
  "username": "mohamed",
  "password": "123456"
}
```

---

### 3. **طلبات الانتساب**
**المسار الأساسي:** `/Requests`

| الطريقة | المسار | الوظيفة | الصلاحية |
|---------|--------|---------|----------|
| GET | `/Requests` | جلب كل طلبات الانتساب | MEMBERSHIP_AND_SERVICE |
| GET | `/Requests/:id` | جلب طلب معين | MEMBERSHIP_AND_SERVICE |
| POST | `/Requests` | إنشاء طلب جديد | MEMBERSHIP_AND_SERVICE |
| PATCH | `/Requests/:id` | تعديل طلب | MEMBERSHIP_AND_SERVICE |
| DELETE | `/Requests/:id` | حذف طلب | MEMBERSHIP_AND_SERVICE |
| POST | `/Requests/:id/approve` | الموافقة على الطلب وتحويله لمهندس | MEMBERSHIP_AND_SERVICE |

#### **المستندات:**
| الطريقة | المسار | الوظيفة |
|---------|--------|---------|
| GET | `/Requests/documents?request_id=1` | جلب مستندات طلب معين |
| POST | `/Requests/documents` | إضافة سجل مستندات |
| PATCH | `/Requests/documents/:id` | تعديل المستندات |
| DELETE | `/Requests/documents/:id` | حذف المستندات |

#### **الرسوم:**
| الطريقة | المسار | الوظيفة |
|---------|--------|---------|
| GET | `/Requests/fees?request_id=1` | جلب رسوم طلب معين |
| POST | `/Requests/fees` | إضافة سجل رسوم |
| PATCH | `/Requests/fees/:id` | تعديل الرسوم |
| DELETE | `/Requests/fees/:id` | حذف الرسوم |

#### **استمارات الإعانة:**
| الطريقة | المسار | الوظيفة |
|---------|--------|---------|
| GET | `/Requests/death-aid?request_id=1` | جلب استمارة إعانة |
| POST | `/Requests/death-aid` | إضافة استمارة |
| PATCH | `/Requests/death-aid/:id` | تعديل استمارة |
| DELETE | `/Requests/death-aid/:id` | حذف استمارة |

**شرح الكود:**
```javascript
// جلب كل الطلبات
export const getMembershipRequests = async (req, res) => {
  // بنجيب كل الطلبات من قاعدة البيانات
  const requests = await prisma.membership_requests.findMany({
    include: {  // بنجيب معها البيانات المرتبطة
      membership_documents: true,  // المستندات
      membership_fees: true,       // الرسوم
      death_aid_forms: true,       // استمارات الإعانة
      engineers: true              // بيانات المهندس
    }
  });

  // بنحول الأرقام الكبيرة لنص (BigInt → String)
  res.json(serializeBigInt(requests));
}

// الموافقة على الطلب
export const approveMembershipRequest = async (req, res) => {
  const { id } = req.params;  // رقم الطلب

  // بنجيب الطلب
  const request = await prisma.membership_requests.findUnique({
    where: { id: BigInt(id) }
  });

  // بننشئ سجل مهندس جديد من بيانات الطلب
  const engineer = await prisma.engineers.create({
    data: {
      full_name_ar: request.full_name_ar,
      national_id_number: request.national_id_number,
      // ... باقي البيانات
    }
  });

  // بنحدث حالة الطلب لـ "approved" وبنربطه بالمهندس
  await prisma.membership_requests.update({
    where: { id: BigInt(id) },
    data: {
      status: "approved",
      engineer_id: engineer.id
    }
  });

  res.json({ request, engineer });
}
```

---

### 4. **سجل الصادر والوارد**
**المسار الأساسي:** `/registry`

| الطريقة | المسار | الوظيفة | الصلاحية |
|---------|--------|---------|----------|
| GET | `/registry` | جلب كل السجلات | ISSUING |
| GET | `/registry/:id` | جلب سجل معين | ISSUING |
| POST | `/registry` | إنشاء سجل جديد | ISSUING |
| PATCH | `/registry/:id` | تعديل سجل | ISSUING |
| DELETE | `/registry/:id` | حذف سجل | ISSUING |

---

### 5. **طلبات التدريب**
**المسار الأساسي:** `/training_requests`

| الطريقة | المسار | الوظيفة | الصلاحية |
|---------|--------|---------|----------|
| GET | `/training_requests` | جلب كل طلبات التدريب | MEMBERSHIP_AND_SERVICE |
| GET | `/training_requests/:id` | جلب طلب معين | MEMBERSHIP_AND_SERVICE |
| POST | `/training_requests` | إنشاء طلب تدريب | MEMBERSHIP_AND_SERVICE |
| PATCH | `/training_requests/:id` | تعديل طلب | MEMBERSHIP_AND_SERVICE |
| DELETE | `/training_requests/:id` | حذف طلب | MEMBERSHIP_AND_SERVICE |

---

### 6. **طلبات فتح المكاتب**
**المسار الأساسي:** `/office_opening_requests`

| الطريقة | المسار | الوظيفة | الصلاحية |
|---------|--------|---------|----------|
| GET | `/office_opening_requests` | جلب كل الطلبات | MEMBERSHIP_AND_SERVICE |
| GET | `/office_opening_requests/:id` | جلب طلب معين | MEMBERSHIP_AND_SERVICE |
| POST | `/office_opening_requests` | إنشاء طلب فتح مكتب | MEMBERSHIP_AND_SERVICE |
| PATCH | `/office_opening_requests/:id` | تعديل طلب | MEMBERSHIP_AND_SERVICE |
| DELETE | `/office_opening_requests/:id` | حذف طلب | MEMBERSHIP_AND_SERVICE |

---

### 7. **طلبات الترقية**
**المسار الأساسي:** `/promotion_requests`

| الطريقة | المسار | الوظيفة | الصلاحية |
|---------|--------|---------|----------|
| GET | `/promotion_requests` | جلب كل طلبات الترقية | MEMBERSHIP_AND_SERVICE |
| GET | `/promotion_requests/:id` | جلب طلب معين | MEMBERSHIP_AND_SERVICE |
| POST | `/promotion_requests` | إنشاء طلب ترقية | MEMBERSHIP_AND_SERVICE |
| PATCH | `/promotion_requests/:id` | تعديل طلب | MEMBERSHIP_AND_SERVICE |
| DELETE | `/promotion_requests/:id` | حذف طلب | MEMBERSHIP_AND_SERVICE |

---

### 8. **نظام التدقيق (Auditor)**
**المسار الأساسي:** `/auditor`

| الطريقة | المسار | الوظيفة | الصلاحية |
|---------|--------|---------|----------|
| GET | `/auditor/requests/:type` | جلب الطلبات المعلقة حسب النوع | AUDITOR |
| GET | `/auditor/requests/:type/:id` | جلب تفاصيل طلب معين | AUDITOR |
| PATCH | `/auditor/requests/:type/:id/audit` | مراجعة وتحديث حالة الطلب | AUDITOR |

**الأنواع المتاحة (type):**
- `membership` - طلبات الانتساب
- `training` - طلبات التدريب
- `office_opening` - طلبات فتح المكاتب
- `promotion` - طلبات الترقية

**مثال:**
```javascript
// جلب كل طلبات الانتساب المعلقة
GET /auditor/requests/membership
Headers: { "Authorization": "Bearer token..." }

// تدقيق طلب معين
PATCH /auditor/requests/membership/5/audit
Body: { "status": "approved", "notes": "تم الموافقة" }
```

---

## 🔄 كيف بيشتغل الطلب (Request Flow)

### مثال: إنشاء طلب انتساب

1. **المستخدم بيرسل طلب:**
```
POST /Requests
Headers: { Authorization: "Bearer token..." }
Body: { full_name_ar: "أحمد محمد", ... }
```

2. **السيرفر بيستقبل الطلب** → `index.js`

3. **بيمشي على الـ Middlewares:**
   - `express.json()` → بيحول البيانات لـ JSON
   - `auth` → بيتحقق من التوكن
   - `allowRoles("MEMBERSHIP_AND_SERVICE")` → بيتأكد من الصلاحية

4. **بيوصل للـ Route:** `POST /Requests` → `membershipRequestsRoutes.js`

5. **بينادي الـ Controller:** `createMembershipRequest`

6. **الـ Controller بيتعامل مع قاعدة البيانات:**
```javascript
const request = await prisma.membership_requests.create({ data });
```

7. **بيرجع النتيجة:** `res.json(request)`

---

## 📁 هيكل المشروع

```
dewan-automation-system/
│
├── index.js                    # نقطة البداية - بيشغل السيرفر
│
├── routes/                     # الـ Routes (المسارات)
│   ├── auth/
│   │   └── authRoute.js        # مسارات تسجيل الدخول
│   ├── admin/
│   │   └── employees/
│   │       └── employeesRoute.js
│   └── Requests/
│       ├── membershipRequestsRoutes.js
│       ├── trainingRequestsRoutes.js
│       └── ...
│
├── controller/                 # الـ Controllers (المنطق)
│   ├── auth/
│   │   └── authController.js   # منطق تسجيل الدخول
│   └── Requests/
│       └── membershipRequestsController.js
│
├── middlewares/                # الـ Middlewares
│   └── auth.js                 # التحقق من التوكن والصلاحيات
│
├── prisma/
│   └── schema.prisma           # هيكل قاعدة البيانات
│
└── package.json                # المكتبات المستخدمة
```

---

## 🛠️ المكتبات المستخدمة (بدون تفصيل)

```json
{
  "express": "سيرفر الـ API",
  "prisma": "التعامل مع قاعدة البيانات",
  "bcryptjs": "تشفير كلمات المرور",
  "jsonwebtoken": "إنشاء التوكنات",
  "cors": "السماح بالطلبات من مصادر مختلفة"
}
```

---

## 🎓 ملاحظات مهمة للطلاب

### 1. **BigInt ليش بنستخدمه؟**
الأرقام الكبيرة بـ PostgreSQL (BigInt) ما بتشتغل مباشرة بـ JSON.
لهيك عندنا دالة `serializeBigInt` بتحولهم لنص (String).

### 2. **ليش التوكن (JWT)؟**
بدل ما نخزن session لكل مستخدم بالسيرفر، بنعطيه توكن فيه معلوماته.
كل ما بيرسل طلب بيبعت معه التوكن.

### 3. **الفرق بين Authentication و Authorization:**
- **Authentication**: هل أنت مسجل؟ (login)
- **Authorization**: هل عندك صلاحية تعمل هاد الشي؟ (roles)

### 4. **HTTP Methods:**
- **GET**: جلب بيانات
- **POST**: إنشاء جديد
- **PATCH**: تعديل جزء من البيانات
- **DELETE**: حذف

### 5. **Status Codes:**
- **200**: نجح الطلب
- **400**: خطأ بالبيانات المرسلة
- **401**: غير مصرح (لازم تسجل دخول)
- **403**: ممنوع (ما عندك صلاحية)
- **500**: خطأ بالسيرفر

---

## 🚀 كيف تشغل المشروع؟

1. تثبيت المكتبات: `npm install`
2. تشغيل قاعدة البيانات: `npx prisma migrate dev`
3. تشغيل السيرفر: `npm start`
4. السيرفر راح يشتغل على: `http://localhost:3000`

---

## ✅ خلاصة

المشروع هو نظام backend كامل لإدارة نقابة المهندسين، فيه:
- نظام مصادقة وصلاحيات
- إدارة الموظفين
- إدارة طلبات الانتساب والتدريب والمكاتب والترقيات
- نظام تدقيق
- سجل صادر ووارد

كل endpoint بيشتغل بطريقة مشابهة:
1. استقبال الطلب
2. التحقق من التوكن والصلاحيات
3. التعامل مع قاعدة البيانات
4. إرجاع النتيجة
