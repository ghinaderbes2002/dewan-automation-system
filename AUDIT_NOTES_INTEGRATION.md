# دليل تكامل حقل audit_notes - للفرونت اند

## ✅ ما تم تنفيذه

تم إضافة حقل موحد `audit_notes` لكل أنواع الطلبات لتسهيل عملية التدقيق.

---

## 1️⃣ التعديلات في قاعدة البيانات

### الحقل الجديد في كل الجداول:
```sql
audit_notes TEXT NULL  -- ملاحظات التدقيق الموحدة
```

### الجداول المعدلة:
- ✅ `membership_requests`
- ✅ `training_requests`
- ✅ `office_opening_requests`
- ✅ `promotion_requests`

---

## 2️⃣ API Endpoints

### الحقل متاح في كل الـ Endpoints التالية:

#### طلبات الانتساب:
```
GET /membership_requests
GET /membership_requests/:id
PATCH /membership_requests/:id
```

#### طلبات التدريب:
```
GET /training_requests
GET /training_requests/:id
PATCH /training_requests/:id
```

#### طلبات فتح المكتب:
```
GET /office_opening_requests
GET /office_opening_requests/:id
PUT /office_opening_requests/:id
POST /office_opening_requests/approve/:id
```

#### طلبات الترقية:
```
GET /promotion_requests
GET /promotion_requests/:id
PATCH /promotion_requests/:id
```

---

## 3️⃣ كيفية الاستخدام

### أ) إضافة/تحديث ملاحظات التدقيق

**مثال: موظف التدقيق يكتب ملاحظة على طلب انتساب**

```javascript
// PATCH /membership_requests/:id
{
  "status": "needs_correction",
  "audit_notes": "يرجى تقديم صورة عن الشهادة الجامعية مصدقة من وزارة التعليم العالي"
}
```

**مثال: موظف التدقيق يكتب ملاحظة على طلب تدريب**

```javascript
// PATCH /training_requests/:id
{
  "status": "approved",
  "audit_notes": "تمت الموافقة على الطلب - المتدرب مستوفي الشروط"
}
```

**مثال: موظف التدقيق يكتب ملاحظة على طلب فتح مكتب**

```javascript
// PUT /office_opening_requests/:id
{
  "status": "needs_correction",
  "audit_notes": "يرجى إرفاق وثيقة الترخيص من البلدية"
}
```

**مثال: موظف التدقيق يكتب ملاحظة على طلب ترقية**

```javascript
// PATCH /promotion_requests/:id
{
  "status": "approved",
  "audit_notes": "المهندس مستوفي شروط الترقية إلى رتبة مهندس استشاري"
}
```

---

### ب) قراءة ملاحظات التدقيق

**Response Example - طلب انتساب:**
```json
{
  "id": "1",
  "full_name_ar": "أحمد محمد",
  "status": "needs_correction",
  "audit_notes": "يرجى تقديم صورة عن الشهادة الجامعية مصدقة من وزارة التعليم العالي",
  "created_at": "2025-02-01T10:00:00.000Z"
}
```

**Response Example - طلب تدريب:**
```json
{
  "id": "5",
  "engineer_id": "15",
  "host_office_name": "مكتب الهندسة الاستشارية",
  "status": "approved",
  "audit_notes": "تمت الموافقة على الطلب - المتدرب مستوفي الشروط",
  "created_at": "2025-02-01T10:00:00.000Z"
}
```

**Response Example - طلب فتح مكتب:**
```json
{
  "id": "3",
  "office_name": "مكتب الاستشارات الهندسية",
  "status": "needs_correction",
  "audit_notes": "يرجى إرفاق وثيقة الترخيص من البلدية",
  "created_at": "2025-02-01T10:00:00.000Z"
}
```

**Response Example - طلب ترقية:**
```json
{
  "id": "2",
  "target_rank": "مهندس استشاري",
  "status": "approved",
  "audit_notes": "المهندس مستوفي شروط الترقية إلى رتبة مهندس استشاري",
  "created_at": "2025-02-01T10:00:00.000Z"
}
```

---

## 4️⃣ عرض الملاحظات في الفرونت اند

### Component React المقترح:

```jsx
const AuditNoteDisplay = ({ note }) => {
  if (!note) return null;

  return (
    <div className="audit-note-card">
      <div className="audit-note-header">
        <i className="icon-alert-circle"></i>
        <h4>ملاحظات التدقيق</h4>
      </div>
      <p className="audit-note-content">{note}</p>
    </div>
  );
};

// الاستخدام:
<AuditNoteDisplay note={request.audit_notes} />
```

### CSS المقترح:

```css
.audit-note-card {
  background: #fff3cd;
  border-right: 4px solid #ffc107;
  padding: 16px;
  margin: 16px 0;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.audit-note-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.audit-note-header i {
  color: #ff9800;
  font-size: 20px;
}

.audit-note-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.audit-note-content {
  color: #555;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}
```

---

## 5️⃣ سيناريوهات الاستخدام

### سيناريو 1: موظف التدقيق يرفض طلب

```javascript
// Frontend Code
async function rejectRequest(requestId, auditNotes) {
  const response = await fetch(`/api/membership_requests/${requestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: 'rejected',
      audit_notes: auditNotes
    })
  });

  return response.json();
}

