# دليل الملاحظات للفرونت اند (Frontend Notes Guide)

## نظرة عامة
هذا الدليل يوضح كيف تظهر ملاحظات موظف التدقيق والموظفين الآخرين في الـ API Responses لكل نوع طلب.

---

## 1. طلبات الانتساب (Membership Requests)

### Endpoint:
```
GET /membership_requests
GET /membership_requests/:id
```

### الملاحظات المتاحة:

#### ✅ ملاحظات التدقيق (من موظف AUDITOR):
```json
{
  "study_notes": "نص الملاحظة من موظف التدقيق",
  "study_date": "2025-02-01T10:00:00.000Z",
  "study_employee_id": 5,

  "studied_by": {
    "id": 5,
    "full_name": "خالد التدقيق",
    "job_role": "AUDITOR",
    "username": "auditor1",
    "is_active": true
  }
}
```

#### ✅ معلومات الاستقبال (من موظف ISSUING):
```json
{
  "received_by_employee_id": 3,

  "received_by": {
    "id": 3,
    "full_name": "محمد الاستقبال",
    "job_role": "ISSUING",
    "username": "issuing1"
  }
}
```

### حقول الحالة (Status):
```json
{
  "status": "draft | under_review | approved | rejected"
}
```

### مثال Response كامل:
```json
{
  "id": "1",
  "full_name_ar": "أحمد محمد علي",
  "national_id_number": "01234567890",
  "mobile": "0932123456",
  "email": "ahmad@example.com",
  "status": "under_review",

  "study_engineer_status": "مقبول",
  "study_engineering_department": "هندسة كهربائية",
  "study_specialization": "قوى كهربائية",
  "study_reference": "REF-2025-001",
  "study_notes": "الطلب مستوفي الشروط، يرجى إكمال المستندات المطلوبة",
  "study_date": "2025-02-01T14:30:00.000Z",
  "study_employee_id": 5,

  "studied_by": {
    "id": 5,
    "full_name": "خالد التدقيق",
    "job_role": "AUDITOR",
    "username": "auditor1"
  },

  "received_by": {
    "id": 3,
    "full_name": "محمد الاستقبال",
    "job_role": "ISSUING"
  },

  "created_at": "2025-01-25T10:00:00.000Z",
  "updated_at": "2025-02-01T14:30:00.000Z"
}
```

---

## 2. طلبات التدريب (Training Requests)

### Endpoint:
```
GET /training_requests
GET /training_requests/:id
```

### الملاحظات المتاحة:

#### ملاحظات من الفرع:
```json
{
  "notes_from_branch": "ملاحظات الفرع على الطلب"
}
```

#### ملاحظات موافقة المكتب:
```json
{
  "office_approval_notes": "ملاحظات المكتب الهندسي المضيف"
}
```

#### حقول إضافية مفيدة:
```json
{
  "office_division_decision_summary": "ملخص قرار شعبة المكاتب",
  "training_size": "حجم التدريب المقترح"
}
```

### مثال Response كامل:
```json
{
  "id": "1",
  "engineer_id": "15",
  "request_date": "2025-02-01T10:00:00.000Z",
  "status": "waiting_office | approved | rejected",

  "host_office_name": "مكتب الهندسة الاستشارية",
  "host_engineer_name": "م. خالد أحمد",
  "host_office_specialization": "هندسة معمارية",
  "planned_training_duration_months": 12,

  "notes_from_branch": "الطلب مستوفي الشروط، يوصى بالموافقة",
  "office_approval_notes": "نوافق على استقبال المتدرب لمدة سنة",
  "office_approval_date": "2025-02-05T10:00:00.000Z",

  "office_division_decision_summary": "موافقة شعبة المكاتب على التدريب",
  "training_size": "تدريب كامل - 12 شهر",

  "engineers": {
    "id": "15",
    "full_name_ar": "أحمد محمد",
    "mobile": "0932123456"
  },

  "engineering_offices": {
    "id": "5",
    "office_name": "مكتب الهندسة الاستشارية",
    "specialization": "معماري"
  }
}
```

