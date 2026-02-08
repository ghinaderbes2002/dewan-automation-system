# ملخص التحديثات للفرونت اند 📋

## 🎯 التحديثات الجديدة

تم عمل تحديثين رئيسيين:

### 1️⃣ حقل `audit_notes` الموحد
### 2️⃣ إمكانية رفع المرفقات للمهندسين

---

## 📌 التحديث الأول: حقل audit_notes الموحد

### ما هو؟
حقل موحد اسمه `audit_notes` تم إضافته لجميع أنواع الطلبات لتسهيل كتابة ملاحظات التدقيق.

### في أي جداول؟
- ✅ طلبات الانتساب (`membership_requests`)
- ✅ طلبات التدريب (`training_requests`)
- ✅ طلبات فتح المكتب (`office_opening_requests`)
- ✅ طلبات الترقية (`promotion_requests`)

### كيف تستخدمه؟

#### أ) عرض الملاحظات (GET Request)

الحقل موجود تلقائياً في الـ Response:

```json
{
  "id": "123",
  "full_name_ar": "أحمد محمد",
  "status": "needs_correction",
  "audit_notes": "يرجى تقديم صورة عن الشهادة مصدقة",
  "created_at": "2025-02-01T10:00:00.000Z"
}
```

**كود React للعرض:**

```jsx
// في صفحة تفاصيل الطلب
{request.audit_notes && (
  <div className="audit-note-box">
    <h4>ملاحظات التدقيق:</h4>
    <p>{request.audit_notes}</p>
  </div>
)}
```

---

#### ب) إرسال الملاحظات (PATCH/PUT Request)

عند تحديث الطلب من موظف التدقيق:

```javascript
// مثال: تحديث طلب انتساب
await fetch('/api/membership_requests/123', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'needs_correction',
    audit_notes: 'يرجى تقديم صورة عن الشهادة مصدقة من وزارة التعليم'
  })
});
```

**نفس الطريقة لجميع الطلبات - فقط غير الـ endpoint:**

| نوع الطلب | Endpoint للتحديث |
|-----------|------------------|
| انتساب | `PATCH /membership_requests/:id` |
| تدريب | `PATCH /training_requests/:id` |
| فتح مكتب | `PUT /office_opening_requests/:id` |
| ترقية | `PATCH /promotion_requests/:id` |

---

#### ج) Form موظف التدقيق

أضف textarea في واجهة موظف التدقيق:

```jsx
<form onSubmit={handleAuditSubmit}>
  <label>حالة الطلب:</label>
  <select name="status" required>
    <option value="approved">موافقة</option>
    <option value="rejected">رفض</option>
    <option value="needs_correction">يحتاج تصحيح</option>
  </select>

  <label>ملاحظات التدقيق:</label>
  <textarea
    name="audit_notes"
    defaultValue={request.audit_notes || ''}
    placeholder="اكتب ملاحظاتك هنا..."
    rows="5"
  />

  <button type="submit">حفظ</button>
</form>
```

---

### أين تعرض الملاحظات؟

#### 1. واجهة موظف التدقيق
- يكتب الملاحظات في textarea
- يشوف الملاحظات السابقة إذا كانت موجودة

#### 2. واجهة موظف الطلبات
- يشوف الملاحظات اللي كتبها موظف التدقيق
- عرض فقط (read-only)

#### 3. واجهة المهندس
- يشوف ملاحظات الديوان على طلباته
- عرض فقط (read-only)

---

## 📌 التحديث الثاني: رفع المرفقات للمهندسين

### ما هي المشكلة السابقة؟
المهندس يقدر يقدم طلب انتساب، لكن ما يقدر يرفع المرفقات - كان لازم موظف يرفعها.

### الحل:
تم إضافة endpoint جديد للمهندسين لرفع مرفقات طلبات الانتساب الخاصة فيهم.

---

### كيف تستخدمه؟

#### الـ Endpoint الجديد:

```
POST /api/engineers/requests/membership/upload
```

#### Authentication:
- يجب إرسال Bearer Token للمهندس
- Header: `Authorization: Bearer <engineer_token>`

#### Body Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `membershipRequestId` | string/number | ✅ Yes | رقم طلب الانتساب |
| Files | FormData | ✅ Yes | الملفات المراد رفعها |

---

#### مثال كامل - React Code:

