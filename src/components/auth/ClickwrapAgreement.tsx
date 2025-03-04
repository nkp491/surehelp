
import { useState, useRef, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ClickwrapAgreementProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (termsData: {
    accepted: boolean;
    timestamp: string;
    version: string;
  }) => void;
}

// Current version of terms - increment this when terms are updated
const TERMS_VERSION = "1.0";

const ClickwrapAgreement = ({ isOpen, onClose, onAccept }: ClickwrapAgreementProps) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasCheckedAgreement, setHasCheckedAgreement] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Reset state when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setHasCheckedAgreement(false);
    }
  }, [isOpen]);

  // Detect when user has scrolled to the bottom
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    // Consider scrolled to bottom when within 20px of the bottom
    const isBottom = scrollTop + clientHeight >= scrollHeight - 20;
    
    if (isBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (hasCheckedAgreement) {
      onAccept({
        accepted: true,
        timestamp: new Date().toISOString(),
        version: TERMS_VERSION
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read our Terms and Conditions carefully before accepting.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 my-4 min-h-[40vh]">
          <ScrollArea 
            ref={scrollAreaRef} 
            onScroll={handleScroll} 
            className="h-[50vh] pr-4"
          >
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
                <p>
                  These Terms of Service ("Terms") govern your access to and use of our 
                  services, including our website, mobile applications, and any other software or 
                  services offered by us in connection with any of the foregoing (the "Services").
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">2. Acceptance of Terms</h3>
                <p>
                  By accessing or using our Services, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms. If you do not agree to these Terms, 
                  you may not access or use the Services.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">3. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these Terms at any time. If we make changes, 
                  we will provide notice of such changes, such as by sending an email notification, 
                  providing notice through the Services, or updating the "Last Updated" date at the 
                  beginning of these Terms. Your continued use of the Services following notification 
                  of changes will indicate your acceptance of such changes.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">4. Privacy Policy</h3>
                <p>
                  Please refer to our Privacy Policy for information about how we collect, use, 
                  and disclose information about you. By using our Services, you also agree to our 
                  Privacy Policy.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">5. Account Registration</h3>
                <p>
                  To access certain features of the Services, you may be required to create an account. 
                  When you register for an account, you agree to provide accurate, current, and complete 
                  information and to update such information to keep it accurate, current, and complete.
                </p>
                <p className="mt-2">
                  You are solely responsible for safeguarding your account credentials and for all 
                  activity that occurs on your account. You agree to notify us immediately if you suspect 
                  any unauthorized access to or use of your account.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">6. Termination</h3>
                <p>
                  We reserve the right to suspend or terminate your access to the Services at any time, 
                  with or without cause, and with or without notice.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">7. Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted by law, in no event shall the company be liable for any 
                  indirect, punitive, incidental, special, consequential damages, or any damages whatsoever 
                  including, without limitation, damages for loss of use, data, or profits, arising out of 
                  or in any way connected with the use or performance of the services.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">8. Governing Law</h3>
                <p>
                  These Terms shall be governed by the laws of the jurisdiction in which the company is 
                  located, without regard to its conflict of law principles.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">9. Contact Information</h3>
                <p>
                  For any questions about these Terms, please contact us at support@example.com.
                </p>
              </section>
            </div>
          </ScrollArea>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-start space-x-2 mb-4">
            <Checkbox 
              id="terms-agreement" 
              checked={hasCheckedAgreement}
              onCheckedChange={(checked) => setHasCheckedAgreement(checked as boolean)}
              disabled={!hasScrolledToBottom}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label 
                htmlFor="terms-agreement" 
                className={`text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700'}`}
              >
                I have read and agree to the Terms and Conditions
              </Label>
              {!hasScrolledToBottom && (
                <p className="text-xs text-amber-600">Please scroll to the bottom to enable this checkbox</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Decline
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={!hasCheckedAgreement || !hasScrolledToBottom}
          >
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClickwrapAgreement;
