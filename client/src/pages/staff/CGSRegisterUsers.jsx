import { useState } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';
import { Search, ShieldCheck, UserX } from 'lucide-react';
import SearchUserForm from '@/components/users/SearchUserForm';
import UserDetailCard from '@/components/users/UserDetailCard';
import ConfirmRegisterModal from '@/components/modal/ConfirmRegisterModal';
import ManualRegisterModal from '@/components/modal/ManualRegisterModal';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

export default function RegisterUser() {
  const [user, setUser] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const handleSearchSuccess = (data, params) => {
    setHasSearched(true);
    if (!data) {
      setUser(null);
      setShowManual(false);
      return;
    }

    const normalizedUser = {
      ...data,
      identifier: data.identifier || data.email || params?.query || '',
      identifierLabel: data.identifierLabel || (params?.type === 'external' ? 'Email' : 'ID'),
    };

    setUser(normalizedUser);
    if (normalizedUser.allowManualRegistration) {
      setShowManual(true);
    } else {
      setShowManual(false);
    }
  };

  const registerUser = async (manualPayload = null) => {
    if (!user && !manualPayload) return;
    setIsRegistering(true);

    try {
      let payload;
      if (manualPayload) {
        payload = {
          ...manualPayload,
          searchRole: 'Academic Staff',
          staffType: 'external',
          manual: true
        };
      } else {
        payload = {
          identifier: user.identifier,
          searchRole: user.identifierLabel === 'Student ID' ? 'Student' : 'Academic Staff',
          staffType: user.identifierLabel === 'Email' ? 'external' : 'internal'
        };
      }

      const res = await api.post('/api/admin/register-user', payload);

      if (res.data?.success) {
        toast.success('User registered successfully. Activation email sent.');
        setUser(u => ({ ...u, status: 'Pending' }));
        setShowConfirm(false);
        setShowManual(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="mx-auto w-full space-y-6 p-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Register Users</h1>
        <p className="text-muted-foreground">Search institutional records and grant portal access.</p>
      </div>

      <Card className="shadow-sm border-muted/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            User Search
          </CardTitle>
          <CardDescription>Search by role and institutional identifier.</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchUserForm onResult={handleSearchSuccess} />
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 w-fit px-3 py-1 rounded-full text-sm font-medium border border-emerald-100">
                <ShieldCheck className="h-4 w-4" /> Institutional Record Verified
              </div>

              <UserDetailCard
                user={user}
                onRegister={() => {
                  if (user?.allowManualRegistration) {
                    setShowManual(true);
                  } else {
                    setShowConfirm(true);
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/30">
              <UserX className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <p className="text-muted-foreground font-medium">No institutional record found</p>
              <p className="text-xs text-muted-foreground">Verify the ID/Email and try again.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmRegisterModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        userName={user?.fullName}
        role={user?.roleLabel}
        onConfirm={() => registerUser()}
        isLoading={isRegistering}
      />

      <ManualRegisterModal
        open={showManual}
        onOpenChange={setShowManual}
        onRegister={registerUser}
        user={user}
      />
    </div>
  );
}