```jsx
async function uploadMyDocuments(membershipRequestId, files) {
  const formData = new FormData();

  // إضافة رقم الطلب
  formData.append('membershipRequestId', membershipRequestId);

  // إضافة الملفات
  formData.append('national_id', files.nationalId);
  formData.append('graduation_certificate', files.graduationCert);
  formData.append('doc_national_id', files.docNationalId);
  // ... باقي الملفات

  const response = await fetch('/api/engineers/requests/membership/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${engineerToken}`
      // لا تضع Content-Type - المتصفح يضعها تلقائياً
    },
    body: formData
  });

  const result = await response.json();
  console.log(result.message); // "تم رفع المستندات بنجاح"
  console.log(result.files); // قائمة الملفات المرفوعة
}
```

---

#### Form كامل للمهندس:

```jsx
function UploadMembershipDocuments({ membershipRequestId }) {
  const [uploading, setUploading] = useState(false);
  const engineerToken = localStorage.getItem('engineerToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.target);
    formData.append('membershipRequestId', membershipRequestId);

    try {
      const response = await fetch('/api/engineers/requests/membership/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${engineerToken}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        alert('تم رفع المستندات بنجاح ✅');
        console.log('Files:', result.files);
      } else {
        alert(`خطأ: ${result.message}`);
      }
    } catch (error) {
      alert('حدث خطأ في الرفع');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>رفع مستندات طلب الانتساب</h3>

      <div>
        <label>البطاقة الشخصية:</label>
        <input type="file" name="national_id" required />
      </div>

      <div>
        <label>شهادة التخرج:</label>
        <input type="file" name="graduation_certificate" required />
      </div>

      <div>
        <label>وثيقة البطاقة الشخصية:</label>
        <input type="file" name="doc_national_id" />
      </div>

      <div>
        <label>وثيقة شهادة التخرج:</label>
        <input type="file" name="doc_graduation_certificate" />
      </div>

      {/* أضف باقي الحقول حسب الحاجة */}

      <button type="submit" disabled={uploading}>
        {uploading ? 'جاري الرفع...' : 'رفع المستندات'}
      </button>
    </form>
  );
}
```

---

### أسماء الحقول المتاحة:

يمكنك رفع أي من الملفات التالية:

#### ملفات أساسية:
- `national_id` - البطاقة الشخصية
- `graduation_certificate` - شهادة التخرج
- `registration_form` - استمارة الانتساب
- `personal_photo` - الصورة الشخصية

#### وثائق إضافية (checkboxes):
- `doc_national_id`
- `doc_graduation_certificate`
- `doc_civil_registry`
- `doc_passport`
- `doc_driving_license`
- `doc_equivalency_certificate`
- `doc_good_conduct_certificate`
- `doc_registration_form`
- `doc_training_completion_certificate`
- `doc_ministry_approval`
- `doc_personal_photo`
- `doc_fee_receipt`

---

### Response النموذجي:

#### Success (200):
```json
{
  "message": "تم رفع المستندات بنجاح",
  "files": [
    {
      "field": "national_id",
      "document_type": "البطاقة الشخصية",
      "file_path": "/uploads/membership/1738512345678-123456789.jpg"
    },
    {
      "field": "graduation_certificate",
      "document_type": "شهادة التخرج",
      "file_path": "/uploads/membership/1738512345679-987654321.pdf"
    }
  ]
}
```

#### Error - طلب غير موجود (404):
```json
{
  "message": "طلب الانتساب غير موجود"
}
```

#### Error - ليس طلبك (403):
```json
{
  "message": "ليس لديك صلاحية رفع مرفقات لهذا الطلب"
}
```

#### Error - لا ملفات (400):
```json
{
  "message": "لم يتم رفع أي ملفات"
}
```

---

## 🔐 ملاحظات الأمان

### للـ Endpoint الجديد:

1. **يجب أن يكون المهندس مسجل دخول** (Bearer Token)
2. **يمكن رفع مرفقات فقط لطلباته الخاصة** - النظام يتحقق أن `request.engineer_id` يطابق المهندس الحالي
3. **لا يمكن رفع مرفقات لطلبات مهندسين آخرين**

---

## 📝 CSS للتصميم

```css
/* صندوق ملاحظات التدقيق */
.audit-note-box {
  background: #fff3cd;
  border-right: 4px solid #ffc107;
  padding: 16px;
  margin: 16px 0;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.audit-note-box h4 {
  color: #856404;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.audit-note-box p {
  color: #555;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

/* Form رفع الملفات */
.upload-form {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.upload-form input[type="file"] {
  display: block;
  margin: 8px 0 16px 0;
  padding: 8px;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.upload-form button {
  background: #4caf50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.upload-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

---

## 📊 ملخص الـ Endpoints

### للمهندسين:

| Action | Method | Endpoint | Auth |
|--------|--------|----------|------|
| رفع مرفقات الانتساب | POST | `/api/engineers/requests/membership/upload` | Engineer Token |

### لموظف التدقيق:

| Action | Method | Endpoint | Body |
|--------|--------|----------|------|
| تحديث طلب انتساب | PATCH | `/api/membership_requests/:id` | `{ status, audit_notes }` |
| تحديث طلب تدريب | PATCH | `/api/training_requests/:id` | `{ status, audit_notes }` |
| تحديث طلب فتح مكتب | PUT | `/api/office_opening_requests/:id` | `{ status, audit_notes }` |
| تحديث طلب ترقية | PATCH | `/api/promotion_requests/:id` | `{ status, audit_notes }` |

### لجميع المستخدمين (حسب الصلاحيات):

| Action | Method | Endpoint | Returns |
|--------|--------|----------|---------|
| عرض طلب | GET | `/api/{request_type}/:id` | يشمل `audit_notes` |

---

## ✅ Checklist للفرونت اند

### واجهة موظف التدقيق:
- [ ] إضافة textarea لـ `audit_notes` في form التدقيق
- [ ] عرض `audit_notes` الحالية (defaultValue)
- [ ] إرسال `audit_notes` مع الـ status عند الحفظ

### واجهة موظف الطلبات:
- [ ] عرض `audit_notes` في صفحة تفاصيل الطلب
- [ ] تصميم box مميز للملاحظات

### واجهة المهندس:
- [ ] عرض `audit_notes` في صفحة "طلباتي"
- [ ] إضافة form لرفع مرفقات طلب الانتساب
- [ ] عرض رسالة نجاح/فشل بعد الرفع
- [ ] تحديث قائمة المرفقات بعد الرفع

---

## 🎉 خلصنا!

**التحديثات جاهزة ومطبقة على قاعدة البيانات.**

إذا عندك أي استفسار أو بدك توضيح أكتر، قلي! 😊

---

**تاريخ التحديث:** 2025-02-02
**الإصدار:** 2.0
**الحالة:** ✅ جاهز للتطبيق
