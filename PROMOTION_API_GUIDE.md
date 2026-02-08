# دليل استخدام API طلبات الترقية (Promotion Requests)

## نظرة عامة
API لإدارة طلبات ترقيات المهندسين مع المؤهلات والخبرات العملية.

---

## المشكلة التي تم حلها

### الخطأ السابق:
```
Invalid value for argument `obtained_date`: premature end of input. Expected ISO-8601 DateTime.
```

### السبب:
- حقل `obtained_date` في جدول `promotion_qualifications` معرف كـ `DateTime` وليس `Date`
- كان يتم إرسال التاريخ بصيغة: `"2025-02-13"` (تاريخ فقط)
- Prisma يتوقع صيغة ISO-8601 كاملة: `"2025-02-13T00:00:00.000Z"`

### الحل:
تم تعديل Controller لتحويل جميع التواريخ تلقائياً إلى `DateTime` قبل حفظها في قاعدة البيانات.

---

## الـ Endpoints المتاحة

### 1. إنشاء طلب ترقية جديد

**Endpoint:**
```
POST http://localhost:3000/promotion_requests
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {{jwt_token}}"
}
```

**الصلاحية المطلوبة:**
```
MEMBERSHIP_AND_SERVICE
```

**Body (الطريقة الصحيحة):**

```json
{
  "engineer_id": 15,
  "target_rank": "مهندس مستشار",
  "register_number": "12345",
  "request_date": "2025-02-01T10:00:00.000Z",
  "specialization": "هندسة كهربائية",
  "work_address": "دمشق - شارع الثورة",
  "residence_address": "دمشق - المزة",
  "phone": "+963-11-1234567",
  "status": "under_review",

  "promotion_qualifications": [
    {
      "degree_name": "ماجستير في الهندسة الكهربائية",
      "obtained_date": "2020-06-15T00:00:00.000Z",
      "specialization": "هندسة القوى الكهربائية",
      "university_and_faculty": "جامعة دمشق - كلية الهندسة الكهربائية"
    },
    {
      "degree_name": "دكتوراه في الهندسة الكهربائية",
      "obtained_date": "2024-09-01T00:00:00.000Z",
      "specialization": "أنظمة الطاقة المتجددة",
      "university_and_faculty": "جامعة حلب - كلية الهندسة"
    }
  ],

  "promotion_experiences": [
    {
      "from_year": 2015,
      "to_year": 2020,
      "employer": "شركة الكهرباء السورية",
      "job_title_and_work_type": "مهندس تصميم - تصميم محطات التحويل"
    },
    {
      "from_year": 2020,
      "to_year": 2025,
      "employer": "مكتب الاستشارات الهندسية",
      "job_title_and_work_type": "مهندس مشرف - الإشراف على مشاريع الطاقة"
    }
  ]
}
```

**ملاحظات مهمة:**

✅ **التواريخ الصحيحة:**
- يمكن إرسال التاريخ بأي صيغة، سيتم تحويلها تلقائياً:
  - `"2025-02-13"` ← سيتم تحويلها
  - `"2025-02-13T10:00:00.000Z"` ← صحيحة مباشرة
  - `"2025-02-13T10:00:00"` ← سيتم تحويلها

❌ **الأخطاء الشائعة:**
```json
{
  "promotion_experiences": [
    {
      "from_year": 2020,
      "to_year": 2015  // ❌ خطأ: السنة النهائية أقدم من الابتدائية!
    }
  ]
}
```

✅ **الصحيح:**
```json
{
  "promotion_experiences": [
    {
      "from_year": 2015,
      "to_year": 2020  // ✅ صحيح: السنة النهائية أحدث
    }
  ]
}
```

---

### 2. عرض جميع طلبات الترقية

**Endpoint:**
```
GET http://localhost:3000/promotion_requests
```

**Headers:**
```json
{
  "Authorization": "Bearer {{jwt_token}}"
}
```

