import React from 'react';
import { User, Mail, Building, IdCard, CheckCircle2, Clock, Globe, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function UserDetailCard({ user, onRegister }) {
  const isRegistered = user.status === 'Registered';
  const isPending = user.status === 'Pending';
  const isUnregistered = user.status === 'Unregistered';
  const { showRole, showProgram } = user.displayConfigs || {};

  return (
    <Card className="overflow-hidden border-t-4 border-t-primary">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{user.fullName}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {user.identifierLabel}: <span className="text-foreground">{user.identifier}</span>
              </p>
            </div>
          </div>

          <Badge 
            variant="outline"
            className={`capitalize py-1 px-2 ${
              isRegistered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
              isPending ? 'bg-amber-50 text-amber-700 border-amber-200' : 
              'bg-slate-50 text-slate-600'
            }`}
          >
            {isRegistered && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {isPending && <Clock className="h-3 w-3 mr-1 animate-pulse" />}
            {user.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
        <div className="space-y-3">
          {showRole && (
            <div className="flex items-center gap-3 text-sm">
              <IdCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Role</span>
              <span>{user.roleLabel}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Dept</span>
            <span>{user.departmentLabel}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Email</span>
            <span className="truncate">{user.email}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Country</span>
            <span>{user.country || 'N/A'}</span>
          </div>
          {showProgram && (
            <div className="flex items-center gap-3 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Program</span>
              <span>{user.programName || 'N/A'}</span>
            </div>
          )}
        </div>

        <div className="md:col-span-2 pt-4 border-t mt-2">
          {isUnregistered ? (
            <Button onClick={onRegister} className="w-full shadow-lg shadow-primary/20">
              Registered User
            </Button>
          ) : (
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-muted-foreground italic">
                {isRegistered 
                  ? "This user already has an active portal account." 
                  : "Registration is currently awaiting user activation via email."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}