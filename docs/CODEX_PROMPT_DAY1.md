# پرامپت آماده برای Codex — روز ۱

این متن را مستقیم به Codex بده (بدون تغییر، مگر جایی که علامت‌گذاری شده):

---

تو در حال کار روی ریپوی `aramik` هستی. قبل از هر کاری، این فایل‌ها را بخوان:
- `docs/MASTER_SPEC.md` (مشخصات کامل محصول)
- `mobile/src/i18n/locales/de.json` و `en.json` (تمام رشته‌های متنی موجود)
- `mobile/src/navigation/RootNavigator.tsx` (اسکلت navigation موجود)

## وظیفه روز ۱
اسکرین‌های placeholder زیر را در `mobile/src/screens/` پیاده‌سازی کن:

1. **OnboardingScreen.tsx** — صفحه خوش‌آمدگویی با استفاده از کلیدهای `onboarding.*` از فایل ترجمه. دکمه "شروع" کاربر را به `CheckIn` می‌برد.
2. **CheckInScreen.tsx** — فرم چک‌این روزانه: انتخاب سریع بین ۵ حالت روحی (از کلیدهای `checkin.mood_*`) + یک TextInput اختیاری برای متن آزاد. دکمه submit فعلاً فقط باید داده را در state ذخیره کند و به `MeditationPlayer` navigate کند (اتصال به API بک‌اند در روز ۲ انجام می‌شود، فعلاً mock کن).
3. **SettingsScreen.tsx** — شامل: سوییچ زبان (تغییر i18n.language بین 'de' و 'en')، دکمه "لغو اشتراک" (فعلاً فقط placeholder alert)، دکمه "حذف داده‌های من" (فعلاً فقط placeholder alert).

## قوانین اجباری (طبق rubric QC — هر تخطی نمره را پایین می‌آورد)
- **هیچ متنی نباید مستقیم در JSX نوشته شود.** همیشه `const { t } = useTranslation()` و `t('namespace.key')`.
- اگر رشته جدیدی لازم شد، همزمان به **هر دو** فایل `de.json` و `en.json` اضافه کن (اجرای `node mobile/scripts/check-i18n-parity.js` باید بدون خطا پاس شود).
- از TypeScript strict استفاده کن؛ هیچ `any` بدون توجیه در کامنت.
- کامپوننت‌ها باید functional + hooks باشند (نه class component).
- استایل با `StyleSheet.create`، نه inline style objects تکراری.
- تست واحد ساده (jest + @testing-library/react-native) حداقل برای منطق انتخاب mood در CheckInScreen بنویس.

## خروجی مورد انتظار
یک Pull Request با عنوان `feat: day1 onboarding + checkin + settings screens` که شامل تمام تغییرات بالا باشد.

---
*این پرامپت توسط Claude (رهبر فنی پروژه) طبق docs/MASTER_SPEC.md تهیه شده است.*
