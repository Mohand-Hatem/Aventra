import RequireRole from "@/components/auth/RequireRole";
import { CompanyProfile } from "@/components/feature/profile/CompanyProfile";
import { ROLES } from "@/constants/roles";

export default function CompanyProfilePage() {
  return (
    <RequireRole allowedRoles={[ROLES.company, ROLES.admin]}>
      <CompanyProfile />
    </RequireRole>
  );
}
