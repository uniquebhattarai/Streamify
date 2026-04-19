import React, { useState, useEffect, useRef } from "react";
import {
  MdNotifications,
  MdSearch,
  MdMenu,
  MdKeyboardArrowDown,
  MdLogout,
  MdPerson,
  MdHelpOutline,
  MdSettings,
  MdAccessTime,
  MdDeleteOutline,
  MdPersonAdd,
  MdEdit,
} from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GoGitCommit } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import logo from "/streamify.png"

export type Activity = {
  id: string;
  type: string;
  unread: boolean;
  timestamp: string;
  title?: string;
  description?: string;
  user?: string;
  videoId?: string;
  metadata?: Record<string, any>;
};

export type NavbarProps = {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
    channelName?: string;
  };
  activities?: Activity[];
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  onDeleteActivity?: (id: string) => void;
  onActivityClick?: (activity: Activity) => void;
  onLogout?: () => void;
};


const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const t = new Date(timestamp);
  const diffMs = now.getTime() - t.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return t.toLocaleDateString();
};

const getActivityIcon = (type: string) => {
  if (type.includes("upload") || type.includes("created"))
    return { Icon: MdPersonAdd, color: "text-green-500" };
  if (type.includes("updated") || type.includes("edited"))
    return { Icon: MdEdit, color: "text-blue-500" };
  if (type.includes("deleted") || type.includes("removed"))
    return { Icon: MdDeleteOutline, color: "text-red-500" };
  return { Icon: GoGitCommit, color: "text-gray-500" };
};