⚠️ **ملاحظة**: طلبات التدريب **ما فيها foreign key لموظف معين**، الملاحظات عبارة عن نص فقط.

---

## 3. طلبات فتح المكتب (Office Opening Requests)

### Endpoint:
```
GET /office_opening_requests
GET /office_opening_requests/:id
```

### الملاحظات المتاحة:

⚠️ **لا يوجد حقل ملاحظات مخصص** في هذا النوع من الطلبات حالياً.

### حقول القرار:
```json
{
  "office_division_decision_no": "رقم قرار شعبة المكاتب",
  "office_division_decision_date": "2025-02-10T10:00:00.000Z"
}
```

### مثال Response كامل:
```json
{
  "id": "1",
  "engineer_id": "15",
  "request_date": "2025-02-01T10:00:00.000Z",
  "status": "under_review | approved | rejected",

  "office_name": "مكتب الاستشارات الهندسية",
  "office_type": "فردي | مشترك | شركة",
  "specialization": "هندسة مدنية",
  "office_address": "دمشق - المزة - شارع الثورة",
  "office_phone": "011-1234567",

  "office_division_decision_no": "DEC-2025-123",
  "office_division_decision_date": "2025-02-15T10:00:00.000Z",

  "resulting_office_id": "25",

  "engineers": {
    "id": "15",
    "full_name_ar": "أحمد محمد",
    "mobile": "0932123456"
  }
}
```

💡 **اقتراح للفرونت اند**: إذا بدك تعرض ملاحظات، ممكن تستخدم حقل القرار `office_division_decision_no` كملاحظة مؤقتة.

---

## 4. طلبات الترقية (Promotion Requests)

### Endpoint:
```
GET /promotion_requests
GET /promotion_requests/:id
```

### الملاحظات المتاحة:

#### ملاحظات اللجان:
```json
{
  "first_committee_notes": "ملاحظات اللجنة الأولى",
  "second_committee_notes": "ملاحظات اللجنة الثانية"
}
```

#### الرأي الإداري:
```json
{
  "administrative_opinion": "رأي الإدارة في الطلب"
}
```

#### قرار الترقية:
```json
{
  "branch_council_decision": "قرار مجلس الفرع",
  "branch_council_decision_date": "2025-02-20T10:00:00.000Z"
}
```

### مثال Response كامل:
```json
{
  "id": "1",
  "engineer_id": "15",
  "target_rank": "مهندس استشاري",
  "register_number": "SYR-2015-12345",
  "request_date": "2025-02-01T10:00:00.000Z",
  "status": "under_review | approved | rejected",

  "specialization": "هندسة كهربائية",
  "work_address": "دمشق - شارع بغداد",
  "residence_address": "دمشق - المزة",
  "phone": "+963-11-1234567",

  "first_committee_notes": "المهندس مستوفي الشروط الأكاديمية والخبرة المطلوبة",
  "second_committee_notes": "نوصي بالموافقة على الترقية إلى مهندس استشاري",
  "administrative_opinion": "الطلب مستوفي كافة الشروط",

  "branch_council_decision": "الموافقة على ترقية المهندس إلى رتبة مهندس استشاري",
  "branch_council_decision_date": "2025-02-25T10:00:00.000Z",
  "promotion_effective_date": "2025-03-01T00:00:00.000Z",

  "theoretical_entitlement_date": "2024-06-15T00:00:00.000Z",
  "half_delay_period_months": 6,
  "entitlement_date": "2024-12-15T00:00:00.000Z",

  "engineers": {
    "id": "15",
    "full_name_ar": "أحمد محمد",
    "mobile": "0932123456"
  },

  "promotion_qualifications": [
    {
      "id": "1",
      "degree_name": "ماجستير في الهندسة الكهربائية",
      "obtained_date": "2020-06-15T00:00:00.000Z",
      "specialization": "قوى كهربائية"
    }
  ],

  "promotion_experiences": [
    {
      "id": "1",
      "from_year": 2015,
      "to_year": 2020,
      "employer": "شركة الكهرباء السورية",
      "job_title_and_work_type": "مهندس تصميم"
    }
  ]
}
```

