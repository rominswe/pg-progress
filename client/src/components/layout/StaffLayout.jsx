import Layout from '../shared/Layout';
import { LayoutDashboard, UserPlus, Activity, FileCheck, FileSignature } from 'lucide-react';

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

export default function CGSLayout() {
  return (
    <Layout
      navigation={cgsNav}
      title="Centre for Graduate Studies"
      logoIcon={LayoutDashboard} // or custom CGS icon
      notifications={cgsNotifications}
      profileLinks={[
        { label: 'Profile Settings', action: () => console.log('Go to profile') },
        { label: 'Logout', action: null, destructive: true }, // logout handled inside Layout
      ]}
    />
  );
}