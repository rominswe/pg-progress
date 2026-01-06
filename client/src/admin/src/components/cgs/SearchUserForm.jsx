import { useState, useMemo } from 'react';
import { Search, Loader2, UserPlus } from 'lucide-react';

import { Button } from '../../../../shared/ui/button';
import { Label } from '../../../../shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../shared/ui/select';
import { Input } from '../../../../shared/ui/input';

const NO_SELECTION = 'placeholder';

// Minimal department list for frontend usage
const HARDCODED_DEPARTMENTS = [
  { code: 'CS', name: 'Computer Science' },
  { code: 'MATH', name: 'Mathematics' },
  { code: 'OTHERS', name: 'Others' },
];

export default function SearchUserForm({ onSearch, isSearching }) {
  const [role, setRole] = useState('');
  const [idValue, setIdValue] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [examinerType, setExaminerType] = useState(NO_SELECTION);

  // --- Conditional Logic ---
  const isExaminer = role === 'Examiner';
  const hasExaminerTypeSelected = examinerType !== NO_SELECTION;
  const isInternalExaminer = isExaminer && examinerType === 'internal';
  const isExternalExaminer = isExaminer && examinerType === 'external';
  const isEmailSearch = isExaminer;
  const isSearchFieldsEnabled = !isExaminer || hasExaminerTypeSelected;

  // --- Handlers ---
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setIdValue('');
    setDepartmentCode('');
    setExaminerType(newRole === 'Examiner' ? NO_SELECTION : '');
  };

  const handleExaminerTypeChange = (newType) => {
    setExaminerType(newType);
    setIdValue('');
    setDepartmentCode('');

    if (newType === 'internal') {
      setDepartmentCode('OTHERS');
    }
  };

  const getIdPlaceholder = useMemo(() => {
    if (!role) return 'Select a role first';
    if (isEmailSearch) return 'Enter Email Address (e.g., jane.doe@university.com)';
    if (role === 'Student') return 'Enter Student ID (e.g., STU001)';
    return 'Enter Employee ID (e.g., EMP001)';
  }, [role, isEmailSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isExaminer && !hasExaminerTypeSelected) {
      alert('Please select the Examiner Type (Internal or External) first.');
      return;
    }

    onSearch(
      role,
      idValue.trim(),
      departmentCode,
      isExaminer ? examinerType : undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={`grid gap-4 md:grid-cols-${isExaminer ? 4 : 3}`}>
        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role">Select Role</Label>
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger id="role" className="bg-background">
              <SelectValue placeholder="Select role..." />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
              <SelectItem value="Examiner">Examiner</SelectItem>
              <SelectItem value="CGS Staff">CGS Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Examiner Type */}
        {isExaminer && (
          <div className="space-y-2">
            <Label htmlFor="examinerType">Examiner Type</Label>
            <Select value={examinerType} onValueChange={handleExaminerTypeChange}>
              <SelectTrigger id="examinerType" className="bg-background">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {examinerType === NO_SELECTION && (
                  <SelectItem value={NO_SELECTION} disabled>
                    Select type...
                  </SelectItem>
                )}
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ID / Email */}
        <div className="space-y-2">
          <Label htmlFor="idValue">{isEmailSearch ? 'Email' : 'ID'}</Label>
          <Input
            id="idValue"
            type={isEmailSearch ? 'email' : 'text'}
            value={idValue}
            onChange={(e) => setIdValue(e.target.value)}
            placeholder={getIdPlaceholder}
            disabled={!role || (isExaminer && !hasExaminerTypeSelected)}
            required={isExaminer}
            className="bg-background"
          />
        </div>

        {/* Department */}
        {!isExternalExaminer && (
          <div className="space-y-2">
            <Label htmlFor="departmentCode">Department Code</Label>
            <Select
              value={departmentCode}
              onValueChange={setDepartmentCode}
              disabled={!isSearchFieldsEnabled || isInternalExaminer}
            >
              <SelectTrigger id="departmentCode" className="bg-background">
                <SelectValue placeholder="Select department..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {HARDCODED_DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.code} value={dept.code}>
                    {dept.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={
          isSearching ||
          !role ||
          (isExaminer && !hasExaminerTypeSelected) ||
          (isExaminer && !idValue)
        }
        className="w-full md:w-auto"
      >
        {isSearching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isExaminer ? 'Registering...' : 'Searching...'}
          </>
        ) : (
          <>
            {isExaminer ? (
              <UserPlus className="mr-2 h-4 w-4" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {isExaminer ? 'Register' : 'Search'}
          </>
        )}
      </Button>
    </form>
  );
}