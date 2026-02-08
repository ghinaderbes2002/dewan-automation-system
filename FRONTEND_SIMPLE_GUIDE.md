# دليل الفرونت اند - ملخص بسيط

## 🎯 الفكرة ببساطة

الآن صار عندنا حقل واحد موحد اسمه `audit_notes` بكل أنواع الطلبات.

---

## 1️⃣ شو لازم تعرضه في الفرونت؟

### عند عرض طلب (GET Request):

الحقل `audit_notes` **موجود أصلاً في الـ Response** - بس اعرضه!

**مثال Response:**
```json
{
  "id": "123",
  "full_name_ar": "أحمد محمد",
  "status": "needs_correction",
  "audit_notes": "يرجى تقديم صورة عن الشهادة مصدقة"
}
```

**كود React:**
```jsx
{request.audit_notes && (
  <div className="alert alert-warning">
    <strong>ملاحظات التدقيق:</strong>
    <p>{request.audit_notes}</p>
  </div>
)}
```

---

## 2️⃣ شو لازم ترسله من الفرونت؟

### عند تحديث طلب (PATCH/PUT Request):

**من واجهة موظف التدقيق - أضف textarea:**

```jsx
<form onSubmit={handleSubmit}>
  <label>حالة الطلب:</label>
  <select name="status">
    <option value="approved">موافقة</option>
    <option value="rejected">رفض</option>
    <option value="needs_correction">يحتاج تصحيح</option>
  </select>

  <label>ملاحظات التدقيق:</label>
  <textarea
    name="audit_notes"
    placeholder="اكتب ملاحظاتك هنا..."
    rows="4"
  />

  <button type="submit">حفظ</button>
</form>
```

