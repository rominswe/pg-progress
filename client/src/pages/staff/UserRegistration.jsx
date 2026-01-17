import { useState } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InternalRegisterForm from '@/components/users/InternalRegisterForm';
import ExternalRegisterForm from '@/components/users/ExternalRegisterForm';

export default function UserRegistration() {
    const [activeTab, setActiveTab] = useState("internal");
    const [loading, setLoading] = useState(false);

    const handleRegistrationSubmit = async (payload, onSuccess) => {
        setLoading(true);
        try {
            // Common logic for both internal and external registration
            // We explicitly enforce the business logic requirements:
            // 1. Status: 'Pending'
            // 2. IsVerified: 0
            // 3. manual: true (for audit trailing manual registrations)
            const finalPayload = {
                ...payload,
                manual: true,
                Status: 'Pending',
                IsVerified: 0
            };

            const res = await api.post('/api/admin/register-user', finalPayload);
            if (res.status === 201 || res.data?.success) {
                toast.success("User registered successfully");
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manual Registration</h1>
                <p className="text-muted-foreground text-lg">
                    Directly register internal staff, students, or external affiliates into the system.
                </p>
            </div>

            <Tabs defaultValue="internal" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                    <TabsTrigger value="internal" className="text-base font-medium">Internal Registration</TabsTrigger>
                    <TabsTrigger value="external" className="text-base font-medium">External Registration</TabsTrigger>
                </TabsList>

                <TabsContent value="internal" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <InternalRegisterForm onRegister={handleRegistrationSubmit} isSubmitting={loading} />
                </TabsContent>

                <TabsContent value="external" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ExternalRegisterForm onRegister={handleRegistrationSubmit} isSubmitting={loading} />
                </TabsContent>
            </Tabs>
        </div >
    );
}
