import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Trees,
  Users,
  Wallet,
  Wheat,
  User,
  CalendarCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isMobile?: boolean;
  onClose?: () => void;
}

function Sidebar({ className, isMobile, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const adminLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Coconut Trees", href: "/dashboard/trees", icon: Trees },
    { name: "Tree Owners", href: "/dashboard/owners", icon: User },
    { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { name: "Harvests", href: "/dashboard/harvests", icon: Wheat },
    { name: "Stock", href: "/dashboard/stock", icon: Package },
    { name: "Sales", href: "/dashboard/sales", icon: BarChart3 },
    { name: "Payments", href: "/dashboard/payments", icon: Wallet },
    { name: "Workers", href: "/dashboard/workers", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const workerLinks = [
    { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Harvests", href: "/dashboard/harvests", icon: Wheat },
    { name: "My Payments", href: "/dashboard/payments", icon: Wallet },
  ];

  const links = isAdmin ? adminLinks : workerLinks;

  return (
    <div className={cn("pb-12 min-h-screen bg-sidebar border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Trees className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              Coconut Flow
            </h2>
          </div>
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={onClose}
              >
                <Button
                  variant={location.pathname === link.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <Sidebar className="fixed w-64" />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar isMobile onClose={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold md:hidden">Coconut Flow</h1>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-sm text-muted-foreground hidden md:block">
              Welcome, {user?.name || user?.email || "User"}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image} alt={user?.name || ""} />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}