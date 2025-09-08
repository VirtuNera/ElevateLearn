import { useState } from "react";
import { useMockAuth } from "@/hooks/useMockAuth";
import { useLocation } from "wouter";
import { RoleSwitcher } from "./role-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Bell, MessageCircle, ChevronDown, LogOut, User, Settings, Sparkles } from "lucide-react";

interface NavigationProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

export default function Navigation({ currentRole, onRoleChange }: NavigationProps) {
  const { user, logout } = useMockAuth();
  const [, setLocation] = useLocation();
  const [unreadNotifications] = useState(3);
  const [unreadMessages] = useState(2);

  const handleLogout = () => {
    logout();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'learner': return 'Learner';
      case 'mentor': return 'Mentor';
      case 'admin': return 'Admin';
      default: return 'Learner';
    }
  };

  const getUserInitials = () => {
    if ((user as any)?.firstName && (user as any)?.lastName) {
      return `${(user as any).firstName[0]}${(user as any).lastName[0]}`.toUpperCase();
    }
    return (user as any)?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="text-primary text-2xl" />
              <h1 className="text-primary text-xl font-semibold">Elevate 360</h1>
            </div>
            
            {/* Role Switcher */}
            <RoleSwitcher />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Nura AI Assistant */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
              onClick={() => {
                const role = (user as any)?.role || 'learner';
                setLocation(`/nura-ai/${role}`);
              }}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Nura AI
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
            
            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative">
              <MessageCircle className="h-5 w-5" />
              {unreadMessages > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                  {unreadMessages}
                </Badge>
              )}
            </Button>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block font-medium">
                    {(user as any)?.firstName && (user as any)?.lastName 
                      ? `${(user as any).firstName} ${(user as any).lastName}`
                      : (user as any)?.email
                    }
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{(user as any)?.firstName} {(user as any)?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{(user as any)?.email}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {getRoleDisplayName((user as any)?.role || 'learner')}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
