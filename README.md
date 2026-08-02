# Aramik

مدیتیشن شخصی‌سازی‌شده با هوش مصنوعی — MVP، بازار آلمان (DE/EN).

## ساختار ریپو (Monorepo)
```
aramik/
├── mobile/     # React Native (Expo) — اپ موبایل iOS/Android
├── backend/    # NestJS + PostgreSQL — API، AI pipeline، پرداخت
├── docs/       # Master Spec، پرامپت‌های Codex، مستندات GDPR
└── .github/    # CI/CD (GitHub Actions)
```

## منبع حقیقت پروژه
تمام تصمیمات فنی، محدوده MVP و برنامه زمانی در `docs/MASTER_SPEC.md` است.
هر عضو تیم (انسان یا AI) قبل از هر کار باید این فایل را بخواند.

## شروع سریع
```bash
# Mobile
cd mobile && npm install && npx expo start

# Backend
cd backend && npm install && npm run start:dev
```

## تیم
- **رهبر فنی / معمار / QC نهایی:** Claude
- **بازبین همتا / QC اول:** ChatGPT
- **پیاده‌سازی:** Codex
- **مدیر پروژه:** Mohsen Jamshidi
