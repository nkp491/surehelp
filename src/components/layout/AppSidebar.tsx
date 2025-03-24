import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserInvitationsNotification } from "@/components/team/UserInvitationsNotification";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import {
  Home,
  LayoutDashboard,
  Settings,
  User,
  Users,
  Bell,
  LogOut,
  ListChecks,
  Activity,
  MailWarning,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { isOpen, onOpen, onClose } = useSidebar();
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { user } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <aside className={cn("bg-secondary border-r h-full")}>
      <div className="px-3 py-2 flex flex-col gap-y-4">
        <Link to="/">
          <h1 className="hidden lg:block font-bold text-xl">Agent Hub</h1>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-secondary border-r">
            <div className="px-3 py-2 flex flex-col gap-y-4">
              <SheetHeader>
                <SheetTitle>Agent Hub</SheetTitle>
                <SheetDescription>
                  Manage your account preferences, profile details, and team
                  settings here.
                </SheetDescription>
              </SheetHeader>
              {/* Main Nav */}
              <nav className="flex flex-col">
                <Link to="/">
                  <Button
                    variant={pathname === "/" ? "sidebarActive" : "sidebar"}
                    className="w-full justify-start"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/assessment">
                  <Button
                    variant={pathname === "/assessment" ? "sidebarActive" : "sidebar"}
                    className="w-full justify-start"
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    Assessment
                  </Button>
                </Link>
                <Link to="/submitted-forms">
                  <Button
                    variant={
                      pathname === "/submitted-forms" ? "sidebarActive" : "sidebar"
                    }
                    className="w-full justify-start"
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Submitted Forms
                  </Button>
                </Link>
                <Link to="/metrics">
                  <Button
                    variant={pathname === "/metrics" ? "sidebarActive" : "sidebar"}
                    className="w-full justify-start"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Metrics
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button
                    variant={pathname === "/profile" ? "sidebarActive" : "sidebar"}
                    className="w-full justify-start"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                <Link to="/team-directory">
                  <Button
                    variant={pathname === "/team-directory" ? "sidebarActive" : "sidebar"}
                    className="w-full justify-start"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Team Directory
                  </Button>
                </Link>
                <Link to="/team-management">
                  <Button
                    variant={pathname === "/team-management" ? "sidebarActive" : "sidebar"}
                    className="w-full justify-start"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Team Management
                  </Button>
                </Link>
                <Link to="/commission-tracker">
                  <Button
                    variant={
                      pathname === "/commission-tracker" ? "sidebarActive" : "sidebar"
                    }
                    className="w-full justify-start"
                  >
                    <MailWarning className="mr-2 h-4 w-4" />
                    Commission Tracker
                  </Button>
                </Link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        {/* Main Nav */}
        <nav className="flex flex-col">
          <Link to="/">
            <Button
              variant={pathname === "/" ? "sidebarActive" : "sidebar"}
              className="w-full justify-start"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/assessment">
            <Button
              variant={pathname === "/assessment" ? "sidebarActive" : "sidebar"}
              className="w-full justify-start"
            >
              <ListChecks className="mr-2 h-4 w-4" />
              Assessment
            </Button>
          </Link>
          <Link to="/submitted-forms">
            <Button
              variant={
                pathname === "/submitted-forms" ? "sidebarActive" : "sidebar"
              }
              className="w-full justify-start"
            >
              <Activity className="mr-2 h-4 w-4" />
              Submitted Forms
            </Button>
          </Link>
          <Link to="/metrics">
            <Button
              variant={pathname === "/metrics" ? "sidebarActive" : "sidebar"}
              className="w-full justify-start"
            >
              <Home className="mr-2 h-4 w-4" />
              Metrics
            </Button>
          </Link>
          <Link to="/profile">
            <Button
              variant={pathname === "/profile" ? "sidebarActive" : "sidebar"}
              className="w-full justify-start"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
          <Link to="/team-directory">
            <Button
              variant={pathname === "/team-directory" ? "sidebarActive" : "sidebar"}
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              Team Directory
            </Button>
          </Link>

          {/* Team Management - new link! */}
          <Link to="/team-management">
            <Button
              variant={pathname === "/team-management" ? "sidebarActive" : "sidebar"}
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              Team Management
            </Button>
          </Link>

          <Link to="/commission-tracker">
            <Button
              variant={
                pathname === "/commission-tracker" ? "sidebarActive" : "sidebar"
              }
              className="w-full justify-start"
            >
              <MailWarning className="mr-2 h-4 w-4" />
              Commission Tracker
            </Button>
          </Link>
          <Link to="/role-management">
            <Button
              variant={pathname === "/role-management" ? "sidebarActive" : "sidebar"}
              className="w-full justify-start"
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Role Management
            </Button>
          </Link>
        </nav>
      </div>
      {/* User account and notifications */}
      <div className="flex items-center justify-between p-3 mt-auto border-t">
        <UserInvitationsNotification />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profile_image_url || ""} />
                <AvatarFallback>{user?.first_name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                signOut();
                toast({
                  title: "Success",
                  description: "Signed out successfully",
                });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
