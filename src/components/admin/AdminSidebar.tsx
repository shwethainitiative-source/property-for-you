import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Star, 
  Megaphone, 
  Newspaper,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles,
  GraduationCap,
  DollarSign,
  HelpCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: FileText, label: "Listings", path: "/admin/listings" },
  { icon: Star, label: "Featured", path: "/admin/featured" },
  { icon: Sparkles, label: "Popup Ads", path: "/admin/popup-ads" },
  { icon: Megaphone, label: "Sponsorships", path: "/admin/sponsorships" },
  { icon: GraduationCap, label: "Experts", path: "/admin/experts" },
  { icon: HelpCircle, label: "Expert Enquiries", path: "/admin/expert-enquiries" },
  { icon: DollarSign, label: "Pricing Plans", path: "/admin/pricing-management" },
  { icon: Newspaper, label: "News", path: "/admin/news" },
  { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          Admin Portal
        </h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
