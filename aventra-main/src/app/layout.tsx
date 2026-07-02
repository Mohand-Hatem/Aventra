// Required when using a root `not-found.tsx` (see next-intl error-files docs).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
