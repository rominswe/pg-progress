import Layout from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Activity, FileCheck, FileSignature, User } from 'lucide-react';

// Navigation for CGS portal
const cgsNav = [
  { name: 'Dashboard', href: '/cgs/dashboard', icon: LayoutDashboard },
  { name: 'Register Users', href: '/cgs/register', icon: UserPlus },
  { name: 'Monitoring', href: '/cgs/monitoring', icon: Activity },
  { name: 'Verify Documents', href: '/cgs/documents', icon: FileCheck },
  { name: 'Form Builder', href: '/cgs/forms', icon: FileSignature },
];

// Optional notifications (can be dynamic)
const cgsNotifications = [
  { id: 1, label: 'New User Registered', link: '/cgs/register' },
  { id: 2, label: 'Pending Document Verification', link: '/cgs/documents' },
];

export default function CGSLayout({ onLogout }) {
  const navigate = useNavigate();

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
      navigation={cgsNav}
      title="Centre for Graduate Studies"
      logoIcon={LayoutDashboard}
      notifications={cgsNotifications}
      profileLinks={profileLinks}
    />
  );
}