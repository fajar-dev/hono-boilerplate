# 📝 Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] — 2026-06-17

### Added
- Dukungan **PostgreSQL** sebagai database (selain MySQL)
- Konfigurasi `DB_TYPE` environment variable untuk memilih database (`postgres` | `mysql`)
- Driver `pg` ditambahkan ke dependencies

### Changed
- Default database type diubah dari MySQL ke PostgreSQL
- Default `DB_PORT` diubah dari `3306` ke `5432`

---

## [1.2.0] — 2026-06-17

### Added
- **Error Logger** — Error 500 dicatat ke file `logs/error.log`
- Helper `logError()` di `core/helpers/logger.ts`
- Stack trace hanya ditampilkan di environment `development`

---

## [1.1.0] — 2026-06-17

### Added
- **Contact Module** — Full CRUD (Create, Read, Update, Delete) 
  - `Contact` entity dengan field: name, email, phone
  - `IContactRepository` interface
  - `TypeOrmContactRepository` implementation dengan pagination & search
  - `ContactService` dengan business logic
  - `ContactController` dengan method: index, show, store, update, destroy
  - `ContactSerializer` untuk response transformation
  - `CreateContactValidator` dan `UpdateContactValidator` (Zod)
- Route: `GET /contact`, `GET /contact/:id`, `POST /contact`, `PUT /contact/:id`, `DELETE /contact/:id`
- Swagger documentation untuk semua Contact endpoints
- `PaginationMeta` schema di Swagger

---

## [1.0.0] — 2026-06-17

### Added
- **Initial Boilerplate Setup**
  - Hono framework dengan Bun runtime
  - TypeORM sebagai ORM
  - Clean Architecture dengan SOLID principles
  - Manual Dependency Injection pattern

- **Auth Module**
  - Registrasi user baru (`POST /auth/register`)
  - Login dengan email & password (`POST /auth/login`)
  - Google OAuth login (`POST /auth/google`)
  - Refresh token (`POST /auth/refresh`)
  - Forgot password — kirim email reset (`POST /auth/forgot-password`)
  - Validate reset token (`GET /auth/validate-reset-token`)
  - Reset password (`POST /auth/reset-password`)
  - Get current user (`GET /auth/me`)
  - Logout (`POST /auth/logout`)

- **User Module**
  - `User` entity dengan field: name, photo, email, password, resetPasswordToken, resetPasswordExpires, isActive
  - `IUserRepository` interface
  - `TypeOrmUserRepository` implementation
  - `UserService` dengan business logic
  - `UserSerializer` dan `UserListSerializer`

- **Core Infrastructure**
  - `BaseException` hierarchy (400, 401, 403, 404, 409, 422, 429)
  - `ApiResponse` — format response standar (success, paginate, error)
  - `AuthHelper` — JWT token generation (access 15min, refresh 7 days) & Google OAuth
  - `hashPassword` / `comparePassword` — bcrypt wrapper
  - `Mail` — Nodemailer SMTP wrapper (sendText, sendHtml)
  - `MinioHelper` — MinIO object storage (upload, delete, presignedUrl, proxy)
  - `validationHook` — Zod validation hook untuk Hono
  - `authMiddleware` — JWT Bearer authentication
  - `apiKeyMiddleware` — API key authentication
  - `tokenAuthMiddleware` — JWT via query param atau header

- **Configuration**
  - Centralized `config.ts` — semua env variables
  - TypeORM `database.ts` — DataSource configuration
  - Nodemailer `smtp.ts` — SMTP transporter
  - `.env.dist` — environment template

- **DevOps**
  - `Dockerfile` — Multi-stage build dengan Bun
  - `docker-compose.yaml` — App + PostgreSQL
  - `ecosystem.config.js` — PM2 process manager
  - Swagger UI di `/api/docs`

---

## Template Entri Baru

```markdown
## [X.Y.Z] — YYYY-MM-DD

### Added
- Fitur baru

### Changed
- Perubahan pada fitur yang sudah ada

### Deprecated
- Fitur yang akan dihapus di versi mendatang

### Removed
- Fitur yang dihapus

### Fixed
- Perbaikan bug

### Security
- Perbaikan keamanan
```

### Versioning Rules

- **MAJOR** (X.0.0): Breaking changes, perubahan arsitektur besar
- **MINOR** (0.X.0): Fitur baru, module baru, penambahan endpoint
- **PATCH** (0.0.X): Bug fix, perbaikan kecil, update dependencies
