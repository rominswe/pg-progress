import Layout from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, FileText, ClipboardCheck, Settings } from 'lucide-react';

const examinerNav = [
    { name: 'Dashboard', href: '/examiner/dashboard', icon: LayoutDashboard },
];

export default function ExaminerLayout({ onLogout }) {
    const navigate = useNavigate();

    return (
        <Layout
            navigation={examinerNav}
            title="Thesis Examiner Portal"
            logoIcon={FileText}
            notifications={[]}
            profileLinks={[
                { label: 'Profile Settings', icon: User, action: () => navigate('/examiner/profile') },
                { label: 'Logout', action: onLogout, destructive: true },
            ]}
        />
    );
}
