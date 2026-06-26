import { RegisterForm } from "@/components/auth/register-form";
import { RegisterHero } from "@/components/auth/register-hero";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-violet-50 to-white px-4 py-6 dark:from-[#05040d] dark:via-[#100c24] dark:to-[#05040d] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-6 lg:grid-cols-2">
        <RegisterHero />
        <RegisterForm />
      </div>
    </main>
  );
}