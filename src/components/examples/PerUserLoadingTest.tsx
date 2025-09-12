import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserX, PlusCircle, MinusCircle } from 'lucide-react';

/**
 * Test component to demonstrate per-user loading states
 */
export function PerUserLoadingTest() {
  const [userLoadingStates, setUserLoadingStates] = useState<Record<string, {
    isAssigningManager?: boolean;
    isRemovingManager?: boolean;
    isAssigningRole?: boolean;
    isRemovingRole?: boolean;
  }>>({});

  const setUserLoading = (userId: string, loadingType: keyof typeof userLoadingStates[string], isLoading: boolean) => {
    setUserLoadingStates(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [loadingType]: isLoading
      }
    }));
  };

  const getUserLoading = (userId: string, loadingType: keyof typeof userLoadingStates[string]) => {
    return userLoadingStates[userId]?.[loadingType] || false;
  };

  const simulateManagerRemoval = (userId: string) => {
    setUserLoading(userId, 'isRemovingManager', true);
    setTimeout(() => {
      setUserLoading(userId, 'isRemovingManager', false);
    }, 2000);
  };

  const simulateManagerAssignment = (userId: string) => {
    setUserLoading(userId, 'isAssigningManager', true);
    setTimeout(() => {
      setUserLoading(userId, 'isAssigningManager', false);
    }, 2000);
  };

  const simulateRoleAssignment = (userId: string) => {
    setUserLoading(userId, 'isAssigningRole', true);
    setTimeout(() => {
      setUserLoading(userId, 'isAssigningRole', false);
    }, 1500);
  };

  const simulateRoleRemoval = (userId: string) => {
    setUserLoading(userId, 'isRemovingRole', true);
    setTimeout(() => {
      setUserLoading(userId, 'isRemovingRole', false);
    }, 1000);
  };

  const mockUsers = [
    { id: 'user1', name: 'John Doe', email: 'john@example.com' },
    { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: 'user3', name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Per-User Loading States Test</h2>
      <p className="text-muted-foreground">
        Click the buttons to test individual user loading states. Each user should show loading independently.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Manager Operations */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Manager Operations</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => simulateManagerAssignment(user.id)}
                    disabled={getUserLoading(user.id, 'isAssigningManager')}
                  >
                    {getUserLoading(user.id, 'isAssigningManager') ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Assign Manager
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => simulateManagerRemoval(user.id)}
                    disabled={getUserLoading(user.id, 'isRemovingManager')}
                  >
                    {getUserLoading(user.id, 'isRemovingManager') ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <UserX className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Role Operations */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Role Operations</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => simulateRoleAssignment(user.id)}
                    disabled={getUserLoading(user.id, 'isAssigningRole')}
                  >
                    {getUserLoading(user.id, 'isAssigningRole') ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Assign Role
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => simulateRoleRemoval(user.id)}
                    disabled={getUserLoading(user.id, 'isRemovingRole')}
                  >
                    {getUserLoading(user.id, 'isRemovingRole') ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <MinusCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Loading Status */}
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Current Status</h4>
                <div className="flex flex-wrap gap-1">
                  {getUserLoading(user.id, 'isAssigningManager') && (
                    <Badge variant="secondary">Assigning Manager</Badge>
                  )}
                  {getUserLoading(user.id, 'isRemovingManager') && (
                    <Badge variant="destructive">Removing Manager</Badge>
                  )}
                  {getUserLoading(user.id, 'isAssigningRole') && (
                    <Badge variant="secondary">Assigning Role</Badge>
                  )}
                  {getUserLoading(user.id, 'isRemovingRole') && (
                    <Badge variant="destructive">Removing Role</Badge>
                  )}
                  {!Object.values(userLoadingStates[user.id] || {}).some(Boolean) && (
                    <Badge variant="outline">Ready</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Expected Behavior:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Each user should show loading independently</li>
            <li>Only the clicked user should show loading state</li>
            <li>Other users should remain unaffected</li>
            <li>Loading states should clear after the timeout</li>
            <li>Multiple operations on the same user should work independently</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
