import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../pages/cgs/ui/card';
import { toast } from 'sonner';
import SearchUserForm from '../../components/cgs/SearchUserForm';
import UserDetailCard from '../../components/cgs/UserDetailCard';
import ConfirmRegisterModal from '../../components/cgs/ConfirmRegisterModal';
import { mockUsers } from '../../data/mockUsers';
import { Search, UserX } from 'lucide-react';

export default function CGSRegisterUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSearch = (role, idValue, departmentCode) => {
    setIsSearching(true);
    setHasSearched(true);

    // Simulate API delay
    setTimeout(() => {
      const found = users.find((user) => {
        const roleMatch = user.role === role;
        const idMatch =
          role === 'Student'
            ? user.studentId?.toLowerCase() === idValue.toLowerCase()
            : user.employeeId?.toLowerCase() === idValue.toLowerCase();
        const deptMatch = departmentCode
          ? user.departmentCode.toLowerCase() === departmentCode.toLowerCase()
          : true;

        return roleMatch && (idValue ? idMatch : true) && deptMatch;
      });

      setSearchResult(found || null);
      setIsSearching(false);

      if (!found) {
        toast.error('No user found matching the search criteria.');
      }
    }, 500);
  };

  const handleRegister = () => {
    setShowConfirmModal(true);
  };

  const confirmRegistration = () => {
    if (searchResult) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === searchResult.id ? { ...user, status: 'Registered' } : user
        )
      );
      setSearchResult((prev) =>
        prev ? { ...prev, status: 'Registered' } : null
      );
      setShowConfirmModal(false);
      toast.success('User registered successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Register Users</h1>
        <p className="text-muted-foreground">
          Search and register students, supervisors, or examiners in the system.
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Search
          </CardTitle>
          <CardDescription>
            Search for a user by selecting their role and entering their ID or department code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchUserForm onSearch={handleSearch} isSearching={isSearching} />
        </CardContent>
      </Card>

      {/* Search Result */}
      {hasSearched && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Search Result</h2>
          {searchResult ? (
            <div className="max-w-md">
              <UserDetailCard user={searchResult} onRegister={handleRegister} />
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <UserX className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">
                  No user found matching the search criteria.
                </p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Please check the ID and department code and try again.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
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
