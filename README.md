# VMC Website

## Table of Contents

- [Stack](#stack)
- [Chạy local](#chạy-local)
- [Migration database](#migration-database)
- [Deploy](#deploy)
- [Tài liệu liên quan](#tài-liệu-liên-quan)

## Stack

- Next.js 16 (App Router) + Payload CMS 3.90.1. Chỉ dùng tài liệu Payload v3 (https://payloadcms.com/docs), không dùng API của v2.
- Postgres trên Neon (`@payloadcms/db-postgres`), media trên Vercel Blob (`@payloadcms/storage-vercel-blob`).
- Localization: `vi` (mặc định), `en`.
- Hosting: Vercel, project `vmc-web`.

Cấu trúc chính:

```
src/payload.config.ts        Cấu hình Payload
src/collections/             Collections
src/app/(frontend)/          Site public
src/app/(payload)/           Admin (/admin) và API (/api)
src/migrations/              Migration database (tạo bằng payload migrate:create)
```

## Chạy local

1. `cp .env.example .env`, điền `DATABASE_URL` (nên dùng một branch Neon riêng cho dev) và `PAYLOAD_SECRET`.
2. `npm install`
3. `npm run payload migrate`
4. `npm run dev`, mở http://localhost:3000/admin để tạo tài khoản admin đầu tiên.

## Migration database

Adapter Postgres đặt `push: false`, nên mọi thay đổi schema phải có migration:

```
npm run payload migrate:create <ten-migration>
npm run payload migrate
```

Commit file trong `src/migrations/` cùng với thay đổi collection.

## Deploy

Push lên nhánh `main` thì Vercel deploy production; nhánh khác tạo bản preview. Biến môi trường khai báo trên Vercel theo `.env.example`.

## Tài liệu liên quan

Nội dung gốc và kế hoạch nằm ngoài repo, trong thư mục OneDrive `Documents/SC/VMC/Webcontent from claude`:

- `README.md`: bản đồ nguồn dữ liệu
- `00-SPEC.md`: sitemap, design system, component
- `01-BUILD-PLAN.md`: kiến trúc, phân quyền, các bước M0-M6
