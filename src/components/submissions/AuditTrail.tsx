import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuditEntry } from '@/types/form';
import { format } from 'date-fns';

interface AuditTrailProps {
  entries: AuditEntry[];
}

const AuditTrail = ({ entries }: AuditTrailProps) => {
  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="border-b pb-4 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm:ss')}
              </span>
              <span className="text-sm font-medium capitalize px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {entry.action.replace('_', ' ')}
              </span>
            </div>
            <div className="space-y-2">
              {entry.changedFields.map((field) => (
                <div key={field} className="text-sm">
                  <span className="font-medium">{field}:</span>
                  <div className="grid grid-cols-2 gap-4 mt-1 ml-4">
                    <div className="text-red-600">
                      - {JSON.stringify(entry.previousValues[field])}
                    </div>
                    <div className="text-green-600">
                      + {JSON.stringify(entry.newValues[field])}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center text-gray-500">
            No changes recorded
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default AuditTrail;