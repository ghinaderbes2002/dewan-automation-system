# دليل عرض المرفقات - موظف التدقيق 📎

## 🎯 الفكرة

عند تدقيق طلب انتساب، موظف التدقيق لازم يشوف **كل المرفقات** (الصور، الشهادات، الوثائق) اللي رفعها المهندس أو موظف الانتساب.

---

## 📌 التحديثات في الـ API

### ✅ طلبات الانتساب فقط

الـ Endpoints التالية **صارت ترجع المرفقات**:

```
GET /api/membership_requests/:id
GET /api/membership_requests
```

---

## 📄 Response الجديد

### قبل التعديل:
```json
{
  "id": "123",
  "full_name_ar": "أحمد محمد",
  "status": "under_review",
  "national_id_number": "12345",
  "engineers": { ... },
  "membership_documents": { ... }
}
```

### بعد التعديل (الآن):
```json
{
  "id": "123",
  "full_name_ar": "أحمد محمد",
  "status": "under_review",
  "national_id_number": "12345",
  "engineers": { ... },
  "membership_documents": { ... },

  "attachments": [
    {
      "id": "1",
      "request_type": "MEMBERSHIP",
      "request_id": "123",
      "document_type": "البطاقة الشخصية",
      "file_path": "/uploads/membership/1738512345678-123456789.jpg",
      "uploaded_at": "2025-02-02T10:30:00.000Z",
      "uploaded_by_employee_id": 5,
      "diwan_employees": {
        "id": 5,
        "name": "محمد أحمد",
        "role": "MEMBERSHIP_AND_SERVICE"
      }
    },
    {
      "id": "2",
      "request_type": "MEMBERSHIP",
      "request_id": "123",
      "document_type": "شهادة التخرج",
      "file_path": "/uploads/membership/1738512345679-987654321.pdf",
      "uploaded_at": "2025-02-02T10:31:00.000Z",
      "uploaded_by_employee_id": null,
      "diwan_employees": null
    }
  ]
}
```

**ملاحظة مهمة:**
- إذا `uploaded_by_employee_id` = `null` → يعني **المهندس** رفع الملف
- إذا `uploaded_by_employee_id` = رقم → يعني **موظف** رفع الملف

---

## 🖥️ كود الفرونت - عرض المرفقات

### 1️⃣ Component React بسيط

