import { useState } from 'react';
import { Search, UserX } from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/card';

import SearchUserForm from '../../components/users/SearchUserForm';
import UserDetailCard from '../../components/users/UserDetailCard';
import ConfirmRegisterModal from '../../components/modal/ConfirmRegisterModal';

export default function CGSRegisterUsers() {
  const [users, setUsers] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSearch = (role, idValue, departmentCode, examinerType) => {
    setIsSearching(true);
    setHasSearched(true);
    setSearchResult(null);

    // 🔧 Simulated backend behavior (to be replaced with API)
    setTimeout(() => {
      setIsSearching(false);

      // Examiner registration flow (simulated success)
      if (role === 'Examiner' && idValue) {
        setSearchResult({
          id: 'temp-user',
          role,
          email: idValue,
          departmentCode,
          examinerType,
          status: 'Unregistered',
          name: 'Simulated User',
        });
        return;
      }

      toast.error('No user found matching the search criteria.');
    }, 500);
  };

  const handleRegister = () => {
    setShowConfirmModal(true);
  };

  const confirmRegistration = () => {
    if (!searchResult) return;

    setUsers((prev) => [
      ...prev,
      { ...searchResult, id: crypto.randomUUID(), status: 'Registered' },
    ]);

    setSearchResult((prev) =>
      prev ? { ...prev, status: 'Registered' } : null
    );

    setShowConfirmModal(false);
    toast.success('User registered successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Register Users</h1>
        <p className="text-muted-foreground">
          Search and register students, supervisors, and examiners.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Search
          </CardTitle>
          <CardDescription>
            Select role and enter required identification details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchUserForm onSearch={handleSearch} isSearching={isSearching} />
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {searchResult ? (
            <UserDetailCard
              user={searchResult}
              onRegister={handleRegister}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 rounded-lg border bg-muted/40">
              <UserX className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground font-medium">
                No unregistered user found
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation */}
      {searchResult && (
        <ConfirmRegisterModal
          open={showConfirmModal}
          onOpenChange={setShowConfirmModal}
          userName={searchResult.name}
          onConfirm={confirmRegistration}
        />
      )}
    </div>
  );
}