import AdminDashboard from '@/features/admin/components/Dashboard';
import { useAppSelector } from '@/store/global';
import { getAuthUser, isUserAdmin } from '@/store/global/auth/auth.slice';

export default function AdminPage() {
  const user = useAppSelector(getAuthUser);
  const isAdmin = useAppSelector(isUserAdmin);
  if (!user || !isAdmin) {
    return null; // or a loading spinner
  }
  return <AdminDashboard />;
}
