import { RegisterForm } from "@/components/auth/register-form";
import { RegisterHero } from "@/components/auth/register-hero";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export const dynamic = "force-static";

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <RegisterHero />
      <RegisterForm />
    </AuthPageShell>
  );
}
