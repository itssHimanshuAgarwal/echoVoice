import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Phone, MessageSquare, Clock } from "lucide-react";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerType: "rapid-tap" | "long-press";
}

const EmergencyModal = ({ isOpen, onClose, triggerType }: EmergencyModalProps) => {
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(10);
  const [isAutoSending, setIsAutoSending] = useState(false);

  // Auto-send countdown for accessibility
  useEffect(() => {
    if (isOpen && !isAutoSending) {
      setCountdown(10);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsAutoSending(true);
            handleSendAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleSendAlert = () => {
    // Simulate emergency alert
    setIsAutoSending(false);
    
    // Visual feedback - flash screen red
    document.body.style.backgroundColor = '#dc2626';
    setTimeout(() => {
      document.body.style.backgroundColor = '';
    }, 2000);

    // Show success toast
    toast({
      title: "🚨 Emergency Alert Sent!",
      description: "Your emergency contacts have been notified. Help is on the way.",
      duration: 5000,
    });

    // In a real app, this would:
    // - Send SMS to emergency contacts
    // - Call emergency services if configured
    // - Send location data
    // - Log the emergency event

    onClose();
  };

  const handleCancel = () => {
    setIsAutoSending(false);
    setCountdown(10);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent className="max-w-md mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl text-destructive">
            <AlertTriangle className="h-6 w-6" />
            Emergency Alert
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="text-base">
              Emergency help triggered by {triggerType === "rapid-tap" ? "rapid tapping" : "long press"}.
            </div>
            
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="text-sm font-medium">This will:</div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Notify emergency contacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Send your current location</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Log emergency event</span>
                </div>
              </div>
            </div>

            {countdown > 0 && (
              <div className="bg-warning/10 border border-warning p-3 rounded-lg text-center">
                <div className="text-warning font-medium">
                  Auto-sending in {countdown} seconds
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  (Cancel below to stop)
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col gap-3 sm:flex-row">
          <AlertDialogCancel 
            asChild
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </AlertDialogCancel>
          
          <AlertDialogAction 
            asChild
            onClick={handleSendAlert}
            className="w-full sm:w-auto"
          >
            <Button variant="destructive" size="lg">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Send Alert Now
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EmergencyModal;