```jsx
function MembershipRequestAuditPage({ requestId }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب الطلب مع المرفقات
    fetch(`/api/membership_requests/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setRequest(data);
        setLoading(false);
      });
  }, [requestId]);

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="audit-page">
      <h2>تدقيق طلب انتساب - {request.full_name_ar}</h2>

      {/* معلومات الطلب */}
      <div className="request-info">
        <p><strong>رقم الهوية:</strong> {request.national_id_number}</p>
        <p><strong>الحالة:</strong> {request.status}</p>
      </div>

      {/* عرض المرفقات */}
      {request.attachments && request.attachments.length > 0 && (
        <div className="attachments-section">
          <h3>📎 المرفقات ({request.attachments.length})</h3>

          <div className="attachments-grid">
            {request.attachments.map(attachment => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Form التدقيق */}
      <AuditForm request={request} />
    </div>
  );
}
```

---

### 2️⃣ Component لعرض مرفق واحد

```jsx
function AttachmentCard({ attachment }) {
  const isImage = attachment.file_path.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPDF = attachment.file_path.match(/\.pdf$/i);

  return (
    <div className="attachment-card">
      <div className="attachment-header">
        <h4>{attachment.document_type || 'وثيقة'}</h4>
        <span className="upload-date">
          {new Date(attachment.uploaded_at).toLocaleDateString('ar-EG')}
        </span>
      </div>

      {/* معاينة الملف */}
      <div className="attachment-preview">
        {isImage ? (
          <img
            src={attachment.file_path}
            alt={attachment.document_type}
            onClick={() => window.open(attachment.file_path, '_blank')}
          />
        ) : isPDF ? (
          <div className="pdf-icon">
            <i className="fas fa-file-pdf"></i>
            <p>PDF</p>
          </div>
        ) : (
          <div className="file-icon">
            <i className="fas fa-file"></i>
            <p>ملف</p>
          </div>
        )}
      </div>

      {/* معلومات الرافع */}
      <div className="attachment-footer">
        {attachment.diwan_employees ? (
          <p className="uploaded-by">
            <i className="fas fa-user"></i>
            رفعه: {attachment.diwan_employees.name}
          </p>
        ) : (
          <p className="uploaded-by engineer">
            <i className="fas fa-user-tie"></i>
            رفعه المهندس
          </p>
        )}
      </div>

      {/* أزرار */}
      <div className="attachment-actions">
        <a
          href={attachment.file_path}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-view"
        >
          عرض
        </a>
        <a
          href={attachment.file_path}
          download
          className="btn-download"
        >
          تحميل
        </a>
      </div>
    </div>
  );
}
```

---

### 3️⃣ مثال كامل مع Image Lightbox

```jsx
import { useState } from 'react';

function AttachmentsGallery({ attachments }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = attachments.filter(att =>
    att.file_path.match(/\.(jpg|jpeg|png|gif)$/i)
  );

  const documents = attachments.filter(att =>
    !att.file_path.match(/\.(jpg|jpeg|png|gif)$/i)
  );

  return (
    <div className="attachments-gallery">
      {/* الصور */}
      {images.length > 0 && (
        <div className="images-section">
          <h4>📷 الصور ({images.length})</h4>
          <div className="images-grid">
            {images.map(image => (
              <div
                key={image.id}
                className="image-thumbnail"
                onClick={() => setSelectedImage(image)}
              >
                <img src={image.file_path} alt={image.document_type} />
                <p>{image.document_type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* المستندات */}
      {documents.length > 0 && (
        <div className="documents-section">
          <h4>📄 المستندات ({documents.length})</h4>
          <ul className="documents-list">
            {documents.map(doc => (
              <li key={doc.id} className="document-item">
                <i className="fas fa-file-pdf"></i>
                <span>{doc.document_type}</span>
                <a
                  href={doc.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-view-small"
                >
                  عرض
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lightbox للصور */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img src={selectedImage.file_path} alt={selectedImage.document_type} />
            <p className="image-title">{selectedImage.document_type}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 CSS للتصميم

```css
/* قسم المرفقات */
.attachments-section {
  background: #f9f9f9;
  padding: 24px;
  border-radius: 8px;
  margin: 24px 0;
}

.attachments-section h3 {
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Grid المرفقات */
.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

/* بطاقة مرفق واحد */
.attachment-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.attachment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.attachment-header {
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.attachment-header h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
}

.upload-date {
  font-size: 12px;
  color: #666;
}

/* معاينة الملف */
.attachment-preview {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  cursor: pointer;
}

.attachment-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.pdf-icon, .file-icon {
  text-align: center;
}

.pdf-icon i, .file-icon i {
  font-size: 48px;
  color: #d32f2f;
  margin-bottom: 8px;
}

.pdf-icon p, .file-icon p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* Footer */
.attachment-footer {
  padding: 8px 12px;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.uploaded-by {
  margin: 0;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.uploaded-by.engineer {
  color: #1976d2;
}

.uploaded-by i {
  font-size: 14px;
}

/* الأزرار */
.attachment-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
}

.btn-view, .btn-download {
  flex: 1;
  padding: 8px 12px;
  text-align: center;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-view {
  background: #2196f3;
  color: white;
}

.btn-view:hover {
  background: #1976d2;
}

.btn-download {
  background: #4caf50;
  color: white;
}

.btn-download:hover {
  background: #388e3c;
}

/* Lightbox */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  text-align: center;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 8px 16px;
}

.image-title {
  color: white;
  margin-top: 16px;
  font-size: 16px;
}

/* Grid الصور */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.image-thumbnail {
  cursor: pointer;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.image-thumbnail:hover {
  border-color: #2196f3;
  transform: scale(1.05);
}

.image-thumbnail img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.image-thumbnail p {
  padding: 8px;
  margin: 0;
  font-size: 12px;
  text-align: center;
  background: #f5f5f5;
}

/* قائمة المستندات */
.documents-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0 0;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
}

.document-item i {
  color: #d32f2f;
  font-size: 24px;
}

.document-item span {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.btn-view-small {
  padding: 6px 16px;
  background: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 13px;
}

.btn-view-small:hover {
  background: #1976d2;
}
```

---

## 📋 ملخص للفرونت اند

### ما تغير:
✅ طلبات الانتساب صارت ترجع مع `attachments` array

### ما لازم يعمله الفرونت:
1. عرض قائمة المرفقات في صفحة التدقيق
2. معاينة الصور مباشرة
3. فتح ملفات PDF في tab جديد
4. تحميل الملفات
5. عرض من رفع الملف (موظف أو مهندس)

### Endpoints:
```
GET /api/membership_requests/:id  → يرجع الطلب + المرفقات
GET /api/membership_requests      → يرجع كل الطلبات + مرفقات كل طلب
```

---

**تاريخ التحديث:** 2025-02-02
**الحالة:** ✅ جاهز للتطبيق
