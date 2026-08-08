# مشروع Laguna Dubai — سياق المشروع

## الوصف
موقع لتقييم كافيه اسمه "Laguna Dubai". الزوار يقدروا يشوفوا معلومات الكافيه ويضيفوا تقييمات (نجوم + تعليق).

## الـ Stack
- Next.js 16 (App Router) + TypeScript + Turbopack
- Tailwind CSS v4 (`@tailwindcss/postcss` + `@import "tailwindcss"` في `app/globals.css` — مفيش `tailwind.config.js`)
- Prisma ORM 7 + PostgreSQL (Supabase)
- Zod للـ validation
- Vitest + Testing Library للـ tests
- Deployment: Vercel

## أوامر مهمة
- `npm run dev` — تشغيل خادم التطوير
- `npm run build` — بناء إنتاجي + typecheck
- `npm test` — تشغيل كل الاختبارات (Vitest)
- `npx prisma generate` / `npx prisma migrate dev` — Prisma

## نقاط محورية لازم تعرفها قبل ما تبني على الكود

### Prisma 7 يختلف عن التعليمات القديمة (مهم جدًا)
- **`url` محذوفة من `datasource` في schema.prisma** — اتصال القاعدة متركز في `prisma.config.ts` (من `DATABASE_URL` env).
- **PrismaClient محتاج driver adapter**: أي استخدام جديد للـ Prisma لازم يعدّي على `lib/prisma.ts` (اللي بيستخدم `@prisma/adapter-pg`). ممنوع تكتب `new PrismaClient()` بدون adapter.
- أي جدول جديد لازم يتحدد في `prisma/schema.prisma` قبل ما يتكتب أي كود بيستخدمه، وبعدين `npx prisma generate`.

### الداتابيز (Supabase) مش وصيلها غير الـ MCP من الجهاز ده
- `db.<ref>.supabase.co` بيتحل لـ **IPv6 only** على الشبكة دي، والجهاز مش شغال بـ IPv6 → **أي اتصال مباشر من الكود/الـ prisma على الجهاز المحلي بيفشل** بـ `DatabaseNotReachable` / `ENOTFOUND`.
- الـ MCP server بتاع Supabase **شغال** (بيتصل من شبكة Supabase نفسها) — استخدمه لأي عمليات داتابيز (زراعة، query، migration).
- عشان كده: تشغيل `next dev`/`next start` محليًا ممكن يده 500 لو الصفحة بتقرأ من الداتابيز. الاختبارات والـ build بيشتغلو **من غير اتصال بالداتابيز** (بـ mocks).

## الـ Tests
- Vitest + jsdom، الإعداد في `vitest.config.ts` و `vitest.setup.ts`.
- `next/font/google` لازم يكون mocked في `vitest.setup.ts` (عشان ما يشغل fetch على النت).
- ممنوع استعمال `vi.mock` لنمذجة `@/lib/prisma` في ملف منفصل — لازم يكون **في نفس ملف الـ test مع `vi.hoisted`** (هو الغالب هو الأخطاء).
- اختبارات الصفحات بتستخدم mock للأداة وبتعيد render للـ component اللي في `@/app/**`.

## قواعد عامة للكود
- كل كود API لازم يعمل validation على المدخلات (استخدم zod). ملاحظة: **zod v4** — الـ custom type errors بتكتب `z.string({ error: "..." })` مش `z.string({ message })`.
- ممنوع أي secrets أو connection strings تتكتب في الكود — كلها في environment variables (`.env` متجاهل في git، `.env.example` مرجع).
- استخدم Server Components لما يكون ممكن، وClient Components بس لما يبقى فيه تفاعل (فورم، أزرار).
- الكود لازم يبقى بسيط ومقروء، من غير over-engineering.
- التصميم: هوية "beachy" بتلوينات Lagoon/إمber/إسندك محددة في `@theme` في `app/globals.css`. استخدم `font-display` (Fraunces) للعناوين و `font-sans` (Inter) للنصوص.
- الصفحة الرئيسية (`app/page.tsx`)  و `app/reviews/page.tsx` هما **Server Components ديناميك** (`export const dynamic = "force-dynamic"`)، بيج يبوا الدلا من Prisma.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
