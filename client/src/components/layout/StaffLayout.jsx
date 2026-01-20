import Layout from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { LayoutDashboard, UserPlus, Activity, User, CheckCircle, BarChart3 } from 'lucide-react';

// Navigation for CGS portal
const cgsNav = [
  { name: 'Dashboard', href: '/cgs/dashboard', icon: LayoutDashboard },
  { name: 'Postgraduate Users', href: '/cgs/users', icon: User },
  { name: 'Assignment Overview', href: '/cgs/assignment-overview', icon: BarChart3 },
  { name: 'User Registration', href: '/cgs/register', icon: UserPlus },
  { name: 'Progress Monitoring', href: '/cgs/monitoring', icon: Activity },
];

// Optional notifications (can be dynamic)
const cgsNotifications = [
  { id: 1, label: 'New User Registered', link: '/cgs/register' },
];

export default function CGSLayout({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user can access Approvals (CGSADM OR CGSS+Director)
  const canAccessApprovals =
    user?.role_id === "CGSADM" ||
    (user?.role_id === "CGSS" && user?.role_level === "Director");

  // Build navigation dynamically based on user role
  const navigation = [
    ...cgsNav,
    ...(canAccessApprovals
      ? [{ name: 'Approvals', href: '/cgs/approvals', icon: CheckCircle }]
      : []),
  ];

  const profileLinks = [
    {
      label: 'Profile Settings',
      icon: User,
      action: () => navigate('/cgs/profile')
    },
    {
      label: 'Logout',
      action: onLogout, // 4. Use the passed logout function
      destructive: true
    },
  ];

  return (
    <Layout
      navigation={navigation}
      title="Centre for Graduate Studies"
      logoIcon={LayoutDashboard}
      notifications={cgsNotifications}
      profileLinks={profileLinks}
    />
  );
}