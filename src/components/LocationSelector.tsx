import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MapPin, Plus, Home, Building2, Car, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Location, useEchoVoice } from "@/hooks/useEchoVoice";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LocationSelectorProps {
  onLocationSelect: (location: Location | null) => void;
  selectedLocation: Location | null;
}

export const LocationSelector = ({ onLocationSelect, selectedLocation }: LocationSelectorProps) => {
  const { locations } = useEchoVoice();
  const { toast } = useToast();
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    location_type: "home",
    room_type: "",
    is_default: false,
    times_used: 0,
  });

  const handleAddLocation = async () => {
    if (!newLocation.name.trim()) return;
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('locations')
        .insert({ ...newLocation, user_id: user.user.id })
        .select()
        .single();

      if (error) throw error;
      
      setIsAddingLocation(false);
      setNewLocation({
        name: "",
        location_type: "home",
        room_type: "",
        is_default: false,
        times_used: 0,
      });
      
      toast({
        title: "Location Added",
        description: `${newLocation.name} has been added successfully`,
      });
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: "Error",
        description: "Could not add location",
        variant: "destructive",
      });
    }
  };

  const getLocationIcon = (locationType: string, roomType?: string) => {
    if (roomType) {
      switch (roomType) {
        case 'living_room':
        case 'bedroom':
        case 'kitchen':
        case 'bathroom': return <Home className="h-4 w-4" />;
        case 'garden': return <TreePine className="h-4 w-4" />;
        default: return <Home className="h-4 w-4" />;
      }
    }
    
    switch (locationType) {
      case 'home': return <Home className="h-4 w-4" />;
      case 'hospital': return <Building2 className="h-4 w-4" />;
      case 'vehicle': return <Car className="h-4 w-4" />;
      case 'outdoor': return <TreePine className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getLocationColor = (locationType: string) => {
    switch (locationType) {
      case 'home': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'hospital': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'vehicle': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'outdoor': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatLocationName = (location: Location) => {
    const typeLabels: Record<string, string> = {
      'living_room': 'Living Room',
      'bedroom': 'Bedroom', 
      'kitchen': 'Kitchen',
      'bathroom': 'Bathroom',
      'garden': 'Garden'
    };
    
    return typeLabels[location.room_type || ''] || location.name;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">Current Location</CardTitle>
          <Dialog open={isAddingLocation} onOpenChange={setIsAddingLocation}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location-name">Location Name *</Label>
                  <Input
                    id="location-name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Doctor's Office, Park, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="location-type">Type</Label>
                  <Select
                    value={newLocation.location_type}
                    onValueChange={(value) => setNewLocation(prev => ({ ...prev, location_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="hospital">Medical Facility</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="vehicle">Vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newLocation.location_type === 'home' && (
                  <div>
                    <Label htmlFor="room-type">Room Type (Optional)</Label>
                    <Select
                      value={newLocation.room_type}
                      onValueChange={(value) => setNewLocation(prev => ({ ...prev, room_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="living_room">Living Room</SelectItem>
                        <SelectItem value="bedroom">Bedroom</SelectItem>
                        <SelectItem value="kitchen">Kitchen</SelectItem>
                        <SelectItem value="bathroom">Bathroom</SelectItem>
                        <SelectItem value="garden">Garden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="default-location"
                    checked={newLocation.is_default}
                    onCheckedChange={(checked) => 
                      setNewLocation(prev => ({ ...prev, is_default: checked }))
                    }
                  />
                  <Label htmlFor="default-location">Set as default location</Label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddLocation} className="flex-1">
                    Add Location
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingLocation(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {locations.map((location) => (
            <div
              key={location.id}
              className={cn(
                "flex items-center p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                selectedLocation?.id === location.id && "ring-2 ring-primary border-primary bg-primary/5"
              )}
              onClick={() => onLocationSelect(location)}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted mr-3">
                {getLocationIcon(location.location_type, location.room_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium truncate">
                    {formatLocationName(location)}
                  </div>
                  {location.is_default && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getLocationColor(location.location_type))}>
                    {location.location_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Used {location.times_used} times
                  </span>
                </div>
              </div>
            </div>
          ))}

          {locations.length === 0 && (
            <div className="text-center text-muted-foreground py-6">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No locations added yet</p>
              <p className="text-sm">Add locations for context-specific suggestions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};