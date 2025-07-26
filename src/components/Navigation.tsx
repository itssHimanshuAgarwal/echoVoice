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
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with app name */}
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-primary">EchoVoice</h1>
          <div className="text-sm text-muted-foreground">
            Communication Assistant
          </div>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex space-x-1 pb-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex-1 flex flex-col items-center py-3 px-4 rounded-lg transition-colors",
                  "min-h-[60px] text-sm font-medium",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
            >
              <Icon className="h-5 w-5 mb-1" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;