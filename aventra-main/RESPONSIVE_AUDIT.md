# Comprehensive Responsive Design Audit

_Focus: Full Tailwind breakpoint review with explicit testing for 1366x768 (Laptop) resolution._

## 1. Home

**Path:** `src/app/[locale]/page.tsx` (Components: `Landing.tsx`, `gridDescription.tsx`)

| Priority | Issue Description                                                                       | Screen Size             | File                                         | Line | Recommended Fix (Before -> After)                                                         | Status  |
| :------- | :-------------------------------------------------------------------------------------- | :---------------------- | :------------------------------------------- | :--- | :---------------------------------------------------------------------------------------- | :------ |
| Critical | `h-screen` on large screens causes lower hero content to overflow and clip at 1366x768. | Laptop (1366x768), `lg` | `src/components/feature/Landing.tsx`         | 443  | `min-h-screen lg:h-screen w-full` -> `min-h-screen w-full`                                | Pending |
| Major    | Large padding top (`pt-24`) pushes the hero content too far down at 768px height.       | Laptop (1366x768), `lg` | `src/components/feature/Landing.tsx`         | 463  | `pt-12 sm:pt-20 lg:pt-24` -> `pt-12 sm:pt-20 lg:pt-16 xl:pt-24`                           | Pending |
| Minor    | `py-20` on bento grid takes too much vertical space on shorter displays.                | Laptop (1366x768), `lg` | `src/components/feature/gridDescription.tsx` | 192  | `py-12 px-4 sm:px-6 sm:py-16 lg:py-20` -> `py-12 px-4 sm:px-6 sm:py-16 lg:py-16 xl:py-20` | Pending |

## 2. CV Analysis

**Path:** `src/app/[locale]/user/cv-analysis/page.tsx` (Component: `CvAnalysisContent.tsx`)

| Priority | Issue Description                                                                                        | Screen Size             | File                                                      | Line | Recommended Fix (Before -> After)                                                                                          | Status  |
| :------- | :------------------------------------------------------------------------------------------------------- | :---------------------- | :-------------------------------------------------------- | :--- | :------------------------------------------------------------------------------------------------------------------------- | :------ |
| Major    | The analysis layout could feel cramped on 1366x768 if the grid rows are too tall or margin is excessive. | Laptop (1366x768), `lg` | `src/app/[locale]/user/cv-analysis/CvAnalysisContent.tsx` | 254  | `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5` -> `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:gap-4` | Pending |
| Minor    | Padding inside metric strips is slightly large for short height displays.                                | Laptop (1366x768), `lg` | `src/app/[locale]/user/cv-analysis/CvAnalysisContent.tsx` | 261  | `flex flex-col gap-1.5 rounded-xl border p-4` -> `flex flex-col gap-1.5 rounded-xl border p-3 xl:p-4`                      | Pending |

## 3. Candidate Search

**Path:** `src/app/[locale]/company/search/page.tsx` (Component: `CompanySearchSection.tsx`)

| Priority | Issue Description                                                                        | Screen Size             | File                                                             | Line | Recommended Fix (Before -> After)                                                                                  | Status  |
| :------- | :--------------------------------------------------------------------------------------- | :---------------------- | :--------------------------------------------------------------- | :--- | :----------------------------------------------------------------------------------------------------------------- | :------ |
| Critical | Chat container uses sticky top and margin top which pushes it offscreen on 768px height. | Laptop (1366x768), `lg` | `src/components/feature/company-search/CompanySearchSection.tsx` | 225  | `lg:sticky lg:top-30 lg:mt-13.5 lg:self-start` -> `lg:sticky lg:top-20 lg:mt-4 lg:self-start xl:top-30 xl:mt-13.5` | Pending |
| Major    | Gap between main search and chat is too large on 1366x768 displays.                      | Laptop (1366x768), `lg` | `src/components/feature/company-search/CompanySearchSection.tsx` | 76   | `grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4` -> `grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-2 xl:gap-4`    | Pending |

## 4. Pricing

**Path:** `src/app/[locale]/pricing/page.tsx` (Component: `PricingSection.tsx`)

| Priority | Issue Description                                                                 | Screen Size             | File                                                | Line | Recommended Fix (Before -> After)                                                                       | Status  |
| :------- | :-------------------------------------------------------------------------------- | :---------------------- | :-------------------------------------------------- | :--- | :------------------------------------------------------------------------------------------------------ | :------ |
| Critical | Massive `py-24` forces user to scroll down just to see pricing cards on 1366x768. | Laptop (1366x768), `sm` | `src/components/feature/pricing/PricingSection.tsx` | 17   | `mx-auto w-full max-w-6xl px-4 py-24 sm:px-6` -> `mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 xl:py-24` | Pending |
| Major    | Bottom margin on the header before cards is too large for short screens.          | Laptop (1366x768), `lg` | `src/components/feature/pricing/PricingSection.tsx` | 19   | `mb-16 text-center` -> `mb-8 xl:mb-16 text-center`                                                      | Pending |

