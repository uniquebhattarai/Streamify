import React, { useState, useEffect } from "react";
import {
  MdDashboard,
  MdHome,
  MdTrendingUp,
  MdSubscriptions,
  MdHistory,
  MdThumbUp,
  MdBookmark,
  MdKeyboardArrowDown,
  MdLocalFireDepartment,
  MdMusicNote,
  MdSportsEsports,
  MdNewspaper,
  MdEmojiEvents,
  MdLightbulb,
  MdSettings,
  MdHelpOutline,
  MdFlag,
  MdPhone,
  MdPersonAdd,
  MdVideoCall,
} from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

type SubmenuItem = {
  label: string;
  id: string;
  icon: React.ElementType;
  path: string;
  active?: boolean;
};

type MenuItem = {
  icon: React.ElementType;
  label: string;
  id: string;
  path?: string;
  active?: boolean;
  hasSubmenu?: boolean;
  submenu?: SubmenuItem[];
};

export type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
};

// ---------------------------------------------------------------------------
// Menu definitions
// ---------------------------------------------------------------------------
const mainMenuItems: MenuItem[] = [
  { icon: MdHome,          label: "Home",         id: "home",      path: "/" },
  { icon: MdTrendingUp,    label: "Trending",      id: "trending",  path: "/trending" },
  { icon: MdSubscriptions, label: "Subscriptions", id: "subs",      path: "/subscriptions" },
];


const bottomMenuItems: MenuItem[] = [
  { icon: MdSettings,    label: "Settings", id: "settings", path: "/settings" },
  { icon: MdHelpOutline, label: "Help",     id: "help",     path: "/help" },
  { icon: MdFlag,        label: "Report",   id: "report",   path: "/report" },
];


const useActiveItems = (items: MenuItem[], pathname: string) =>
  items.map((item) => {
    const selfActive = item.path
      ? (pathname.startsWith(item.path) && item.path !== "/") || pathname === item.path
      : false;
    const childActive = item.submenu?.some((s) => pathname.startsWith(s.path)) ?? false;
    return {
      ...item,
      active: selfActive || childActive,
      submenu: item.submenu?.map((s) => ({ ...s, active: pathname.startsWith(s.path) })),
    };
  });


const SidebarSection: React.FC<{
  title?: string;
  items: MenuItem[];
  open: boolean;
  expandedMenu: string | null;
  onExpandToggle: (id: string) => void;
  onNavigate: (path: string) => void;
  onOpenSidebar: () => void;
}> = ({ title, items, open, expandedMenu, onExpandToggle, onNavigate, onOpenSidebar }) => (
  <div>
    {title && open && (
      <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {title}
      </p>
    )}
    {!open && title && <div className="my-2 border-t border-gray-100" />}

    {items.map((item) => (
      <div key={item.id}>
        <button
          id={`sidebar-${item.id}`}
          onClick={() => {
            if (item.hasSubmenu) {
              onExpandToggle(item.id);
              if (!open) onOpenSidebar();
            } else if (item.path) {
              onNavigate(item.path);
            }
          }}
          title={!open ? item.label : undefined}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group my-0.5
            ${item.active ? "bg-red-50 text-primary-dark font-semibold" : "text-gray-700 hover:bg-gray-100"}
            ${!open ? "justify-center px-2" : ""}
          `}
        >
          <div className="flex items-center gap-3">
            <item.icon
              size={20}
              className={item.active ? "text-primary-dark" : "text-gray-500 group-hover:text-gray-900"}
            />
            {open && <span className="text-sm">{item.label}</span>}
          </div>

          {open && item.hasSubmenu && (
            <MdKeyboardArrowDown
              size={16}
              className={`transition-transform duration-200 text-gray-400 ${
                expandedMenu === item.id ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {/* Submenu */}
        {item.hasSubmenu && open && expandedMenu === item.id && (
          <div className="ml-3 mt-1 space-y-0.5 pl-6 border-l-2 border-gray-200">
            {item.submenu?.map((sub) => (
              <button
                key={sub.id}
                id={`sidebar-sub-${sub.id}`}
                onClick={() => onNavigate(sub.path)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                  ${sub.active
                    ? "text-primary-dark font-medium bg-red-50/50"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <sub.icon size={16} />
                <span className="text-start">{sub.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);


const Sidebar: React.FC<SidebarProps> = ({ open, onClose, onOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const activeMain    = useActiveItems(mainMenuItems,    location.pathname);
  const activeBottom  = useActiveItems(bottomMenuItems,  location.pathname);


  const handleNavigate = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) onClose();
  };

  const handleExpandToggle = (id: string) => {
    setExpandedMenu((prev) => (prev === id ? null : id));
  };

  const sharedSectionProps = {
    open,
    expandedMenu,
    onExpandToggle: handleExpandToggle,
    onNavigate: handleNavigate,
    onOpenSidebar: onOpen,
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          absolute inset-y-0 left-0 z-40 bg-white border-r border-gray-100
          transition-all duration-300 ease-in-out
          md:relative md:translate-x-0
          ${open ? "translate-x-0 w-60" : "-translate-x-full md:translate-x-0 md:w-[72px]"}
          flex flex-col shadow-sm
        `}
      >
        {/* Scrollable nav area */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-200">
          <SidebarSection title=""        items={activeMain}    {...sharedSectionProps} />
        </nav>

        {/* Bottom menu */}
        <div className="px-2 py-2 border-t border-gray-100 space-y-0.5">
          {activeBottom.map((item) => (
            <button
              key={item.id}
              id={`sidebar-bottom-${item.id}`}
              onClick={() => item.path && handleNavigate(item.path)}
              title={!open ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group my-0.5
                ${item.active ? "bg-red-50 text-primary-dark font-semibold" : "text-gray-700 hover:bg-gray-100"}
                ${!open ? "justify-center px-2" : ""}
              `}
            >
              <item.icon
                size={20}
                className={item.active ? "text-primary-dark" : "text-gray-500 group-hover:text-gray-900"}
              />
              {open && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Footer (expanded) */}
        {open && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <MdVideoCall size={20} className="text-primary-dark flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">Start creating</p>
                <p className="text-xs text-gray-400 truncate">Upload your first video</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer (collapsed) */}
        {!open && (
          <div className="p-3 border-t border-gray-200 flex justify-center">
            <button
              id="sidebar-upload-collapsed"
              onClick={() => { onOpen(); handleNavigate("/upload"); }}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-primary-dark transition-colors"
              title="Upload video"
            >
              <MdVideoCall size={20} className="text-primary-dark" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;