import { Home, History, Settings, User, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { user, signOut } = useAuth();
  
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/history", icon: History, label: "History" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header with app name and user profile */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary font-display">EchoVoice</h1>
            <div className="text-sm text-muted-foreground font-medium">
              Communication Assistant
            </div>
          </div>
          
          {/* User Profile Section */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Navigation tabs */}
        <div className="flex space-x-2 pb-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex-1 flex flex-col items-center py-4 px-5 rounded-xl transition-[var(--transition-gentle)]",
                  "min-h-[64px] text-sm font-medium",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-gentle)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10 hover:scale-[1.02]"
                )
              }
            >
              <Icon className="h-5 w-5 mb-2" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;