**الكود JavaScript:**
```javascript
async function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  await fetch(`/api/membership_requests/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: formData.get('status'),
      audit_notes: formData.get('audit_notes')  // ← أرسل الملاحظة
    })
  });
}
```

---

## 3️⃣ في أي واجهات لازم تعدل؟

### ✅ واجهة موظف التدقيق (Auditor Dashboard):

**صفحة تفاصيل الطلب:**
```jsx
function RequestDetailsPage({ requestId }) {
  const [request, setRequest] = useState(null);

  // ... fetch request data

  return (
    <div>
      <h2>{request.full_name_ar}</h2>

      {/* Form لتحديث الطلب */}
      <form onSubmit={handleAudit}>
        <label>حالة الطلب:</label>
        <select name="status" required>
          <option value="approved">موافقة</option>
          <option value="rejected">رفض</option>
          <option value="needs_correction">يحتاج تصحيح</option>
        </select>

        <label>ملاحظات التدقيق:</label>
        <textarea
          name="audit_notes"
          defaultValue={request.audit_notes || ''}  // ← عرض الملاحظة الحالية
          rows="5"
        />

        <button type="submit">حفظ</button>
      </form>
    </div>
  );
}
```

---

### ✅ واجهة موظف الطلبات (Requests Dashboard):

**صفحة تفاصيل الطلب:**
```jsx
function RequestDetailsPage({ requestId }) {
  const [request, setRequest] = useState(null);

  // ... fetch request data

  return (
    <div>
      <h2>{request.full_name_ar}</h2>
      <p>الحالة: {request.status}</p>

      {/* عرض ملاحظات التدقيق */}
      {request.audit_notes && (
        <div className="audit-note-box">
          <h4>ملاحظات من التدقيق:</h4>
          <p>{request.audit_notes}</p>
        </div>
      )}

      {/* باقي التفاصيل */}
    </div>
  );
}
```

---

### ✅ واجهة المهندس (Engineer Dashboard):

**صفحة طلباتي:**
```jsx
function MyRequestsPage() {
  const [requests, setRequests] = useState([]);

  // ... fetch engineer's requests

  return (
    <div>
      <h2>طلباتي</h2>

      {requests.map(request => (
        <div key={request.id} className="request-card">
          <h3>{request.type}</h3>
          <p>الحالة: {request.status}</p>

          {/* عرض ملاحظات الديوان للمهندس */}
          {request.audit_notes && (
            <div className="alert alert-info">
              <strong>ملاحظات من الديوان:</strong>
              <p>{request.audit_notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 4️⃣ الـ Endpoints اللي بتستخدمها

### جميع أنواع الطلبات:

| النوع | GET (عرض) | PATCH/PUT (تحديث) |
|-------|-----------|-------------------|
| **Membership** | `GET /membership_requests/:id` | `PATCH /membership_requests/:id` |
| **Training** | `GET /training_requests/:id` | `PATCH /training_requests/:id` |
| **Office Opening** | `GET /office_opening_requests/:id` | `PUT /office_opening_requests/:id` |
| **Promotion** | `GET /promotion_requests/:id` | `PATCH /promotion_requests/:id` |

**كلهم نفس الشي - بس غير اسم الـ endpoint!**

---

## 5️⃣ CSS بسيط للتصميم

```css
/* صندوق عرض الملاحظات */
.audit-note-box {
  background: #fff3cd;
  border-right: 4px solid #ffc107;
  padding: 15px;
  margin: 15px 0;
  border-radius: 5px;
}

.audit-note-box h4 {
  color: #856404;
  margin-top: 0;
}

.audit-note-box p {
  color: #555;
  margin-bottom: 0;
  line-height: 1.6;
}

/* Alert للمهندس */
.alert {
  padding: 12px 16px;
  border-radius: 4px;
  margin: 12px 0;
}

.alert-info {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.alert-warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}
```

---

## 6️⃣ مثال كامل - صفحة تدقيق الطلب

```jsx
import React, { useState, useEffect } from 'react';
import './AuditPage.css';

function AuditRequestPage({ requestId, requestType }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب بيانات الطلب
    fetch(`/api/${requestType}_requests/${requestId}`)
      .then(res => res.json())
      .then(data => {
        setRequest(data);
        setLoading(false);
      });
  }, [requestId, requestType]);

  const handleAudit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const status = formData.get('status');
    const audit_notes = formData.get('audit_notes');

    const response = await fetch(`/api/${requestType}_requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status, audit_notes })
    });

    if (response.ok) {
      alert('تم حفظ التدقيق بنجاح');
      window.location.reload();
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="audit-page">
      <h1>تدقيق الطلب</h1>

      {/* معلومات الطلب */}
      <div className="request-info">
        <h3>{request.full_name_ar || request.office_name}</h3>
        <p>الحالة الحالية: {request.status}</p>
      </div>

      {/* عرض الملاحظات الحالية إن وجدت */}
      {request.audit_notes && (
        <div className="current-notes">
          <h4>الملاحظات الحالية:</h4>
          <p>{request.audit_notes}</p>
        </div>
      )}

      {/* Form التدقيق */}
      <form onSubmit={handleAudit} className="audit-form">
        <div className="form-group">
          <label>حالة الطلب:</label>
          <select name="status" required defaultValue={request.status}>
            <option value="under_review">قيد المراجعة</option>
            <option value="approved">موافقة</option>
            <option value="rejected">رفض</option>
            <option value="needs_correction">يحتاج تصحيح</option>
          </select>
        </div>

        <div className="form-group">
          <label>ملاحظات التدقيق:</label>
          <textarea
            name="audit_notes"
            defaultValue={request.audit_notes || ''}
            placeholder="اكتب ملاحظاتك هنا..."
            rows="6"
          />
        </div>

        <button type="submit" className="btn-primary">
          حفظ التدقيق
        </button>
      </form>
    </div>
  );
}

export default AuditRequestPage;
```

---

## 7️⃣ الخلاصة - 3 خطوات بس!

### 1. **عرض الملاحظات:**
```jsx
{request.audit_notes && <p>{request.audit_notes}</p>}
```

### 2. **إرسال الملاحظات:**
```javascript
fetch('/api/requests/:id', {
  method: 'PATCH',
  body: JSON.stringify({
    status: 'approved',
    audit_notes: 'النص هنا'
  })
})
```

### 3. **Form للتدقيق:**
```jsx
<textarea name="audit_notes" />
```

**بس هيك! ما في تعقيدات.** 🎉

---

## 🔑 النقاط المهمة

- ✅ الحقل اسمه `audit_notes` (نفس الاسم لكل الطلبات)
- ✅ موجود في كل الـ GET responses
- ✅ ترسله في PATCH/PUT requests
- ✅ اعرضه للمهندس، موظف التدقيق، وموظف الطلبات

---

**هيك واضح؟ أي استفسار قلي!** 😊
