import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MinusCircle, UserX } from 'lucide-react';

/**
 * Example component demonstrating the enhanced loading states in role management
 */
export function RoleManagementLoadingExample() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Role Management Loading States</h2>
      
      {/* Role Assignment Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Role Assignment Loading States</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button disabled>
              <PlusCircle className="h-4 w-4 mr-1" />
              Assign Role
            </Button>

            <Button disabled>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1" />
              Assigning...
            </Button>

            <Button>
              <PlusCircle className="h-4 w-4 mr-1" />
              Assign Role
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            • Disabled state when no role is selected
            • Loading spinner when assigning role
            • Normal state when ready to assign
          </div>
        </CardContent>
      </Card>

      {/* Role Removal Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Role Removal Loading States</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="default" className="flex items-center gap-1 group">
              Agent Pro
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MinusCircle className="h-3 w-3" />
              </button>
            </Badge>

            <Badge variant="default" className="flex items-center gap-1 group">
              Manager Pro
              <button disabled className="opacity-50">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
              </button>
            </Badge>

            <Badge variant="default" className="flex items-center gap-1 group">
              Agent Pro
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MinusCircle className="h-3 w-3" />
              </button>
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground">
            • Hover to show remove button
            • Loading spinner when removing role
            • Disabled state during removal
          </div>
        </CardContent>
      </Card>

      {/* Manager Assignment Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Manager Assignment Loading States</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select disabled>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
              </Select>
              <Button variant="ghost" size="icon" disabled>
                <UserX className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select disabled>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Assigning..." />
                </SelectTrigger>
              </Select>
              <Button variant="ghost" size="icon" disabled>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager1">John Manager (john@example.com)</SelectItem>
                  <SelectItem value="manager2">Jane Gold (jane@example.com)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon">
                <UserX className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            • Disabled state when no permission
            • Loading state when assigning manager
            • Normal state when ready to assign
            • Remove button shows loading when removing
          </div>
        </CardContent>
      </Card>

      {/* Manager Removal Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Manager Removal Loading States</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select disabled>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Removing..." />
                </SelectTrigger>
              </Select>
              <Button variant="ghost" size="icon" disabled title="Removing manager...">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="John Manager (john@example.com)" />
                </SelectTrigger>
              </Select>
              <Button variant="ghost" size="icon" title="Remove manager">
                <UserX className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            • Loading state when removing manager
            • Disabled controls during removal
            • Normal state when ready to remove
          </div>
        </CardContent>
      </Card>

      {/* Loading States Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Role Assignment</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Button disabled when no role selected</li>
                <li>• Spinner animation during assignment</li>
                <li>• "Assigning..." text feedback</li>
                <li>• Prevents multiple simultaneous assignments</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Role Removal</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Hover to reveal remove button</li>
                <li>• Spinner animation during removal</li>
                <li>• Disabled state during removal</li>
                <li>• Prevents multiple simultaneous removals</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Manager Assignment</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Select disabled during assignment</li>
                <li>• "Assigning..." placeholder text</li>
                <li>• All controls disabled during operation</li>
                <li>• Clear visual feedback</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Manager Removal</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Select disabled during removal</li>
                <li>• "Removing..." placeholder text</li>
                <li>• Spinner in remove button</li>
                <li>• Tooltip shows current action</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
