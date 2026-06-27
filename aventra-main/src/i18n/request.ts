import { getRequestConfig } from 'next-intl/server';
import { localizeMessageTree } from '@/lib/locale-format';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;

  // Fallback to default if locale is not valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages: localizeMessageTree(messages, locale),
  };
});