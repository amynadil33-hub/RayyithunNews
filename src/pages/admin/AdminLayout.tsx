import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../hooks/use-admin-auth.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import {
  LayoutDashboardIcon, NewspaperIcon, TagIcon, ImageIcon,
  MonitorIcon, MicIcon, FileTextIcon, MailIcon, MegaphoneIcon,
  UsersIcon, SettingsIcon, SendIcon, LogOutIcon, ChevronRightIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboardIcon, label: "Dashboard", href: "/admin/dashboard" },
  { icon: NewspaperIcon, label: "Articles", href: "/admin/articles" },
  { icon: TagIcon, label: "Categories", href: "/admin/categories" },
  { icon: ImageIcon, label: "Media", href: "/admin/media" },
  { icon: MonitorIcon, label: "Advertisements", href: "/admin/advertisements" },
  { icon: MicIcon, label: "Podcasts", href: "/admin/podcasts" },
  { icon: FileTextIcon, label: "Pages", href: "/admin/pages" },
  { icon: MailIcon, label: "Contact Messages", href: "/admin/contact-messages" },
  { icon: MegaphoneIcon, label: "Advertiser Inquiries", href: "/admin/advertiser-inquiries" },
  { icon: SendIcon, label: "Newsletter", href: "/admin/newsletter" },
  { icon: UsersIcon, label: "Users", href: "/admin/users" },
  { icon: SettingsIcon, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout() {
  const { user, profile, isLoading, signOut, isAdminAreaAllowed } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F8F8]">
        <div className="space-y-3 w-48">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!user || !profile || !isAdminAreaAllowed) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F8F8F8] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#103820] flex flex-col flex-shrink-0 overflow-y-auto">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link to="/en" className="block">
            <img src="/rayyithun-logo.png" alt="RAYYITHUN" className="h-16 w-full object-cover object-center rounded-sm" />
            <span className="block text-[#95D5B2] text-xs mt-0.5">Admin CMS</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
              const isActive = location.pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    to={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-[#95D5B2] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRightIcon size={12} className="opacity-60" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#52B788] flex items-center justify-center text-[#103820] text-xs font-bold flex-shrink-0">
              {profile.full_name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{profile.full_name ?? "Admin"}</p>
              <p className="text-[#95D5B2] text-[10px] capitalize">{profile.role.replace("_", " ")}</p>
            </div>
          </div>
          <button
            onClick={() => { signOut().catch(console.error); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[#95D5B2] hover:text-white hover:bg-white/10 rounded-sm text-xs font-medium transition-colors"
          >
            <LogOutIcon size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
