import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Heart, Save, Volume2, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEchoVoice } from "@/hooks/useEchoVoice";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomMessageInputProps {
  className?: string;
}

export const CustomMessageInput = ({ className }: CustomMessageInputProps) => {
  const { speakPhrase } = useEchoVoice();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [saveDetails, setSaveDetails] = useState({
    save: false,
    category: "general",
    isQuickAction: false,
  });
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const loadFavorites = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('favorite_phrases')
        .select('*')
        .eq('user_id', user.user.id)
        .order('times_used', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleSpeakCustomMessage = async () => {
    if (!customMessage.trim()) return;

    // Speak the message
    await speakPhrase(customMessage, 'custom');

    // Save to favorites if requested
    if (saveDetails.save) {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { error } = await supabase
          .from('favorite_phrases')
          .insert({
            user_id: user.user.id,
            phrase: customMessage,
            category: saveDetails.category,
            custom_created: true,
            is_quick_action: saveDetails.isQuickAction,
            times_used: 1,
          });

        if (error) throw error;

        toast({
          title: "Message Saved",
          description: "Your custom message has been saved to favorites",
        });
      } catch (error) {
        console.error('Error saving custom message:', error);
      }
    }

    // Clear input
    setCustomMessage("");
    setSaveDetails({
      save: false,
      category: "general",
      isQuickAction: false,
    });
    setIsDialogOpen(false);
  };

  const handleSpeakFavorite = async (phrase: string, phraseId: string) => {
    await speakPhrase(phrase, 'favorite');

    // Update usage count
    try {
      const { error } = await supabase
        .from('favorite_phrases')
        .update({ times_used: favorites.find(f => f.id === phraseId)?.times_used + 1 })
        .eq('id', phraseId);

      if (error) throw error;
      loadFavorites(); // Refresh the list
    } catch (error) {
      console.error('Error updating favorite usage:', error);
    }
  };

  const removeFavorite = async (phraseId: string) => {
    try {
      const { error } = await supabase
        .from('favorite_phrases')
        .delete()
        .eq('id', phraseId);

      if (error) throw error;
      setFavorites(favorites.filter(f => f.id !== phraseId));
      
      toast({
        title: "Removed",
        description: "Phrase removed from favorites",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Custom Message Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Custom Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your message here..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSpeakCustomMessage();
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={handleSpeakCustomMessage}
              disabled={!customMessage.trim()}
              size="lg"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Speak
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Custom Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="custom-message">Your Message</Label>
                    <Textarea
                      id="custom-message"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Type your custom message here..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="save-message"
                      checked={saveDetails.save}
                      onCheckedChange={(checked) => 
                        setSaveDetails(prev => ({ ...prev, save: checked }))
                      }
                    />
                    <Label htmlFor="save-message">Save to favorites</Label>
                  </div>

                  {saveDetails.save && (
                    <>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={saveDetails.category}
                          onValueChange={(value) => 
                            setSaveDetails(prev => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="medical">Medical</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="needs">Needs</SelectItem>
                            <SelectItem value="emotions">Emotions</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="quick-action"
                          checked={saveDetails.isQuickAction}
                          onCheckedChange={(checked) => 
                            setSaveDetails(prev => ({ ...prev, isQuickAction: checked }))
                          }
                        />
                        <Label htmlFor="quick-action">Add as quick action button</Label>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handleSpeakCustomMessage}
                      disabled={!customMessage.trim()}
                      className="flex-1"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Speak & Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display">Your Favorite Phrases</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowFavorites(!showFavorites);
                if (!showFavorites) loadFavorites();
              }}
            >
              <Heart className="h-4 w-4 mr-2" />
              {showFavorites ? 'Hide' : 'Show'} Favorites
            </Button>
          </div>
        </CardHeader>
        {showFavorites && (
          <CardContent>
            {favorites.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No favorite phrases yet</p>
                <p className="text-sm">Save custom messages to quickly access them later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{favorite.phrase}</p>
                        {favorite.is_quick_action && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Quick Action
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {favorite.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Used {favorite.times_used} times
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSpeakFavorite(favorite.phrase, favorite.id)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFavorite(favorite.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};