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

## Folders

### POST `/folders` 🔒 — Tạo folder mới
```bash
curl -X POST http://localhost:3000/api/folders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"name":"Tiếng Anh","description":"Tổng hợp bộ từ vựng"}'
```
```json
{ "_id": "folder001", "name": "Tiếng Anh", "description": "Tổng hợp bộ từ vựng", ... }
```

---

### GET `/folders/me` 🔒 — Danh sách folders của mình
```bash
curl http://localhost:3000/api/folders/me \
  -H "Authorization: Bearer <accessToken>"
```
```json
[{ "_id": "folder001", "name": "Tiếng Anh", ... }]
```

---

### GET `/folders/:id` 🔒 — Chi tiết folder kèm danh sách sets bên trong
```bash
curl http://localhost:3000/api/folders/folder001 \
  -H "Authorization: Bearer <accessToken>"
```
```json
{
  "_id": "folder001",
  "name": "Tiếng Anh",
  "sets": [{ "_id": "abc123", "title": "Tiếng Anh cơ bản", "card_count": 10 }]
}
```

---

### PATCH `/folders/:id` 🔒 — Cập nhật folder (chỉ owner)
```bash
curl -X PATCH http://localhost:3000/api/folders/folder001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"name":"Tiếng Anh tổng hợp"}'
```
```json
{ "_id": "folder001", "name": "Tiếng Anh tổng hợp", ... }
```

---

### DELETE `/folders/:id` 🔒 — Xóa folder (chỉ owner)
> Sets bên trong không bị xóa, chỉ bị gỡ khỏi folder (`folder_id` → `null`)
```bash
curl -X DELETE http://localhost:3000/api/folders/folder001 \
  -H "Authorization: Bearer <accessToken>"
```
```json
{}
```

---

### POST `/folders/:id/sets/:setId` 🔒 — Thêm set vào folder
> Set phải thuộc sở hữu của cùng user. Set đang ở folder khác sẽ báo lỗi 400.
```bash
curl -X POST http://localhost:3000/api/folders/folder001/sets/abc123 \
  -H "Authorization: Bearer <accessToken>"
```
```json
{}
```

---

### DELETE `/folders/:id/sets/:setId` 🔒 — Gỡ set khỏi folder
```bash
curl -X DELETE http://localhost:3000/api/folders/folder001/sets/abc123 \
  -H "Authorization: Bearer <accessToken>"
```
```json
{}
```

---

## Progress (Spaced Repetition — SM-2)

> quality: 0-2 = sai, 3-5 = đúng (5=nhớ ngay, 4=nhớ tốt, 3=nhớ được nhưng khó)

### POST `/progress/review` 🔒 — Gửi kết quả trả lời 1 card
```bash
curl -X POST http://localhost:3000/api/progress/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "card_id": "<cardId>",
    "study_set_id": "<studySetId>",
    "mode": "learn",
    "quality": 4
  }'
```
```json
{
  "card_id": "<cardId>",
  "status": "learning",
  "interval": 1,
  "streak": 1,
  "next_review": "2026-04-27T00:00:00.000Z"
}
```

> Trả lời sai (quality < 3): `interval` reset về 1, `streak` reset về 0, `next_review` = ngày mai.
> Card sai nên được frontend đẩy về cuối queue để hỏi lại ngay trong buổi học.

---

### GET `/progress/due` 🔒 — Cards cần ôn hôm nay (tất cả sets)
Query params: `mode` (flashcard | learn | test)
```bash
curl "http://localhost:3000/api/progress/due?mode=learn" \
  -H "Authorization: Bearer <accessToken>"
```
```json
{
  "total_due": 2,
  "cards": [
    {
      "card": { "_id": "card001", "front": "Hello", "back": "Xin chào" },
      "study_set": { "_id": "<studySetId>", "title": "Tiếng Anh cơ bản" },
      "mode": "learn",
      "status": "learning",
      "next_review": "2026-04-25T00:00:00.000Z",
      "streak": 1
    }
  ]
}
```

---

### GET `/progress/:studySetId` 🔒 — Progress của toàn bộ cards trong 1 set
Query params: `mode` (flashcard | learn | test)
```bash
curl "http://localhost:3000/api/progress/<studySetId>?mode=learn" \
  -H "Authorization: Bearer <accessToken>"
```
```json
{
  "stats": {
    "total": 5,
    "not_started": 3,
    "learning": 1,
    "known": 1,
    "due_today": 1
  },
  "cards": [
    {
      "card": { "_id": "card004", "front": "Hi", "back": "Chào" },
      "status": "not_started",
      "next_review": null,
      "streak": 0,
      "priority": 0
    },
    {
      "card": { "_id": "card002", "front": "Hello", "back": "Xin chào" },
      "status": "learning",
      "next_review": "2026-04-25T00:00:00.000Z",
      "streak": 2,
      "priority": 1
    }
  ]
}
```

> Cards được sắp xếp theo priority: `not_started (0)` → `due today (1)` → `learning (2)` → `known (3)`

---

## Error responses

| HTTP Code | Ý nghĩa |
|-----------|---------|
| `400` | Validation thất bại (sai DTO) hoặc conflict logic (set đã ở folder khác) |
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

- `SessionsModule` — tạo/kết thúc phiên học, lưu kết quả, thống kê streak & accuracy
- `Auth refresh token` — endpoint đổi accessToken mới bằng refresh_token cookie