**Response Example:**
```json
[
  {
    "id": "1",
    "engineer_id": "15",
    "target_rank": "مهندس مستشار",
    "register_number": "12345",
    "request_date": "2025-02-01T10:00:00.000Z",
    "status": "under_review",
    "created_at": "2025-02-01T08:00:00.000Z",
    "engineers": {
      "id": "15",
      "full_name_ar": "أحمد محمد علي"
    },
    "promotion_qualifications": [
      {
        "id": "1",
        "degree_name": "ماجستير في الهندسة الكهربائية",
        "obtained_date": "2020-06-15T00:00:00.000Z",
        "specialization": "هندسة القوى الكهربائية"
      }
    ],
    "promotion_experiences": [
      {
        "id": "1",
        "from_year": 2015,
        "to_year": 2020,
        "employer": "شركة الكهرباء السورية"
      }
    ]
  }
]
```

---

### 3. عرض طلب ترقية محدد

**Endpoint:**
```
GET http://localhost:3000/promotion_requests/:id
```

**مثال:**
```
GET http://localhost:3000/promotion_requests/1
```

---

### 4. تعديل طلب ترقية

**Endpoint:**
```
PATCH http://localhost:3000/promotion_requests/:id
```

**Body Example (تعديل جزئي):**
```json
{
  "status": "approved",
  "branch_council_decision": "تمت الموافقة على الترقية",
  "branch_council_decision_date": "2025-02-15T10:00:00.000Z",
  "promotion_effective_date": "2025-03-01T00:00:00.000Z",

  "promotion_fee_amount": 150000,
  "promotion_fee_receipt_no": "REC-2025-001",
  "promotion_fee_receipt_date": "2025-02-16T09:00:00.000Z"
}
```

**تعديل المؤهلات والخبرات:**
```json
{
  "promotion_qualifications": [
    {
      "degree_name": "دبلوم تدريبي في الطاقة الشمسية",
      "obtained_date": "2023-12-01T00:00:00.000Z",
      "specialization": "الطاقة المتجددة",
      "university_and_faculty": "معهد التدريب الهندسي"
    }
  ]
}
```

**ملاحظة:** عند تعديل المؤهلات أو الخبرات، يتم حذف القديمة واستبدالها بالجديدة بالكامل.

---

### 5. حذف طلب ترقية

**Endpoint:**
```
DELETE http://localhost:3000/promotion_requests/:id
```

**مثال:**
```
DELETE http://localhost:3000/promotion_requests/1
```

**Response:**
```json
{
  "message": "Deleted successfully"
}
```

---

### 6. رفع المستندات

**Endpoint:**
```
POST http://localhost:3000/promotion_requests/upload
```

**Headers:**
```json
{
  "Authorization": "Bearer {{jwt_token}}",
  "Content-Type": "multipart/form-data"
}
```

**Body (Form-data):**
```
promotionRequestId: 1
university_degree: [ملف PDF/صورة]
experience_certificates: [ملف PDF/صورة]
previous_rank_decision: [ملف PDF/صورة]
```

---

## حقول جدول promotion_requests

### الحقول الأساسية:
| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `engineer_id` | BigInt | ✅ | معرف المهندس |
| `target_rank` | String | ✅ | الرتبة المستهدفة |
| `register_number` | String | ❌ | رقم القيد |
| `request_date` | DateTime | ❌ | تاريخ الطلب |
| `specialization` | String | ❌ | الاختصاص |
| `work_address` | String | ❌ | عنوان العمل |
| `residence_address` | String | ❌ | عنوان السكن |
| `phone` | String | ❌ | رقم الهاتف |
| `status` | String | ❌ | الحالة (default: "under_review") |

### حقول قرارات الانتساب:
| الحقل | النوع | الوصف |
|------|------|-------|
| `membership_accept_decision_no` | String | رقم قرار قبول الانتساب |
| `membership_accept_decision_date` | DateTime | تاريخ قرار قبول الانتساب |
| `membership_accept_branch` | String | الفرع الذي قبل الانتساب |

