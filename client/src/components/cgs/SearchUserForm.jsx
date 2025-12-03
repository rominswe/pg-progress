import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../pages/cgs/ui/button';
import { Label } from '../../pages/cgs/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../pages/cgs/ui/select';
import { Input } from '../../pages/cgs/ui/input';
import { mockUsers, DEPARTMENTS } from '../../data/mockUsers';

export default function SearchUserForm({ onSearch, isSearching }) {
  const [role, setRole] = useState('');
  const [idValue, setIdValue] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role) {
      onSearch(role, idValue.trim(), departmentCode);
    }
  };

  const getIdPlaceholder = () => {
    if (role === 'Student') return 'Enter Student ID (e.g., STU001)';
    if (role === 'Supervisor' || role === 'Examiner' || role === 'CGS Staff') return 'Enter Employee ID (e.g., EMP001)';
    return 'Select a role first';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="role">Select Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value)}>
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

        <div className="space-y-2">
          <Label htmlFor="idValue">ID</Label>
          <Input
            id="idValue"
            value={idValue}
            onChange={(e) => setIdValue(e.target.value)}
            placeholder={getIdPlaceholder()}
            disabled={!role}
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="departmentCode">Department Code</Label>
          <Select value={departmentCode} onValueChange={setDepartmentCode}>
            <SelectTrigger id="departmentCode" className="bg-background">
              <SelectValue placeholder="Select department..." />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept.code} value={dept.code}>
                  {dept.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!role || isSearching}
        className="w-full md:w-auto"
      >
        <Search className="mr-2 h-4 w-4" />
        {isSearching ? 'Searching...' : 'Search'}
      </Button>
    </form>
  );
}