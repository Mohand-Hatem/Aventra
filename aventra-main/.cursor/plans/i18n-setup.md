# Aventra i18n Setup (after fix)

This document describes how internationalization (i18n), translations, and text direction (RTL/LTR) work in this project after the localization refactor.

---

## Overview

| Concern | Solution |
|--------|----------|
| **Library** | [next-intl](https://next-intl.dev) |
| **Locales** | `en` (English), `ar` (Arabic) |
| **URL shape** | Always prefixed: `/en/...`, `/ar/...` |
| **Single source of truth** | URL segment `[locale]` in `app/[locale]/` |
| **Direction** | `ar` → RTL, `en` → LTR on `<html dir>` |
| **Translations** | `messages/en.json`, `messages/ar.json` |

---

## Architecture diagram

```
Request
   │
   ▼
middleware.ts                    ← next-intl middleware (redirects, locale in URL)
   │
   ▼
app/layout.tsx                   ← pass-through only (no <html>)
   │
   ▼
app/[locale]/layout.tsx          ← SINGLE source: lang, dir, fonts, messages, provider
   │
   ├── <html lang dir>           ← from params.locale (server)
   ├── NextIntlClientProvider    ← locale + messages
   ├── Navbar (dir="ltr")        ← translated, layout stays LTR
   ├── <main>{children}</main>   ← inherits <html dir>
   └── Footer (dir="ltr")        ← translated, layout stays LTR
```

---

## File map

### Core config

| File | Role |
|------|------|
| `middleware.ts` | Runs next-intl middleware on every page request; ensures locale is in the URL |
| `next.config.ts` | Registers next-intl plugin → `./src/i18n/request.ts` |
| `src/i18n/routing.ts` | Defines locales, default locale, `localePrefix: 'always'`, and navigation helpers |
| `src/i18n/request.ts` | Loads JSON messages per request; applies Arabic numeral localization |
| `messages/en.json` | English copy |
| `messages/ar.json` | Arabic copy |

### Layouts (important after fix)

| File | Role |
|------|------|
| `src/app/layout.tsx` | Returns `children` only. Does **not** set `lang`/`dir` (avoids cookie vs URL conflicts) |
| `src/app/[locale]/layout.tsx` | Owns `<html>` + `<body>`, sets `lang`, `dir`, fonts, `NextIntlClientProvider`, Navbar, Footer |

### Helpers

| File | Role |
|------|------|
| `src/lib/locale.ts` | `AppLocale` type, `isRtlLocale()` |
| `src/lib/locale-format.ts` | Arabic-Indic digits in messages and numbers |
| `src/lib/fonts.ts` | Shared Google fonts (Geist, Inter, Cairo) |
| `src/i18n/routing.ts` | Export `Link`, `redirect`, `useRouter`, `usePathname` — **always use these instead of Next.js defaults** |

### UI

| File | Role |
|------|------|
| `src/components/feature/LanguageSwitcher.tsx` | Switches locale via `router.replace(pathname, { locale })` |
| `src/components/shared/Navbar.tsx` | `dir="ltr"` — Arabic labels, LTR layout |
| `src/components/shared/Footer.tsx` | `dir="ltr"` — Arabic labels, LTR layout |

### Removed (do not re-add)

| File | Why removed |
|------|-------------|
| `LocaleHtmlAttributes.tsx` | Client-side patching of `<html dir>` caused flash / mismatch with server |
| `locale-from-path.ts` | Parsed URL on client; redundant once server layout owns direction |

---

## How routing works

Config in `src/i18n/routing.ts`:

```ts
export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
```

Examples:

| User visits | Result |
|-------------|--------|
| `/` | Middleware redirects to `/en` or detected locale |
| `/en/login` | English, LTR |
| `/ar/login` | Arabic, RTL |
| `/ar` | Arabic home, RTL |

Navigation in components:

```tsx
import { Link, useRouter, usePathname } from "@/i18n/routing";

// Link auto-prefixes locale
<Link href="/pricing">Pricing</Link>

// Switch language (same page, different locale)
router.replace(pathname, { locale: "ar" });
```

---

## How translations work

### 1. Message files

Strings live in JSON namespaces, e.g.:

```json
{
  "navbar": { "home": "Home", "pricing": "Pricing" },
  "login": { "title": "Welcome back" }
}
```

Arabic mirror in `messages/ar.json`.

### 2. Server load (`src/i18n/request.ts`)

On each request, next-intl:

1. Reads locale from the `[locale]` segment
2. Imports `messages/{locale}.json`
3. Runs `localizeMessageTree()` for Arabic (Western → Arabic-Indic digits in strings)

### 3. Provider (`app/[locale]/layout.tsx`)

```tsx
const messages = await getMessages({ locale });

<NextIntlClientProvider locale={locale} messages={messages}>
  {children}
</NextIntlClientProvider>
```

### 4. Components

**Client components:**

```tsx
"use client";
import { useTranslations } from "next-intl";

const t = useTranslations("navbar");
return <span>{t("home")}</span>;
```

**Server components:**

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";

setRequestLocale(locale);
const t = await getTranslations("landing");
```

### 5. Validation messages (auth forms)

Zod schemas are built with translated messages via factories in `src/schemas/auth.ts`:

```tsx
const t = useTranslations("login.validation");
const schema = useMemo(
  () => createLoginSchema({
    emailRequired: t("emailRequired"),
    // ...
  }),
  [t],
);
```

---

## How direction (RTL / LTR) works

### Global direction — one place only

In `app/[locale]/layout.tsx`:

```tsx
const isRTL = isRtlLocale(locale); // locale === "ar"

<html
  lang={locale}
  dir={isRTL ? "rtl" : "ltr"}
  className={isRTL ? "font-arabic" : "font-sans"}
>
```

- Set on the **server** from `params.locale`
- Same on first paint and after refresh — **no client patch**
- `<main>` and page content inherit this direction

### Exceptions (by design)

| Area | Direction | Notes |
|------|-----------|--------|
| **Navbar** | Always `dir="ltr"` | Text translates; logo left, menu right |
| **Footer** | Always `dir="ltr"` | Text translates; grid layout unchanged |
| **Marquee** | `dir="ltr"` | Scroll animation must not flip in RTL |
| **Theme toggle** | `dir="ltr"` | Icon order stable |
| **Landing charts/stats** |局部 `dir="ltr"` | Numbers and charts stay readable |

### CSS (`globals.css`)

```css
html[dir="ltr"] { font-family: var(--font-sans); }
html[dir="rtl"] { font-family: var(--font-cairo); }
```

Plus legacy RTL overrides for `.ml-4`, `.text-left`, etc.

Prefer logical Tailwind utilities in new code: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`.

---

## Language switch flow

1. User clicks **English** or **العربية** in `LanguageSwitcher` (navbar).
2. `router.replace(pathname, { locale: newLocale, scroll: false })` runs.
3. URL changes, e.g. `/en/login` → `/ar/login`.
4. Next.js re-renders `app/[locale]/layout.tsx` with new `params.locale`.
5. Server outputs correct `<html lang dir>`, messages, and font class.
6. Navbar/Footer stay LTR; main content follows page direction.

No cookie-only logic. No post-hydration `useLayoutEffect` on `<html>`.

---

## What was wrong before (and why it glitched)

Previously, three systems could disagree:

| Source | Used |
|--------|------|
| Root `app/layout.tsx` | `NEXT_LOCALE` **cookie** for `dir` / `lang` |
| `LocaleHtmlAttributes` | **URL pathname** on the client |
| `AuthPageShell` | **URL pathname** again for `dir` |

On refresh or switch:

- URL: `/ar/...` → should be RTL  
- Cookie: still `en` → server sent LTR  
- Client script: then switched to RTL  

That caused **flash**, wrong alignment briefly, and inconsistent translations.

Also `key={locale}` on `NextIntlClientProvider` forced full remounts and extra flicker.

---

## What we changed (fix summary)

1. **`app/layout.tsx`** — pass-through only; no `<html>`, no cookie-based locale.
2. **`app/[locale]/layout.tsx`** — owns `<html>`, `lang`, `dir`, fonts, provider, shell.
3. **Removed** `LocaleHtmlAttributes` and `locale-from-path.ts`.
4. **Removed** `key={locale}` on provider (locale prop update is enough).
5. **Simplified** `AuthPageShell` — layout wrapper only; direction from `<html>`.
6. **Extracted** `src/lib/fonts.ts` and `src/lib/locale.ts`.
7. **Kept** Navbar/Footer `dir="ltr"` per product requirement.

---

## Adding new translated pages

1. Add keys to `messages/en.json` and `messages/ar.json`.
2. Create page under `src/app/[locale]/your-page/page.tsx`.
3. Use `useTranslations("yourNamespace")` or `getTranslations` on the server.
4. Use `Link` / `useRouter` from `@/i18n/routing`, not `next/link` directly.
5. Do **not** set `dir` on the page unless you have a special case (like navbar).
6. Use logical spacing (`ms-`, `pe-`) so RTL layout works automatically.

---

## Adding a new locale (future)

1. Add locale to `routing.locales` in `src/i18n/routing.ts`.
2. Add `messages/{locale}.json`.
3. Update `isRtlLocale()` in `src/lib/locale.ts` if the locale is RTL.
4. Add `generateStaticParams` already maps from `routing.locales` — no extra step.
5. Add language button in `LanguageSwitcher`.

---

## Quick reference checklist

- [ ] URLs always include locale: `/en/...`, `/ar/...`
- [ ] Direction comes from `[locale]/layout.tsx` only
- [ ] Navbar + Footer: translate yes, `dir="ltr"` yes
- [ ] Use `@/i18n/routing` for links and router
- [ ] Do not read `NEXT_LOCALE` cookie for UI direction
- [ ] Do not add client-side `<html dir>` patching
- [ ] Keep `messages/en.json` and `messages/ar.json` in sync

---

## Related files (quick links)

```
middleware.ts
next.config.ts
messages/en.json
messages/ar.json
src/i18n/routing.ts
src/i18n/request.ts
src/app/layout.tsx
src/app/[locale]/layout.tsx
src/lib/locale.ts
src/lib/locale-format.ts
src/lib/fonts.ts
src/components/feature/LanguageSwitcher.tsx
src/components/shared/Navbar.tsx
src/components/shared/Footer.tsx
```