### حقول التعديلات السابقة:
| الحقل | النوع | الوصف |
|------|------|-------|
| `last_modification_decision_no` | String | رقم آخر قرار تعديل |
| `last_modification_decision_date` | DateTime | تاريخ آخر قرار تعديل |
| `last_modification_branch` | String | الفرع الذي أصدر التعديل |

### حقول ملخصات الممارسة:
| الحقل | النوع | الوصف |
|------|------|-------|
| `practice_summary_a` | String | ملخص الممارسة (أ) |
| `practice_summary_b` | String | ملخص الممارسة (ب) |

### حقول الاستحقاق:
| الحقل | النوع | الوصف |
|------|------|-------|
| `theoretical_entitlement_date` | DateTime | تاريخ الاستحقاق النظري |
| `half_delay_period_months` | Int | فترة التأخير نصف (بالأشهر) |
| `entitlement_date` | DateTime | تاريخ الاستحقاق الفعلي |

### حقول اللجان والرأي الإداري:
| الحقل | النوع | الوصف |
|------|------|-------|
| `first_committee_notes` | String | ملاحظات اللجنة الأولى |
| `second_committee_notes` | String | ملاحظات اللجنة الثانية |
| `administrative_opinion` | String | الرأي الإداري |

### حقول قرار الترقية:
| الحقل | النوع | الوصف |
|------|------|-------|
| `branch_council_decision` | String | قرار مجلس الفرع |
| `branch_council_decision_date` | DateTime | تاريخ قرار المجلس |
| `promotion_effective_date` | DateTime | تاريخ نفاذ الترقية |

### حقول الرسوم:
| الحقل | النوع | الوصف |
|------|------|-------|
| `promotion_fee_amount` | Decimal | قيمة رسم الترقية |
| `promotion_fee_receipt_no` | String | رقم إيصال الرسم |
| `promotion_fee_receipt_date` | DateTime | تاريخ إيصال الرسم |

---

## حقول جدول promotion_qualifications

| الحقل | النوع | الوصف |
|------|------|-------|
| `degree_name` | String | اسم الشهادة |
| `obtained_date` | DateTime | تاريخ الحصول على الشهادة |
| `specialization` | String | الاختصاص |
| `university_and_faculty` | String | الجامعة والكلية |

---

## حقول جدول promotion_experiences

| الحقل | النوع | الوصف |
|------|------|-------|
| `from_year` | Int | السنة الابتدائية |
| `to_year` | Int | السنة النهائية |
| `employer` | String | جهة العمل |
| `job_title_and_work_type` | String | المسمى الوظيفي ونوع العمل |

---

## حالات الطلب (Status Values)

```javascript
"under_review"     // قيد الدراسة (افتراضي)
"approved"         // موافق عليه
"rejected"         // مرفوض
"pending"          // معلق
"completed"        // مكتمل
```

---

## الرتب المتاحة (Target Ranks)

```
- مهندس
- مهندس ممارس
- مهندس أقدم
- مهندس استشاري
- مهندس مستشار
```

---

## أمثلة Postman Collection

### مثال كامل لطلب ترقية:

