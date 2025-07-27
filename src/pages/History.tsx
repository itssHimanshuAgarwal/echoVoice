import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Volume2, Clock, Trash2, Heart, ArrowLeft, MapPin, User, MoreVertical, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePhraseHistory, PhraseHistoryItem } from "@/hooks/usePhraseHistory";

const History = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const { history, removeItem } = usePhraseHistory();

  // Redirect to auth if not authenticated
  if (!loading && !user) {
    navigate('/auth');
    return null;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSpeakPhrase = (phrase: string) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = 0.8;
        utterance.volume = 0.9;
        speechSynthesis.speak(utterance);
        
        toast({
          title: "Speaking phrase",
          description: phrase,
        });
      } else {
        toast({
          title: "Text ready",
          description: phrase,
        });
      }
    } catch (error) {
      toast({
        title: "Text ready",
        description: phrase,
      });
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const item = history.find(item => item.id === id);
      if (!item || !user) return;

      const { error } = await supabase
        .from('favorite_phrases')
        .upsert({
          user_id: user.id,
          phrase: item.phrase,
          category: item.phraseType || 'custom',
          times_used: 1,
        });

      if (error) throw error;

      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
          toast({
            title: "Removed from favorites",
            description: "Phrase unfavorited",
          });
        } else {
          newSet.add(id);
          toast({
            title: "Added to favorites",
            description: "Phrase saved for quick access",
          });
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Could not update favorite",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medical": return "bg-destructive/10 text-destructive border-destructive/20";
      case "social": return "bg-success/10 text-success border-success/20"; 
      case "personal": return "bg-accent/10 text-accent border-accent/20";
      case "request": return "bg-warning/10 text-warning border-warning/20";
      case "greeting": return "bg-primary/10 text-primary border-primary/20";
      case "custom": return "bg-secondary/10 text-secondary border-secondary/20";
      case "suggestion": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const groupByDate = (items: PhraseHistoryItem[]) => {
    const groups: { [key: string]: PhraseHistoryItem[] } = {};
    
    items.forEach(item => {
      const date = item.timestamp.toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    
    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  };

  const groupedItems = groupByDate(history);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Communication History</h1>
          <p className="text-muted-foreground">Timeline of your phrases and messages</p>
        </div>
        
        <Button variant="outline" size="sm">
          <MoreVertical className="h-4 w-4 mr-2" />
          Options
        </Button>
      </div>

      {/* Timeline View */}
      <div className="space-y-6">
        {groupedItems.map(([date, items]) => (
          <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center gap-3 py-2 border-b border-border">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-lg">
                {new Date(date).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <Badge variant="secondary" className="ml-auto">
                {items.length} phrase{items.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Timeline Items */}
            <div className="space-y-3 pl-6 border-l-2 border-muted relative">
              {items.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[1.75rem] top-4 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Phrase and controls */}
                          <div className="flex items-start gap-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-2 h-10 w-10 flex-shrink-0"
                              onClick={() => handleSpeakPhrase(item.phrase)}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex-1">
                              <div className="font-medium text-base leading-relaxed mb-2">
                                {item.phrase}
                              </div>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={getCategoryColor(item.phraseType || 'custom')}>
                                  {item.phraseType || 'custom'}
                                </Badge>
                                {item.emotion && (
                                  <Badge variant="secondary">
                                    {item.emotion}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn(
                                "p-2 h-10 w-10",
                                favoriteIds.has(item.id) 
                                  ? "text-destructive hover:text-destructive" 
                                  : "text-muted-foreground"
                              )}
                              onClick={() => toggleFavorite(item.id)}
                            >
                              <Heart className={cn(
                                "h-4 w-4",
                                favoriteIds.has(item.id) && "fill-current"
                              )} />
                            </Button>
                          </div>

                          {/* Context Information */}
                          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                              Context Details
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{formatRelativeTime(item.timestamp)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{item.location || 'Unknown location'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{item.person || 'No person specified'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1 h-8 w-8 text-muted-foreground flex-shrink-0"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {history.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No history yet</h3>
              <p>Your spoken phrases will appear here</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/")}
              >
                Start Communicating
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default History;
