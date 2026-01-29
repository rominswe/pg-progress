import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GraduationCap, Calendar, Hash, Trophy } from "lucide-react";
import ProfileField from "@/components/profile/ProfileField";

export default function StudentAcademicInfo({ user }) {
    return (
        <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black tracking-tight text-slate-800">
                    Academic Enrollment
                </CardTitle>
                <CardDescription>View and manage your current academic status and program.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <ProfileField
                        label="CGS Research Level"
                        value={user.role_level}
                        icon={Trophy}
                        readOnly
                    />

                    <ProfileField
                        label="Academic Intake Year"
                        value={user.acad_year}
                        icon={Calendar}
                        readOnly
                    />

                    <ProfileField
                        label="Current Semester"
                        value={user.Semester || '1'}
                        icon={Hash}
                        readOnly
                    />

                    <ProfileField
                        label="Enrolled Program"
                        value={user.program_name}
                        icon={GraduationCap}
                        className="md:col-span-2"
                        readOnly
                    />
                </div>
            </CardContent>
        </Card>
    );
}
