
import Layout from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    History,
    UserCircle
} from 'lucide-react';

const examinerNav = [
    { name: 'Dashboard', href: '/examiner/dashboard', icon: LayoutDashboard },
    // Add other navigation items here as we build them, e.g.
    // { name: 'Evaluations', href: '/examiner/evaluations', icon: FileText },
    // { name: 'History', href: '/examiner/history', icon: History },
];

const examinerNotifications = [
    // Placeholder for notifications
    // { id: 1, label: 'New Thesis for Review', link: '/examiner/dashboard' },
];

export default function ExaminerLayout({ onLogout }) {
    const navigate = useNavigate();
    return (
        <Layout
            navigation={examinerNav}
            title="Examiner Portal"
            logoIcon={FileText}
            notifications={examinerNotifications}
            profileLinks={[
                { label: 'Profile Settings', action: () => navigate('/examiner/profile') },
                { label: 'Logout', action: onLogout, destructive: true },
            ]}
        />
    );
}