⚠️ **ملاحظة**: طلبات الترقية **ما فيها foreign key لموظف معين** كتب الملاحظات.

---

## ملخص الملاحظات حسب نوع الطلب

| نوع الطلب | حقل الملاحظة | معلومات الموظف متاحة؟ |
|-----------|--------------|---------------------|
| **Membership** | `study_notes` | ✅ نعم - `studied_by` |
| **Training** | `notes_from_branch` | ❌ لا |
| **Training** | `office_approval_notes` | ❌ لا |
| **Office Opening** | لا يوجد | ❌ لا |
| **Promotion** | `first_committee_notes` | ❌ لا |
| **Promotion** | `second_committee_notes` | ❌ لا |
| **Promotion** | `administrative_opinion` | ❌ لا |

---

## التعديلات المطلوبة في الفرونت اند

### 1. طلبات الانتساب (Membership Requests):

**قبل:**
```jsx
<div className="note">
  <p>{request.study_notes}</p>
</div>
```

**بعد التعديل:**
```jsx
<div className="note">
  <p className="note-text">{request.study_notes}</p>
  {request.studied_by && (
    <div className="note-meta">
      <span>كتبها: {request.studied_by.full_name}</span>
      <span>الدور: {request.studied_by.job_role}</span>
      <span>التاريخ: {formatDate(request.study_date)}</span>
    </div>
  )}
</div>
```

### 2. طلبات التدريب (Training Requests):

```jsx
<div className="notes-section">
  {request.notes_from_branch && (
    <div className="note">
      <h4>ملاحظات الفرع:</h4>
      <p>{request.notes_from_branch}</p>
    </div>
  )}

  {request.office_approval_notes && (
    <div className="note">
      <h4>ملاحظات المكتب المضيف:</h4>
      <p>{request.office_approval_notes}</p>
      {request.office_approval_date && (
        <span className="date">
          التاريخ: {formatDate(request.office_approval_date)}
        </span>
      )}
    </div>
  )}

  {request.office_division_decision_summary && (
    <div className="note">
      <h4>قرار شعبة المكاتب:</h4>
      <p>{request.office_division_decision_summary}</p>
    </div>
  )}
</div>
```

### 3. طلبات الترقية (Promotion Requests):

```jsx
<div className="notes-section">
  {request.first_committee_notes && (
    <div className="note">
      <h4>ملاحظات اللجنة الأولى:</h4>
      <p>{request.first_committee_notes}</p>
    </div>
  )}

  {request.second_committee_notes && (
    <div className="note">
      <h4>ملاحظات اللجنة الثانية:</h4>
      <p>{request.second_committee_notes}</p>
    </div>
  )}

  {request.administrative_opinion && (
    <div className="note">
      <h4>الرأي الإداري:</h4>
      <p>{request.administrative_opinion}</p>
    </div>
  )}

  {request.branch_council_decision && (
    <div className="note decision">
      <h4>قرار مجلس الفرع:</h4>
      <p>{request.branch_council_decision}</p>
      {request.branch_council_decision_date && (
        <span className="date">
          التاريخ: {formatDate(request.branch_council_decision_date)}
        </span>
      )}
    </div>
  )}
</div>
```

### 4. طلبات فتح المكتب (Office Opening Requests):

