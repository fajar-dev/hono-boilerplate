# 📝 Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.2.0] — 2026-08-15

### Added
- `GET /contact` dan `GET /user` menerima query param `sortBy`/`order` untuk sorting kolom, dengan whitelist `SORTABLE_COLUMNS` di masing-masing repository untuk mencegah SQL injection lewat `.orderBy()`.
- `ContactSerializer` menyertakan field `salutation`, `type`, dan `isActive` di response (sebelumnya tidak diekspos meski sudah ada di entity).

### Changed
- `IContactRepository.findAll` dan `IUserRepository.findAll` — signature diperluas dengan parameter `sortBy?: string, order?: SortOrder`.

---

## [0.1.0] — 2026-06-18

### Added
- Initial release

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
