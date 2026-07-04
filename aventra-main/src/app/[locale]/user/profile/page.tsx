import RequireRole from "@/components/auth/RequireRole";
import { UserProfile } from "@/components/feature/profile/UserProfile";
import { ROLES } from "@/constants/roles";

export default function UserProfilePage() {
  return (
    <RequireRole allowedRoles={[ROLES.user, ROLES.admin]}>
      <UserProfile />
    </RequireRole>
  );
}
