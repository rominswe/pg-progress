import { useState } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const NO_SELECTION = 'placeholder';

export default function SearchUserForm({ onResult }) {
  const [role, setRole] = useState(''); // Student / Academic Staff
  const [staffType, setStaffType] = useState(NO_SELECTION); // internal / external
  const [identifier, setIdentifier] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const isAcademicStaff = role === 'Academic Staff';
  const isExternal = staffType === 'external';
  const isFormValid =
    role && identifier.trim() && (!isAcademicStaff || staffType !== NO_SELECTION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSearching(true);

    try {
      const res = await api.get('/api/admin/search-info', {
        params: {
          role,
          type: staffType, // internal / external, only relevant for Academic Staff
          query: identifier.trim(),
        },
      });

      if (res.data?.success) {
        onResult(res.data.data);
      } else {
        toast.error('No matching user found.');
        onResult(null);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Unable to retrieve user information. Please try again.';
      toast.error(message);
      onResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={`grid gap-4 md:grid-cols-${isAcademicStaff ? 3 : 2}`}>
        {/* Role */}
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={role}
            onValueChange={(v) => {
              setRole(v);
              setStaffType(NO_SELECTION);
              setIdentifier('');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Academic Staff">Academic Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Staff Type */}
        {isAcademicStaff && (
          <div className="space-y-2">
            <Label>Staff Type</Label>
            <Select value={staffType} onValueChange={setStaffType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Identifier */}
        <div className="space-y-2">
          <Label>{isExternal ? 'Email Address' : 'ID'}</Label>
          <Input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={
              !role
                ? 'Select role first'
                : isExternal
                ? 'Enter email address'
                : role === 'Student'
                ? 'Enter student ID'
                : 'Enter employee ID'
            }
            disabled={!role || (isAcademicStaff && staffType === NO_SELECTION)}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={!isFormValid || isSearching}>
        {isSearching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Search
          </>
        )}
      </Button>
    </form>
  );
}