// الاستخدام:
await rejectRequest(123, 'الوثائق المقدمة غير مستوفية للشروط المطلوبة');
```

### سيناريو 2: موظف التدقيق يطلب تصحيح

```javascript
async function requestCorrection(requestId, auditNotes) {
  const response = await fetch(`/api/training_requests/${requestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: 'needs_correction',
      audit_notes: auditNotes
    })
  });

  return response.json();
}

// الاستخدام:
await requestCorrection(456, 'يرجى إرفاق موافقة المكتب المضيف');
```

### سيناريو 3: موظف التدقيق يوافق على طلب

```javascript
async function approveRequest(requestId, auditNotes) {
  const response = await fetch(`/api/promotion_requests/${requestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: 'approved',
      audit_notes: auditNotes
    })
  });

  return response.json();
}

// الاستخدام:
await approveRequest(789, 'تم الموافقة - الطلب مستوفي جميع الشروط');
```

### سيناريو 4: موظف الطلبات يعرض الطلب مع الملاحظات

```jsx
function RequestDetailPage({ requestId }) {
  const [request, setRequest] = useState(null);

  useEffect(() => {
    fetch(`/api/membership_requests/${requestId}`)
      .then(res => res.json())
      .then(data => setRequest(data));
  }, [requestId]);

  if (!request) return <Loading />;

  return (
    <div className="request-detail">
      <h2>{request.full_name_ar}</h2>
      <p>الحالة: {request.status}</p>

      {/* عرض الملاحظات */}
      {request.audit_notes && (
        <div className="audit-note-section">
          <h3>ملاحظات التدقيق:</h3>
          <AuditNoteDisplay note={request.audit_notes} />
        </div>
      )}

      {/* باقي تفاصيل الطلب */}
    </div>
  );
}
```

### سيناريو 5: المهندس يعرض طلبه مع الملاحظات

```jsx
function MyRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch('/api/engineers/my-requests')
      .then(res => res.json())
      .then(data => setRequests(data));
  }, []);

  return (
    <div className="my-requests">
      <h2>طلباتي</h2>

      {requests.map(request => (
        <div key={request.id} className="request-card">
          <h3>{request.type}</h3>
          <p>الحالة: {request.status}</p>

          {/* إذا في ملاحظات، اعرضها للمهندس */}
          {request.audit_notes && (
            <div className="alert alert-warning">
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

## 6️⃣ جدول الملخص

| نوع الطلب | Endpoint للتحديث | Body Parameter | Response Field |
|-----------|------------------|----------------|----------------|
| **Membership** | `PATCH /membership_requests/:id` | `audit_notes` | `audit_notes` |
| **Training** | `PATCH /training_requests/:id` | `audit_notes` | `audit_notes` |
| **Office Opening** | `PUT /office_opening_requests/:id` | `audit_notes` | `audit_notes` |
| **Promotion** | `PATCH /promotion_requests/:id` | `audit_notes` | `audit_notes` |

---

## 7️⃣ الفرق بين الحقول القديمة والجديدة

### قبل التعديل:

| نوع الطلب | الحقل القديم | المشكلة |
|-----------|--------------|---------|
| Membership | `study_notes` | اسم غير موحد |
| Training | `notes_from_branch` | متعدد وغير واضح |
| Office Opening | ❌ لا يوجد | ما كان في ملاحظات |
| Promotion | `first_committee_notes` | متعدد ومعقد |

### بعد التعديل:

| نوع الطلب | الحقل الجديد | المميزات |
|-----------|--------------|----------|
| Membership | `audit_notes` | موحد وواضح |
| Training | `audit_notes` | موحد وواضح |
| Office Opening | `audit_notes` | موحد وواضح |
| Promotion | `audit_notes` | موحد وواضح |

⚠️ **ملاحظة مهمة**: الحقول القديمة **لا تزال موجودة** ويمكن استخدامها، لكن `audit_notes` هو الحقل الموحد الموصى باستخدامه.

---

## 8️⃣ Migration (اختياري)

إذا بدك تنقل البيانات من الحقول القديمة للحقل الجديد:

```sql
-- طلبات الانتساب
UPDATE membership_requests
SET audit_notes = study_notes
WHERE study_notes IS NOT NULL AND audit_notes IS NULL;

-- طلبات التدريب
UPDATE training_requests
SET audit_notes = notes_from_branch
WHERE notes_from_branch IS NOT NULL AND audit_notes IS NULL;

-- طلبات الترقية
UPDATE promotion_requests
SET audit_notes = CONCAT_WS('\n\n',
  NULLIF(first_committee_notes, ''),
  NULLIF(second_committee_notes, ''),
  NULLIF(administrative_opinion, '')
)
WHERE audit_notes IS NULL;
```

---

## ✅ الخلاصة

### ما تم:
1. ✅ إضافة حقل `audit_notes` لكل جداول الطلبات
2. ✅ تعديل Controllers لدعم الحقل الجديد
3. ✅ الحقل متاح في GET و PATCH/PUT endpoints

### ما يجب على الفرونت اند:
1. **عرض `audit_notes`** في صفحات تفاصيل الطلبات
2. **إضافة textarea** في واجهة موظف التدقيق لكتابة الملاحظات
3. **إرسال `audit_notes`** عند تحديث حالة الطلب

### مثال Form بسيط:

```jsx
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
    rows="5"
    placeholder="اكتب ملاحظاتك هنا..."
    required
  />

  <button type="submit">حفظ</button>
</form>
```

---

**تاريخ التحديث**: 2025-02-02
**الإصدار**: 1.0
**الحالة**: ✅ جاهز للاستخدام
