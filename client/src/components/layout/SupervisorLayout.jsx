//src/components/supervisor/SupervisorLayout.jsx
import Layout from '../shared/Layout';
import { LayoutDashboard, Users, FileText, FilePlus, ClipboardCheck } from 'lucide-react';

const supervisorNav = [
  { name: 'Dashboard', href: '/supervisor/dashboard', icon: LayoutDashboard },
  { name: 'My Students', href: '/supervisor/students', icon: Users },
  { name: 'Past Reviews', href: '/supervisor/reviews', icon: FileText },
  { name: 'Review Requests', href: '/supervisor/review-request', icon: FilePlus },
  { name: 'Evaluation', href: '/supervisor/evaluate', icon: ClipboardCheck },
];

const supervisorNotifications = [
  { id: 1, label: 'New Review Request', link: '/supervisor/review-request' },
];

export default function SupervisorLayout() {
  return (
    <Layout
      navigation={supervisorNav}
      title="Academic Supervisor Portal"
      logoIcon={FileText}
      notifications={supervisorNotifications}
    />
  );
}
