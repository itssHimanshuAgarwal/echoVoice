import { Home, History, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/history", icon: History, label: "History" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header with app name */}
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-primary font-display">EchoVoice</h1>
          <div className="text-sm text-muted-foreground font-medium">
            Communication Assistant
          </div>
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