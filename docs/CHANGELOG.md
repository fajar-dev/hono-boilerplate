# 📝 Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [3.3.0] — 2026-06-17

### Added
- **Profile Update Endpoint** — `PUT /api/auth/profile` allowing users to update their name, email, and photo path, fully checking for email uniqueness.
- **Password Settings Endpoint** — `PUT /api/auth/password` allowing setting a password (useful for passwordless Google Login accounts) or updating an existing password after verifying the old password.
- **Async AuthSerializer** — Converted `AuthSerializer.single` and `AuthSerializer.collection` to be asynchronous to resolve MinIO presigned avatar URLs for logged in users.
- Swagger documentation and E2E integration tests in `auth.test.ts` for profile & password features.

---

## [3.2.0] — 2026-06-17

### Added
- **User Management Module (CRUD)** — Expose full CRUD capabilities for managing users:
  - `UserController` with methods: `index`, `show`, `store`, `update`, `destroy`.
  - Zod schemas `CreateUserValidator` and `UpdateUserValidator`.
  - Repository and Service extension for delete logic.
  - Endpoints: `GET /user`, `GET /user/:id`, `POST /user`, `PUT /user/:id`, `DELETE /user/:id`.
  - Protected all user endpoints using `authMiddleware`.
- **MinIO File Upload Endpoint** — `POST /api/upload` endpoint allowing authenticated multipart file uploads to MinIO.
- Swagger API documentation for user CRUD and upload endpoints.
- Integration E2E tests for user endpoints and file uploading (18 tests).

---

## [3.1.0] — 2026-06-17

### Added
- **Request Logger Middleware** — Log setiap request: method, path, status (color-coded), duration
- **Health Check Endpoint** — `GET /health` mengembalikan status database, uptime, environment
- `config.app.isProduction` — helper boolean untuk environment check

### Changed
- **[SECURITY]** JWT secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `API_KEY`) tidak lagi punya default value di production — server **crash saat startup** jika tidak di-set
- **[SECURITY]** `DB_SYNC` otomatis `false` di production (hardcoded) — mencegah schema sync yang bisa menghancurkan data
- `config.ts` — tambah `requireEnv()` utility untuk validasi env wajib

---

## [3.0.0] — 2026-06-17

### Changed
- **[BREAKING]** `ValidatorException` → `ValidationException`
- **[BREAKING]** `TooManyValidatorsException` → `TooManyRequestsException`
- **[BREAKING]** `GoogleLoginSchema` → `GoogleLoginValidator` (konsistensi naming)
- `AuthController` — semua method menggunakan `c.req.valid()` (sebelumnya `c.req.json()` bypass validasi)
- `AuthService` — tidak lagi import `AppDataSource`, transaction dipindah ke repository layer
- `AuthService` — tidak lagi melakukan manual destructuring sensitive fields (serializer yang handle)
- `IBaseRepository` — ditambahkan method standar: `findById`, `save`, `merge`, `delete`
- `IContactRepository` — sekarang extends `IBaseRepository<Contact>`
- `TypeOrmUserRepository.findAll()` — `getRawMany().length` → `getCount()` (performa)
- `config.database.sync` — fix bug `Boolean("false")` yang return `true`
- `AppDataSource` — refactored ke Proxy + getter/setter pattern untuk testability

### Added
- `UserService.saveInTransaction()` — transaction dikelola di repository layer
- `TypeOrmUserRepository.saveInTransaction()` — implementation
- `AuthSerializer.collection()` — konsistensi dengan ContactSerializer
- E2E integration tests (49 tests, 180 assertions)
- `docs/TESTING_GUIDE.md` — panduan testing lengkap

### Removed
- `AuthSerializer.resolvePhotoUrl()` — dead code
- Unused `ZodError` import di `response.ts`

### Fixed
- Exception default messages: "Bad Validator" → "Bad Request", "Validatored resource not found" → "Resource not found"

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
