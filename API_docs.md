# API Documentation — Flashcard App

Base URL: `http://localhost:3000/api`

> Route có 🔒 cần header `Authorization: Bearer <accessToken>`

---

## Auth

### Cookie auth behavior (register/login/logout)
- `POST /auth/register` và `POST /auth/login` ngoài `accessToken` trong JSON response còn set cookie `refresh_token` (HttpOnly, `SameSite=Strict`, default 7 ngày).
- `POST /auth/logout` sẽ clear cookie `refresh_token`.
- Cookie dùng cho refresh flow phía sau (endpoint refresh chưa triển khai).

### POST `/auth/register`
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"123456"}'
```
```json
{ "accessToken": "eyJ..." }
```

---

### POST `/auth/login`
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```
```json
{ "accessToken": "eyJ..." }
```

---

### POST `/auth/logout` 🔒
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <accessToken>"
```
```json
{ "message": "Đăng xuất thành công" }
```

---

## System

### GET `/` — Health check cơ bản
```bash
curl http://localhost:3000/api/
```
```json
"Hello World!"
```

---

## Study Sets

### POST `/study-sets` 🔒 — Tạo set mới
```bash
curl -X POST http://localhost:3000/api/study-sets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"title":"Tiếng Anh cơ bản","description":"Từ vựng A1","is_public":true,"tags":["english","beginner"]}'
```
```json
{ "_id": "abc123", "title": "Tiếng Anh cơ bản", "card_count": 0, ... }
```

---

### GET `/study-sets/me` 🔒 — Danh sách sets của mình
Query params: `page`, `limit`, `search`, `tag`
```bash
curl "http://localhost:3000/api/study-sets/me?page=1&limit=20" \
  -H "Authorization: Bearer <accessToken>"
```
```json
{ "data": [...], "meta": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 } }
```

---

### GET `/study-sets/public` — Tìm sets công khai
Query params: `search`, `tag`, `page`, `limit`
```bash
curl "http://localhost:3000/api/study-sets/public?search=tieng+anh&tag=english"
```
```json
{ "data": [...], "meta": { "total": 3, "page": 1, "limit": 20, "totalPages": 1 } }
```

---

### GET `/study-sets/:id` 🔒 — Chi tiết 1 set
```bash
curl http://localhost:3000/api/study-sets/abc123 \
  -H "Authorization: Bearer <accessToken>"
```
```json
{ "_id": "abc123", "title": "Tiếng Anh cơ bản", "owner_id": { "username": "testuser" }, ... }
```

---

### PATCH `/study-sets/:id` 🔒 — Cập nhật set (chỉ owner)
```bash
curl -X PATCH http://localhost:3000/api/study-sets/abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"title":"Tiếng Anh nâng cao","is_public":false}'
```
```json
{ "_id": "abc123", "title": "Tiếng Anh nâng cao", "is_public": false, ... }
```

---

### DELETE `/study-sets/:id` 🔒 — Xóa set (chỉ owner)
```bash
curl -X DELETE http://localhost:3000/api/study-sets/abc123 \
  -H "Authorization: Bearer <accessToken>"
```
```json
{}
```

---

## Cards

### POST `/study-sets/:studySetId/cards` 🔒 — Thêm 1 card
```bash
curl -X POST http://localhost:3000/api/study-sets/abc123/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"front":"Hello","back":"Xin chào"}'
```
```json
{ "_id": "card001", "front": "Hello", "back": "Xin chào", "order": 0, ... }
```

---

### POST `/study-sets/:studySetId/cards/bulk` 🔒 — Thêm nhiều cards
```bash
curl -X POST http://localhost:3000/api/study-sets/abc123/cards/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"cards":[{"front":"Hello","back":"Xin chào"},{"front":"Goodbye","back":"Tạm biệt"}]}'
```
```json
[{ "_id": "card001", ... }, { "_id": "card002", ... }]
```

---

### GET `/study-sets/:studySetId/cards` 🔒 — Lấy tất cả cards của set
```bash
curl http://localhost:3000/api/study-sets/abc123/cards \
  -H "Authorization: Bearer <accessToken>"
```
```json
[{ "_id": "card001", "front": "Hello", "back": "Xin chào", "order": 0 }, ...]
```

---

### PATCH `/cards/:id` 🔒 — Sửa card (chỉ owner của set)
```bash
curl -X PATCH http://localhost:3000/api/cards/card001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"front":"Hi","back":"Chào"}'
```
```json
{ "_id": "card001", "front": "Hi", "back": "Chào", ... }
```

---

### DELETE `/cards/:id` 🔒 — Xóa card (chỉ owner của set)
```bash
curl -X DELETE http://localhost:3000/api/cards/card001 \
  -H "Authorization: Bearer <accessToken>"
```
```json
{}
```

---

## Error responses

| HTTP Code | Ý nghĩa |
|-----------|---------|
| `400` | Validation thất bại (sai DTO) |
| `401` | Chưa đăng nhập hoặc token hết hạn |
| `403` | Không có quyền (không phải owner) |
| `404` | Resource không tồn tại |
| `409` | Conflict (email / username đã tồn tại) |

```json
// Ví dụ lỗi 403
{ "statusCode": 403, "message": "Bạn không có quyền chỉnh sửa study set này" }
```

---

## Chưa triển khai

- `FoldersModule` — CRUD folder, gán set vào folder
- `ProgressModule` — cập nhật trạng thái card, spaced repetition SM-2
- `SessionsModule` — tạo/kết thúc phiên học, lưu kết quả