## 5. About

**Path:** `src/app/[locale]/about/page.tsx`

| Priority | Issue Description                                     | Screen Size             | File                                            | Line | Recommended Fix (Before -> After) | Status  |
| :------- | :---------------------------------------------------- | :---------------------- | :---------------------------------------------- | :--- | :-------------------------------- | :------ |
| Major    | Hero padding fixed heights causing vertical overflow. | Laptop (1366x768), `lg` | `src/components/feature/about/AboutSection.tsx` | 10   | `py-24` -> `py-16 xl:py-24`       | Pending |

## 6. Contact

**Path:** `src/app/[locale]/contact/page.tsx`

| Priority | Issue Description                                             | Screen Size             | File                                             | Line | Recommended Fix (Before -> After) | Status  |
| :------- | :------------------------------------------------------------ | :---------------------- | :----------------------------------------------- | :--- | :-------------------------------- | :------ |
| Major    | Form container paddings pushing submit button below the fold. | Laptop (1366x768), `lg` | `src/components/feature/contact/ContactPage.tsx` | 15   | `mt-16` -> `mt-8 xl:mt-16`        | Pending |

## 7. Login

**Path:** `src/app/[locale]/login/page.tsx` (Components: `login-hero.tsx`, `login-form.tsx`)

| Priority | Issue Description                                                                                                | Screen Size             | File                                 | Line | Recommended Fix (Before -> After)                                                                                                     | Status  |
| :------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------- | :----------------------------------- | :--- | :------------------------------------------------------------------------------------------------------------------------------------ | :------ |
| Critical | Fixed margin-top `-mt-25` combined with `py-10` can clip the login form off-screen on short heights.             | Laptop (1366x768), `lg` | `src/components/auth/login-form.tsx` | 59   | `-mt-25 bg-background px-6 py-10` -> `mt-0 lg:-mt-25 bg-background px-6 py-8 xl:py-10`                                                | Pending |
| Major    | Login hero text container `h-[15%]` and `h-[80%]` flex distributions may misalign the graphic on short displays. | Laptop (1366x768), `lg` | `src/components/auth/login-hero.tsx` | 25   | `flex h-[15%] flex-col justify-end px-4 md:px-8 lg:px-10` -> `flex h-auto sm:h-[15%] flex-col justify-end px-4 md:px-8 lg:px-10 pb-4` | Pending |

## 8. Register

**Path:** `src/app/[locale]/register/page.tsx` (Components: `register-hero.tsx`, `register-form.tsx`)

| Priority | Issue Description                                                                      | Screen Size             | File                                    | Line | Recommended Fix (Before -> After)                                                      | Status  |
| :------- | :------------------------------------------------------------------------------------- | :---------------------- | :-------------------------------------- | :--- | :------------------------------------------------------------------------------------- | :------ |
| Critical | Similar to login, register form is longer and `-mt-25` easily clips the submit button. | Laptop (1366x768), `lg` | `src/components/auth/register-form.tsx` | 59   | `-mt-25 bg-background px-6 py-10` -> `mt-0 lg:-mt-25 bg-background px-6 py-8 xl:py-10` | Pending |

## 9. Company Profile

**Path:** `src/app/[locale]/company/profile/page.tsx`

| Priority | Issue Description                                                    | Screen Size  | File                                                | Line | Recommended Fix (Before -> After)             | Status  |
| :------- | :------------------------------------------------------------------- | :----------- | :-------------------------------------------------- | :--- | :-------------------------------------------- | :------ |
| Major    | Wide grid items might compress text excessively instead of wrapping. | Mobile, `md` | `src/components/feature/profile/CompanyProfile.tsx` | 42   | `grid-cols-4` -> `grid-cols-2 lg:grid-cols-4` | Pending |

## 10. User Profile

**Path:** `src/app/[locale]/user/profile/page.tsx`

| Priority | Issue Description                                                     | Screen Size             | File                                             | Line | Recommended Fix (Before -> After) | Status  |
| :------- | :-------------------------------------------------------------------- | :---------------------- | :----------------------------------------------- | :--- | :-------------------------------- | :------ |
| Major    | Side-by-side flex layouts overflowing horizontally on narrow laptops. | Laptop (1366x768), `lg` | `src/components/feature/profile/UserProfile.tsx` | 65   | `gap-8` -> `gap-4 xl:gap-8`       | Pending |
