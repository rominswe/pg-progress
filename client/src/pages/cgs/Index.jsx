import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../pages/cgs/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '../../pages/cgs/ui/card';
import { GraduationCap, Users, FileCheck, Activity, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'User Registration',
    description: 'Register students, supervisors, and examiners with ease.',
  },
  {
    icon: Activity,
    title: 'Progress Monitoring',
    description: 'Track student progress and supervisor assignments.',
  },
  {
    icon: FileCheck,
    title: 'Document Verification',
    description: 'Review and approve student documents efficiently.',
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-muted/30 via-background to-muted/50">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CGS Portal</span>
          </div>
          <Button onClick={() => navigate('/cgs/dashboard')}>
            Staff Login
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Centre for Graduate Studies
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          A comprehensive staff portal for managing student registrations, monitoring progress,
          and verifying academic documents.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" onClick={() => navigate('/cgs/dashboard')}>
            Access Staff Portal
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Centre for Graduate Studies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}