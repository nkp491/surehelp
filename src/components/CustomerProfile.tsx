import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormSubmission } from '@/types/form';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuditTrail from './submissions/AuditTrail';

interface CustomerProfileProps {
  customer: FormSubmission;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerProfile = ({ customer, isOpen, onClose }: CustomerProfileProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Customer Profile - {customer.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {customer.name}</p>
                      <p><strong>DOB:</strong> {customer.dob}</p>
                      <p><strong>Age:</strong> {customer.age}</p>
                      <p><strong>Height:</strong> {customer.height}</p>
                      <p><strong>Weight:</strong> {customer.weight}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <p><strong>Phone:</strong> {customer.phone}</p>
                      <p><strong>Email:</strong> {customer.email}</p>
                      <p><strong>Address:</strong> {customer.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Medical Information</h3>
                  <div className="space-y-2">
                    <p><strong>Tobacco Use:</strong> {customer.tobaccoUse}</p>
                    <p><strong>Medical Conditions:</strong> {customer.medicalConditions}</p>
                    <p><strong>Hospitalizations:</strong> {customer.hospitalizations}</p>
                    <p><strong>Surgeries:</strong> {customer.surgeries}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Financial Information</h3>
                  <div className="space-y-2">
                    <p><strong>Employment Status:</strong> {customer.employmentStatus.join(', ')}</p>
                    <p><strong>Occupation:</strong> {customer.occupation}</p>
                    <p><strong>Total Income:</strong> {customer.totalIncome}</p>
                    <p><strong>Expenses:</strong> {customer.expenses}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Policy Information</h3>
                  <div className="space-y-2">
                    <p><strong>Coverage Amount:</strong> {customer.coverageAmount}</p>
                    <p><strong>Premium:</strong> {customer.premium}</p>
                    <p><strong>Carrier & Product:</strong> {customer.carrierAndProduct}</p>
                    <p><strong>Policy Number:</strong> {customer.policyNumber}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="audit">
            <AuditTrail entries={customer.auditTrail || []} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerProfile;