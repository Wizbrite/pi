import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-sm text-muted-foreground">Update your student profile and target exam configuration.</p>
      </div>

      <Card className="bg-card border-border text-card-foreground shadow-xs">
        <CardHeader>
          <CardTitle className="text-xl">Student Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-foreground">Full Name</Label>
              <Input id="fullname" defaultValue="Njini Favour" className="bg-background border-input text-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <Input id="email" defaultValue="njinifavourbemsimbom@gmail.com" disabled className="bg-muted text-muted-foreground border-input opacity-70" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-level" className="text-foreground">Target GCE Level</Label>
            <Input id="exam-level" defaultValue="GCE Advanced Level (A Level)" className="bg-background border-input text-foreground" />
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}