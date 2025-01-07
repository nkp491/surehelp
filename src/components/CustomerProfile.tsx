import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormSubmission } from "@/types/form";
import { Card, CardContent } from "@/components/ui/card";

interface CustomerProfileProps {
  customer: FormSubmission;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerProfile = ({ customer, isOpen, onClose }: CustomerProfileProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Profile</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Personal Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {customer.name}</p>
                <p><span className="font-medium">DOB:</span> {customer.dob}</p>
                <p><span className="font-medium">Age:</span> {customer.age}</p>
                <p><span className="font-medium">Height:</span> {customer.height}</p>
                <p><span className="font-medium">Weight:</span> {customer.weight}</p>
                <p><span className="font-medium">Tobacco Use:</span> {customer.tobaccoUse}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Medical Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Medical Conditions:</span> {Array.isArray(customer.selectedConditions) ? customer.selectedConditions.join(", ") : customer.selectedConditions}</p>
                <p><span className="font-medium">Other Conditions:</span> {customer.medicalConditions}</p>
                <p><span className="font-medium">Hospitalizations:</span> {customer.hospitalizations}</p>
                <p><span className="font-medium">Surgeries:</span> {customer.surgeries}</p>
                <p><span className="font-medium">Medications:</span> {customer.prescriptionMedications}</p>
                <p><span className="font-medium">Last Medical Exam:</span> {customer.lastMedicalExam}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Financial Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Employment:</span> {Array.isArray(customer.employmentStatus) ? customer.employmentStatus.join(", ") : customer.employmentStatus}</p>
                <p><span className="font-medium">Occupation:</span> {customer.occupation}</p>
                <p><span className="font-medium">Total Income:</span> {customer.totalIncome}</p>
                <p><span className="font-medium">Expenses:</span> {customer.expenses}</p>
                <p><span className="font-medium">Life Insurance Amount:</span> {customer.lifeInsuranceAmount}</p>
                <p><span className="font-medium">Home Value:</span> {customer.homeValue}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Phone:</span> {customer.phone}</p>
                <p><span className="font-medium">Email:</span> {customer.email}</p>
                <p><span className="font-medium">Address:</span> {customer.address}</p>
                <p><span className="font-medium">Emergency Contact:</span> {customer.emergencyContact}</p>
                <p><span className="font-medium">Notes:</span> {customer.notes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerProfile;