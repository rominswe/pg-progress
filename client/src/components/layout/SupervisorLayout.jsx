//src/components/supervisor/SupervisorLayout.jsx
import Layout from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, FilePlus, ClipboardCheck } from 'lucide-react';

const supervisorNav = [
  { name: 'Dashboard', href: '/supervisor/dashboard', icon: LayoutDashboard },
  { name: 'My Students', href: '/supervisor/students', icon: Users },
  { name: 'Review Submission', href: '/supervisor/review', icon: FileText },
  { name: 'PG-Form Approval', href: '/supervisor/review-request', icon: FilePlus },
  { name: 'Student Progress Update', href: '/supervisor/evaluate', icon: ClipboardCheck },
  { name: 'Evaluation', href: '/supervisor/evaluate-2', icon: ClipboardCheck },
];

const supervisorNotifications = [
  { id: 1, label: 'New PG-Form Approval', link: '/supervisor/review-request' },
];

export default function SupervisorLayout({ onLogout }) {
  const navigate = useNavigate();

  return (
    <Layout
      navigation={supervisorNav}
      title="Academic Supervisor Portal"
      logoIcon={FileText}
      notifications={supervisorNotifications}
      profileLinks={[
        { label: 'Profile Settings', action: () => navigate('/supervisor/profile') },
        { label: 'Logout', action: onLogout, destructive: true },
      ]}
    />
  );
}