const Navbar: React.FC<NavbarProps> = ({
  onMenuToggle,
  sidebarOpen,
  user,
  activities = [],
  onMarkAllRead,
  onClearAll,
  onDeleteActivity,
  onActivityClick,
  onLogout,
}) => {
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node))
        setNotificationOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = activities.filter((a) => a.unread).length;

  const groupedActivities = activities.reduce(
    (groups: Record<string, Activity[]>, activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
      return groups;
    },
    {}
  );

  // ── Notification Dropdown ──────────────────────────────────────────────────
  const renderNotificationDropdown = () => (
    <div className="absolute right-0 mt-3 w-[420px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5">
      <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <MdNotifications size={18} className="text-primary-dark" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <span className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full font-bold shadow-sm">
              {unreadCount} New
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600">Stay updated with your channel activity</p>
      </div>

      <div className="max-h-[32rem] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MdNotifications size={32} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No notifications yet</p>
            <p className="text-xs text-gray-500">When you get notifications, they'll show up here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date}>
                <div className="w-full px-5 py-2 bg-gray-50/80 sticky top-0 z-10">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{date}</p>
                </div>

                {dateActivities.map((activity) => {
                  const { Icon, color } = getActivityIcon(activity.type);
                  const relativeTime = getRelativeTime(activity.timestamp);
                  const fullTime = new Date(activity.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={activity.id}
                      className={`relative px-5 py-4 hover:bg-gray-50 transition-all cursor-pointer group ${
                        activity.unread ? "bg-red-50/40" : ""
                      }`}
                    >
                      {activity.unread && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                      {onDeleteActivity && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this notification?")) onDeleteActivity(activity.id);
                          }}
                          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white border border-gray-200 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                          title="Delete notification"
                        >
                          <MdDeleteOutline size={14} className="text-gray-500 hover:text-red-600" />
                        </button>
                      )}

                      <div
                        className="flex gap-3"
                        onClick={() => onActivityClick?.(activity)}
                      >
                        <div className="p-2.5 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Icon size={16} className={color} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1">
                              <p
                                className={`text-sm font-semibold leading-tight ${
                                  activity.unread ? "text-gray-900" : "text-gray-700"
                                }`}
                              >
                                {activity.title ?? activity.type}
                              </p>
                              {activity.description && (
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                              {fullTime}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-2">
                            {activity.user && (
                              <div className="flex items-center gap-1">
                                <MdPerson size={10} className="text-gray-400" />
                                <span className="text-[10px] text-gray-500 font-medium">
                                  {activity.user}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <MdAccessTime size={10} className="text-gray-400" />
                              <span className="text-[10px] text-gray-500 font-medium">
                                {relativeTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      {activities.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onMarkAllRead?.(); }}
            disabled={unreadCount === 0}
            className="flex-1 py-2.5 text-xs text-gray-700 hover:text-gray-900 font-semibold hover:bg-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300"
          >
            Mark all read
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Clear all notification history?")) onClearAll?.();
            }}
            className="flex-1 py-2.5 text-xs text-red-600 hover:text-red-700 font-semibold hover:bg-red-50 rounded-lg transition-all border border-red-200 hover:border-red-300"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex-shrink-0 z-50 px-4 sm:px-6 flex items-center justify-between shadow-sm relative">
      <div className="flex items-center gap-3">
        <button
          id="navbar-menu-toggle"
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <MdMenu size={22} />
        </button>

        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
            <img src={logo} alt="streamify logo" className=" h-10" loading="lazy" />
        </div>
      </div>


      {/* search Bar */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={searchRef}>
        <div className="relative w-full group">
          <input
            id="navbar-search"
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search videos, channels..."
            className="block w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-full bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-100 focus:bg-white focus:border-red-300 transition-all duration-200 shadow-sm"
          />
          <button
            id="navbar-search-btn"
            className="absolute inset-y-0 right-0 px-4 flex items-center bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-200 rounded-r-full transition-colors"
          >
            <MdSearch size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Search dropdown placeholder */}
        {searchOpen && searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5">
            <div className="p-4 text-center text-sm text-gray-500">
              <AiOutlineLoading3Quarters size={16} className="animate-spin inline mr-2 text-red-500" />
              Searching for "<strong>{searchQuery}</strong>"…
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Date/Time + Notifications + Profile ── */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Date / Time */}
        <div className="hidden lg:flex flex-col items-end mr-2">
          <p className="text-sm font-bold text-gray-700">
            {currentTime.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs font-semibold  text-primary-dark flex items-center gap-1">
            <MdAccessTime className="w-3 h-3"/> {currentTime.toLocaleTimeString()}
          </p>
        </div>

        <div className="h-8 w-[1px] bg-gray-200 hidden sm:block" />

        {/* Notification bell */}
        <div className="relative" ref={notificationRef}>
          <button
            id="navbar-notifications-btn"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={`p-2.5 rounded-xl transition-all relative ${
              notificationOpen
                ? " text-primary-dark"
                : "text-gray-500  hover:text-gray-700"
            }`}
          >
            <MdNotifications  className="w-5 h-5" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1.5 right-2 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500 animate-pulse" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-lg">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </>
            )}
          </button>
          {notificationOpen && renderNotificationDropdown()}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            id="navbar-profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-red-500 to-orange-400 p-[2px]">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name ?? "User"}`}
                    alt="User"
                    className="h-full w-full rounded-full"
                  />
                )}
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-gray-700 leading-none mb-0.5">
                {user?.name ?? "Guest User"}
              </p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                {user?.channelName ?? "My Channel"}
              </p>
            </div>
            <MdKeyboardArrowDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 ring-1 ring-black/5">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-900">{user?.name ?? "Guest"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>
              </div>
              <button
                id="navbar-profile-link"
                onClick={() => { navigate("/profile"); setProfileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                <MdPerson size={16} /> My Profile
              </button>
              <button
                id="navbar-settings-link"
                onClick={() => { navigate("/settings"); setProfileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                <MdSettings size={16} /> Settings
              </button>
              <button
                id="navbar-help-link"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                <MdHelpOutline size={16} /> Help & Support
              </button>
              <div className="my-1 border-t border-gray-50" />
              <button
                id="navbar-logout-btn"
                onClick={() => { onLogout?.(); setProfileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <MdLogout size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;