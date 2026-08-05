import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award, Target } from 'lucide-react';

export default function ProgressPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Performance Analytics</h1>
        <p className="text-sm text-muted-foreground">In-depth insights generated from your mock tests and study habits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border text-card-foreground shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Strongest Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm p-3 bg-muted rounded-lg border border-border">
              <span className="font-medium text-foreground">Algebra & Polynomials</span>
              <span className="text-primary font-bold">92% Accuracy</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 bg-muted rounded-lg border border-border">
              <span className="font-medium text-foreground">Data Representation & Logic Gates</span>
              <span className="text-primary font-bold">88% Accuracy</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-card-foreground shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-600" />
              Topics Needing Revision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <span className="font-medium text-foreground">Electromagnetism</span>
              <span className="text-destructive font-bold">45% Accuracy</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <span className="font-medium text-foreground">Integration by Parts</span>
              <span className="text-destructive font-bold">52% Accuracy</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}