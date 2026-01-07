// src/components/student/StudentLayout.jsx
import Layout from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, TrendingUp, MessageSquare, BarChart3, FilePlus } from 'lucide-react';

const studentNav = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Service Request', href: '/student/service-request', icon: FilePlus },
  { name: 'Uploads', href: '/student/uploads', icon: Upload },
  { name: 'Thesis Submission', href: '/student/thesis-submission', icon: FileText },
  { name: 'Progress Updates', href: '/student/progress-updates', icon: TrendingUp },
  { name: 'Feedback', href: '/student/feedback', icon: MessageSquare },
  { name: 'Analytics', href: '/student/analytics', icon: BarChart3 },
];

const studentNotifications = [
  { id: 1, label: 'New Feedback Received', link: '/student/feedback' },
];

export default function StudentLayout({ onLogout }) {
  const navigate = useNavigate();
  return (
    <Layout
      navigation={studentNav}
      title="Student Portal"
      logoIcon={FileText}
      notifications={studentNotifications}
      profileLinks={[
        { label: 'Profile Settings', action: () => navigate('/student/profile') },
        { label: 'Logout', action: onLogout, destructive: true },
      ]}
    />
  );
}