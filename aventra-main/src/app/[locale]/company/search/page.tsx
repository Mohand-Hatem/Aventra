import RequireRole from "@/components/auth/RequireRole";
import CompanySearchSection from "@/components/feature/company-search/CompanySearchSection";
import { ROLES } from "@/constants/roles";

export const metadata = {
  title: "Candidate Search — Aventra",
  description: "Search and discover candidates using AI-powered matching.",
};

export default function CompanySearchPage() {
  return (
    <RequireRole allowedRoles={[ROLES.company, ROLES.admin]}>
      <CompanySearchSection />
    </RequireRole>
  );
}
