import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Profile from '@/components/layout/Profile';

export default function ExaminerProfile() {
    const navigate = useNavigate();
    // Examiner-specific wrapper if needed, otherwise we just render the shared Profile
    // The shared profile seems robust enough based on previous analysis

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/examiner/dashboard')}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            </div>

            <Profile />
        </div>
    );
}
