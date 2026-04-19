import React, { useState } from "react";
import Navbar, { type Activity } from "./Navbar";
import Sidebar from "./Sidebar";


type RootLayoutProps = {
  children?: React.ReactNode;
  hideSidebar?: boolean;
};

const RootLayout: React.FC<RootLayoutProps> = ({
  children,
  hideSidebar = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return false;
    const saved = localStorage.getItem("yt_sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("yt_sidebarOpen", JSON.stringify(next));
      return next;
    });
  };

  const [activities, setActivities] = useState<Activity[]>([]);

  const handleMarkAllRead = () =>
    setActivities((prev) => prev.map((a) => ({ ...a, unread: false })));

  const handleClearAll = () => setActivities([]);

  const handleDeleteActivity = (id: string) =>
    setActivities((prev) => prev.filter((a) => a.id !== id));

  const handleActivityClick = (activity: Activity) => {
    handleDeleteActivity(activity.id); // or mark read logic
  };

  const handleLogout = () => {
    console.log("Logging out…");
  };

  const mockUser = {
    name: "Alex Johnson",
    email: "alex@example.com",
    channelName: "AlexTech",
    avatarUrl: undefined, 
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      <Navbar
        onMenuToggle={toggleSidebar}
        sidebarOpen={sidebarOpen}
        user={mockUser}
        activities={activities}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
        onDeleteActivity={handleDeleteActivity}
        onActivityClick={handleActivityClick}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {!hideSidebar && (
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpen={() => setSidebarOpen(true)}
          />
        )}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F9F9F9] p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
