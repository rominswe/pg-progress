import React from 'react';
import PropTypes from 'prop-types';
import { User, Mail, Building, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';

export default function UserDetailCard({ user, onRegister }) {
  const isRegistered = user?.status === 'Registered';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{user?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {user?.role === 'Student' ? user?.studentId : user?.employeeId}
              </p>
            </div>
          </div>
          <Badge
            variant={isRegistered ? 'default' : 'secondary'}
            className={
              isRegistered
                ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
            }
          >
            {isRegistered ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {user?.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>
              {user?.department} ({user?.departmentCode})
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{user?.role}</span>
          </div>
        </div>

        {!isRegistered && (
          <Button onClick={onRegister} className="w-full mt-4">
            Register User
          </Button>
        )}

        {isRegistered && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            This user is already registered in the system.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

UserDetailCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    role: PropTypes.string,
    studentId: PropTypes.string,
    employeeId: PropTypes.string,
    department: PropTypes.string,
    departmentCode: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onRegister: PropTypes.func,
};

UserDetailCard.defaultProps = {
  onRegister: () => {},
};
