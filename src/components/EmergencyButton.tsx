import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import EmergencyModal from "./EmergencyModal";

interface EmergencyButtonProps {
  onEmergencyActivated?: (message: string) => void;
  userLocation?: string;
  userName?: string;
}

const EmergencyButton = ({ onEmergencyActivated, userLocation, userName }: EmergencyButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tapResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressStartTime = useRef<number>(0);

  const LONG_PRESS_DURATION = 5000; // 5 seconds
  const RAPID_TAP_COUNT = 3;
  const TAP_RESET_DELAY = 2000; // Reset tap count after 2 seconds

  const handleMouseDown = useCallback(() => {
    longPressStartTime.current = Date.now();
    setIsLongPress(false);
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPress(true);
      setShowModal(true);
    }, LONG_PRESS_DURATION);
  }, []);

  const handleMouseUp = useCallback(() => {
    const pressDuration = Date.now() - longPressStartTime.current;
    
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If it wasn't a long press, handle as tap
    if (pressDuration < LONG_PRESS_DURATION && !isLongPress) {
      setTapCount(prevCount => {
        const newCount = prevCount + 1;
        
        // Clear existing tap reset timer
        if (tapResetTimerRef.current) {
          clearTimeout(tapResetTimerRef.current);
        }
        
        // Check for rapid taps
        if (newCount >= RAPID_TAP_COUNT) {
          setShowModal(true);
          return 0; // Reset tap count
        }
        
        // Set timer to reset tap count
        tapResetTimerRef.current = setTimeout(() => {
          setTapCount(0);
        }, TAP_RESET_DELAY);
        
        return newCount;
      });
    }
    
    setIsLongPress(false);
  }, [isLongPress]);

  const handleMouseLeave = useCallback(() => {
    // Cancel long press if mouse leaves button
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPress(false);
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    handleMouseDown();
  }, [handleMouseDown]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  }, [handleMouseUp]);

  const handleTouchCancel = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseLeave();
  }, [handleMouseLeave]);

  return (
    <>
      {/* Emergency Button - Always visible in bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="destructive"
          size="lg"
          className={cn(
            "h-16 w-16 rounded-full shadow-lg transition-[var(--transition-gentle)]",
            "hover:scale-110 active:scale-95",
            "focus:ring-4 focus:ring-destructive/50",
            !isLongPress && "animate-emergency-pulse",
            isLongPress && "animate-soft-pulse bg-warning scale-110"
          )}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          aria-label="Emergency help button - tap 3 times quickly or hold for 5 seconds"
        >
          <AlertTriangle className="h-8 w-8" />
        </Button>
        
        {/* Tap indicator with gentle animation */}
        {tapCount > 0 && (
          <div className="absolute -top-2 -right-2 h-6 w-6 bg-warning text-warning-foreground rounded-full flex items-center justify-center text-xs font-bold animate-gentle-bounce">
            {tapCount}
          </div>
        )}
        
        {/* Long press progress indicator */}
        {isLongPress && (
          <div className="absolute inset-0 rounded-full border-4 border-warning animate-soft-pulse" />
        )}
      </div>

      {/* Emergency Modal */}
      <EmergencyModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        triggerType={isLongPress ? "long-press" : "rapid-tap"}
        onEmergencyActivated={onEmergencyActivated}
        userLocation={userLocation}
        userName={userName}
      />
    </>
  );
};

export default EmergencyButton;