```json
{
  "engineer_id": 15,
  "target_rank": "مهندس استشاري",
  "register_number": "SYR-2015-12345",
  "request_date": "2025-02-01T10:00:00.000Z",
  "specialization": "هندسة معمارية",
  "work_address": "دمشق - شارع بغداد - مبنى الاستشارات الهندسية",
  "residence_address": "دمشق - المزة فيلات - ش15",
  "phone": "+963-11-6123456",
  "status": "under_review",

  "membership_accept_decision_no": "DEC-2015-456",
  "membership_accept_decision_date": "2015-06-15T00:00:00.000Z",
  "membership_accept_branch": "فرع دمشق",

  "last_modification_decision_no": "MOD-2020-789",
  "last_modification_decision_date": "2020-03-10T00:00:00.000Z",
  "last_modification_branch": "فرع دمشق",

  "theoretical_entitlement_date": "2024-06-15T00:00:00.000Z",
  "half_delay_period_months": 6,
  "entitlement_date": "2024-12-15T00:00:00.000Z",

  "promotion_qualifications": [
    {
      "degree_name": "بكالوريوس هندسة معمارية",
      "obtained_date": "2010-07-01T00:00:00.000Z",
      "specialization": "عمارة",
      "university_and_faculty": "جامعة دمشق - كلية الهندسة المعمارية"
    },
    {
      "degree_name": "ماجستير في التصميم المعماري",
      "obtained_date": "2018-09-01T00:00:00.000Z",
      "specialization": "تصميم معماري متقدم",
      "university_and_faculty": "الجامعة السورية الخاصة - كلية الهندسة"
    }
  ],

  "promotion_experiences": [
    {
      "from_year": 2010,
      "to_year": 2015,
      "employer": "مكتب الهندسة المعمارية - المهندس أحمد",
      "job_title_and_work_type": "مهندس تصميم - تصميم المباني السكنية والتجارية"
    },
    {
      "from_year": 2015,
      "to_year": 2020,
      "employer": "شركة المقاولات الكبرى",
      "job_title_and_work_type": "مهندس مشرف - الإشراف على المشاريع الإنشائية الكبرى"
    },
    {
      "from_year": 2020,
      "to_year": 2025,
      "employer": "مكتب استشاري خاص",
      "job_title_and_work_type": "مهندس استشاري - استشارات هندسية وإدارة مشاريع"
    }
  ]
}
```

---

## التحقق من صحة البيانات

### التحقق من التواريخ:
```javascript
// ✅ صيغ صحيحة:
"2025-02-13"
"2025-02-13T10:00:00.000Z"
"2025-02-13T10:00:00"
"2025-02-13T10:00:00+03:00"

// ❌ صيغ خاطئة:
"13/02/2025"
"2025/02/13"
"13-02-2025"
```

### التحقق من الخبرات:
```javascript
// ✅ صحيح:
from_year: 2015
to_year: 2020  // أكبر من from_year

// ❌ خطأ:
from_year: 2020
to_year: 2015  // أصغر من from_year
```

---

## معالجة الأخطاء

### أخطاء شائعة وحلولها:

**1. خطأ التاريخ:**
```
Error: Invalid value for argument 'obtained_date': premature end of input
```
**الحل:** تأكد من إرسال التاريخ بصيغة صحيحة أو استخدم صيغة ISO-8601 كاملة.

**2. خطأ الصلاحيات:**
```
Error: Unauthorized - Role MEMBERSHIP_AND_SERVICE required
```
**الحل:** تسجيل الدخول بحساب له صلاحية `MEMBERSHIP_AND_SERVICE`.

**3. خطأ المهندس غير موجود:**
```
Error: Foreign key constraint failed on engineer_id
```
**الحل:** التأكد من وجود المهندس في جدول `engineers`.

---

## ملاحظات مهمة

1. **التواريخ**: جميع حقول التواريخ الآن تدعم أي صيغة، سيتم تحويلها تلقائياً
2. **الصلاحيات**: جميع العمليات تتطلب دور `MEMBERSHIP_AND_SERVICE`
3. **المؤهلات والخبرات**: عند التعديل، يتم استبدال القديم بالكامل
4. **الحذف التتالي**: حذف طلب الترقية يحذف تلقائياً المؤهلات والخبرات المرتبطة (Cascade Delete)

---

## للمزيد من المعلومات

- راجع ملف [schema.prisma](prisma/schema.prisma) لتفاصيل قاعدة البيانات
- راجع ملف [promotionRequestsController.js](controller/Requests/promotionRequestsController.js) لمنطق العمليات
- راجع ملف [BACKEND_TECHNOLOGIES.md](BACKEND_TECHNOLOGIES.md) للتقنيات المستخدمة

---

**تم التحديث**: 2025-02-01
**الإصدار**: 1.0
