import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  const locale = (await cookies()).get('NEXT_LOCALE')?.value || 'en';
  redirect(`/${locale}`);
}