```jsx
<div className="decision-section">
  {request.office_division_decision_no && (
    <div className="decision">
      <h4>قرار شعبة المكاتب:</h4>
      <p>رقم القرار: {request.office_division_decision_no}</p>
      {request.office_division_decision_date && (
        <span className="date">
          التاريخ: {formatDate(request.office_division_decision_date)}
        </span>
      )}
    </div>
  )}
</div>
```

---

## Component مقترح للملاحظات (React):

```jsx
import React from 'react';
import './NoteCard.css';

const NoteCard = ({
  title,
  content,
  author,
  date,
  type = 'info' // 'info' | 'warning' | 'success' | 'error'
}) => {
  if (!content) return null;

  return (
    <div className={`note-card note-card--${type}`}>
      {title && <h4 className="note-card__title">{title}</h4>}

      <p className="note-card__content">{content}</p>

      {(author || date) && (
        <div className="note-card__meta">
          {author && (
            <span className="note-card__author">
              <i className="icon-user"></i>
              {author.full_name}
              {author.job_role && ` (${translateRole(author.job_role)})`}
            </span>
          )}

          {date && (
            <span className="note-card__date">
              <i className="icon-calendar"></i>
              {formatDate(date)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// استخدام:
<NoteCard
  title="ملاحظات التدقيق"
  content={request.study_notes}
  author={request.studied_by}
  date={request.study_date}
  type="info"
/>
```

---

## Utility Functions مقترحة:

```javascript
// تحويل أسماء الأدوار للعربية
export const translateRole = (role) => {
  const roles = {
    'ADMIN': 'مدير النظام',
    'ISSUING': 'موظف صادر ووارد',
    'AUDITOR': 'موظف تدقيق',
    'MEMBERSHIP_AND_SERVICE': 'موظف انتساب وضم خدمة'
  };
  return roles[role] || role;
};

// تنسيق التواريخ
export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// التحقق من وجود ملاحظات في الطلب
export const hasNotes = (request, requestType) => {
  switch (requestType) {
    case 'membership':
      return !!request.study_notes;

    case 'training':
      return !!(request.notes_from_branch || request.office_approval_notes);

    case 'promotion':
      return !!(
        request.first_committee_notes ||
        request.second_committee_notes ||
        request.administrative_opinion ||
        request.branch_council_decision
      );

    case 'office_opening':
      return !!request.office_division_decision_no;

    default:
      return false;
  }
};
```

---

## التغييرات في الـ Backend:

### ملف Schema (لم يتم تعديله):
- الملاحظات موجودة في نفس جداول الطلبات
- لم يتم إنشاء جدول منفصل للملاحظات

### الملفات المعدلة:

#### 1. ✅ `controller/Requests/membershipRequestsController.js`
**التعديل:**
```javascript
// إضافة include للعلاقات
include: {
  membership_documents: true,
  membership_fees: true,
  death_aid_forms: true,
  engineers: true,
  studied_by: true,    // ← جديد
  received_by: true,   // ← جديد
}
```

**النتيجة:**
- الآن الـ Response يحتوي على معلومات موظف التدقيق
- معلومات موظف الاستقبال أيضاً

---

## الخلاصة للفرونت اند:

### ما تغير؟
1. ✅ طلبات الانتساب: الآن فيها معلومات الموظف اللي كتب الملاحظة (`studied_by`)
2. ⚠️ باقي الطلبات: الملاحظات موجودة كـ text fields بدون معلومات الموظف

### شو لازم تعمل؟
1. **تحديث صفحة طلبات الانتساب** لعرض معلومات موظف التدقيق
2. **عرض الملاحظات** في باقي أنواع الطلبات (موجودة أصلاً بالـ response)
3. **استخدام Component موحد** للملاحظات (NoteCard المقترح)

### API Endpoints ما تغيرت:
- نفس الـ endpoints السابقة
- نفس الطريقة للوصول للبيانات
- فقط الـ response صار فيها بيانات إضافية

---

**تاريخ التحديث**: 2025-02-02
**الإصدار**: 1.0
