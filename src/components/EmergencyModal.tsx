import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Phone, MessageSquare, Clock, MapPin, User, Loader2 } from "lucide-react";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerType: "rapid-tap" | "long-press";
  onEmergencyActivated?: (message: string) => void;
  userLocation?: string;
  userName?: string;
}

const EmergencyModal = ({ isOpen, onClose, triggerType, onEmergencyActivated, userLocation, userName }: EmergencyModalProps) => {
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(10);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{name: string, phone: string}>>([]);

  // Load emergency contacts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadEmergencyContacts();
    }
  }, [isOpen]);

  const loadEmergencyContacts = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('name, phone')
        .eq('user_id', user.user.id)
        .eq('is_primary', true);

      if (error) throw error;
      
      const contacts = data?.map(contact => ({
        name: contact.name,
        phone: contact.phone || ''
      })).filter(contact => contact.phone) || [];
      
      setEmergencyContacts(contacts);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

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

  const handleSendAlert = async () => {
    const emergencyMessage = "Help me please! This is an emergency!";
    
    // Trigger TTS and history callback immediately
    onEmergencyActivated?.(emergencyMessage);
    
    // Set states
    setIsAutoSending(false);
    setIsSendingSMS(true);
    
    // Visual feedback - flash screen red
    document.body.style.backgroundColor = '#dc2626';
    setTimeout(() => {
      document.body.style.backgroundColor = '';
    }, 2000);

    try {
      // Send SMS via Twilio edge function
      const { data, error } = await supabase.functions.invoke('emergency-sms', {
        body: {
          userLocation: userLocation || 'Location unknown',
          userName: userName || 'EchoVoice user',
          emergencyMessage,
          emergencyContacts: emergencyContacts.length > 0 ? emergencyContacts : undefined
        }
      });

      if (error) throw error;

      const successCount = data?.results?.filter((r: any) => r.success).length || 0;
      const totalContacts = data?.results?.length || 0;

      // Show success toast
      toast({
        title: "🚨 Emergency Alert Sent!",
        description: data?.success 
          ? `SMS alerts sent to ${successCount}/${totalContacts} emergency contacts. Help message spoken aloud and logged.`
          : "Help message spoken aloud and logged. SMS sending failed - please try again.",
        duration: 8000,
        variant: data?.success ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Emergency SMS error:', error);
      toast({
        title: "⚠️ Emergency Alert Partial",
        description: "Help message spoken aloud and logged. SMS sending failed - emergency contacts may not have been notified.",
        duration: 8000,
        variant: "destructive",
      });
    } finally {
      setIsSendingSMS(false);
      onClose();
    }
  };

  const handleCancel = () => {
    setIsAutoSending(false);
    setCountdown(10);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent className="max-w-md mx-auto animate-fade-in-up">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl text-destructive animate-fade-in-up"
            style={{ animationDelay: '100ms' }}>
            <AlertTriangle className="h-6 w-6" />
            Emergency Alert
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="text-base">
              Emergency help triggered by {triggerType === "rapid-tap" ? "rapid tapping" : "long press"}.
            </div>
            
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="text-sm font-medium">This will:</div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>
                    {emergencyContacts.length > 0 
                      ? `Send SMS to ${emergencyContacts.length} emergency contact${emergencyContacts.length !== 1 ? 's' : ''}` 
                      : 'Send test SMS (no emergency contacts configured)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Speak emergency message aloud</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Include your current location</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Include user information</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Log emergency event in history</span>
                </div>
              </div>
            </div>

            {isSendingSMS && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-center">
                <div className="text-blue-700 dark:text-blue-300 font-medium flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending SMS alerts...
                </div>
              </div>
            )}

            {countdown > 0 && (
              <div className="bg-warning/10 border border-warning p-3 rounded-lg text-center animate-soft-pulse"
                style={{ animationDelay: '300ms' }}>
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
        
        <AlertDialogFooter className="flex-col gap-3 sm:flex-row animate-fade-in-up" style={{ animationDelay: '400ms' }}>
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