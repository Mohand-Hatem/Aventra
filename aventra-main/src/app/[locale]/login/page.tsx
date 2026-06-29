import { LoginForm } from "@/components/auth/login-form";
import { LoginHero } from "@/components/auth/login-hero";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function LoginPage() {
  return (
    <AuthPageShell>
      <LoginHero />
      <LoginForm />
    </AuthPageShell>
  );
}
