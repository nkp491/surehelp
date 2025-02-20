'use client';

import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ManagerDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-3 space-y-6">
          {/* Teams Section */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">TEAMS</h2>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {/* Placeholder for teams list */}
              <p className="text-muted-foreground">List of teams.</p>
            </div>
          </Card>

          {/* Team Bulletin Section */}
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-4">TEAM BULLETIN</h2>
            <div className="h-[300px]">
              {/* Placeholder for team bulletin content */}
            </div>
          </Card>
        </div>

        {/* Middle Column - Agents */}
        <div className="col-span-6">
          <Card className="p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">AGENTS</h2>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {/* Placeholder for agent cards */}
              <p className="text-muted-foreground col-span-3">
                List of Agents showing individual ratio card stats in rows and columns
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-3 space-y-6">
          {/* 1:1 Notes Section */}
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-4">1:1 NOTES</h2>
            <div className="h-[200px]">
              {/* Placeholder for 1:1 notes content */}
            </div>
          </Card>

          {/* Success Calculator Section */}
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-4">SUCCESS CALCULATOR</h2>
            <div className="h-[300px]">
              {/* Placeholder for success calculator content */}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 