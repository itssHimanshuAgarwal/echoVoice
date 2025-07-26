import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { User, UserPlus, Heart, Users, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Person, useEchoVoice } from "@/hooks/useEchoVoice";

interface PersonSelectorProps {
  onPersonSelect: (person: Person | null) => void;
  selectedPerson: Person | null;
}

export const PersonSelector = ({ onPersonSelect, selectedPerson }: PersonSelectorProps) => {
  const { people, addPerson } = useEchoVoice();
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: "",
    relationship: "family",
    nickname: "",
    communication_style: "balanced" as 'formal' | 'balanced' | 'casual',
    is_emergency_contact: false,
    phone: "",
    email: "",
    notes: "",
    times_interacted: 0,
  });

  const handleAddPerson = async () => {
    if (!newPerson.name.trim()) return;
    
    const person = await addPerson(newPerson);
    if (person) {
      setIsAddingPerson(false);
      setNewPerson({
        name: "",
        relationship: "family",
        nickname: "",
        communication_style: "balanced",
        is_emergency_contact: false,
        phone: "",
        email: "",
        notes: "",
        times_interacted: 0,
      });
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'family': return <Heart className="h-4 w-4" />;
      case 'caregiver': return <Users className="h-4 w-4" />;
      case 'doctor':
      case 'nurse': return <Stethoscope className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'family': return 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300';
      case 'caregiver': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'doctor':
      case 'nurse': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">Who's Here?</CardTitle>
          <Dialog open={isAddingPerson} onOpenChange={setIsAddingPerson}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Person</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newPerson.name}
                    onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select
                    value={newPerson.relationship}
                    onValueChange={(value) => setNewPerson(prev => ({ ...prev, relationship: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family Member</SelectItem>
                      <SelectItem value="caregiver">Caregiver</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nickname">Nickname (Optional)</Label>
                  <Input
                    id="nickname"
                    value={newPerson.nickname}
                    onChange={(e) => setNewPerson(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="How you'd like to address them"
                  />
                </div>

                <div>
                  <Label htmlFor="communication_style">Communication Style</Label>
                  <Select
                    value={newPerson.communication_style}
                    onValueChange={(value: 'formal' | 'balanced' | 'casual') => 
                      setNewPerson(prev => ({ ...prev, communication_style: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="emergency"
                    checked={newPerson.is_emergency_contact}
                    onCheckedChange={(checked) => 
                      setNewPerson(prev => ({ ...prev, is_emergency_contact: checked }))
                    }
                  />
                  <Label htmlFor="emergency">Emergency Contact</Label>
                </div>

                {newPerson.is_emergency_contact && (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newPerson.phone}
                        onChange={(e) => setNewPerson(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={newPerson.email}
                        onChange={(e) => setNewPerson(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Email address"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newPerson.notes}
                    onChange={(e) => setNewPerson(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special notes about communication preferences"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddPerson} className="flex-1">
                    Add Person
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingPerson(false)}>
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
          {/* No one selected option */}
          <div
            className={cn(
              "flex items-center p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
              !selectedPerson && "ring-2 ring-primary border-primary bg-primary/5"
            )}
            onClick={() => onPersonSelect(null)}
          >
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">No one specifically</div>
              <div className="text-sm text-muted-foreground">General communication</div>
            </div>
          </div>

          {/* People list */}
          {people.map((person) => (
            <div
              key={person.id}
              className={cn(
                "flex items-center p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                selectedPerson?.id === person.id && "ring-2 ring-primary border-primary bg-primary/5"
              )}
              onClick={() => onPersonSelect(person)}
            >
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback>
                  {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium truncate">
                    {person.nickname || person.name}
                  </div>
                  {person.is_emergency_contact && (
                    <Badge variant="destructive" className="text-xs">Emergency</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getRelationshipColor(person.relationship))}>
                    {getRelationshipIcon(person.relationship)}
                    <span className="ml-1">{person.relationship}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {person.communication_style}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {people.length === 0 && (
            <div className="text-center text-muted-foreground py-6">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No people added yet</p>
              <p className="text-sm">Add family, caregivers, or friends for personalized suggestions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};