import { useStore } from "@/store";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, LogOut, LayoutDashboard, CalendarDays, Inbox, CalendarSync, RefreshCw } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);
  const [, setLocation] = useLocation();

  if (!currentUser) return <>{children}</>;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/schedule", label: "Weekly Schedule", icon: Calendar },
    { href: "/admin/shift-bank", label: "Shift Bank", icon: Clock },
    { href: "/admin/requests", label: "Requests", icon: Inbox },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  const employeeLinks = [
    { href: "/employee", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employee/my-shifts", label: "My Shifts", icon: CalendarDays },
    { href: "/employee/schedule", label: "All Shifts", icon: Calendar },
    { href: "/employee/swaps", label: "Shift Swaps", icon: RefreshCw },
    { href: "/employee/weekly-requests", label: "Weekly Requests", icon: Inbox },
    { href: "/employee/availability", label: "Availability", icon: CalendarSync },
  ];

  const links = currentUser.role === "ADMIN" ? adminLinks : employeeLinks;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold tracking-tight text-primary">Bill Board</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Icon size={18} />
                  {link.label}
                </a>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser.role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:hidden shrink-0">
          <h1 className="text-xl font-bold text-primary">Bill Board</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
             <LogOut size={18} />
          </Button>
        </header>
        
        {/* Mobile Nav */}
        <nav className="flex overflow-x-auto border-b bg-card p-2 gap-2 md:hidden shrink-0">
            {links.map((link) => {
               const Icon = link.icon;
               return (
                 <Link key={link.href} href={link.href}>
                   <a className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/50 text-xs font-medium whitespace-nowrap">
                     <Icon size={14} />
                     {link.label}
                   </a>
                 </Link>
               );
             })}
        </nav>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}