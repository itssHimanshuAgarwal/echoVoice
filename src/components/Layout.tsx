import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import EmergencyButton from "./EmergencyButton";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <EmergencyButton />
    </div>
  );
};

export default Layout;