import { useMockAuth } from "@/hooks/useMockAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, GraduationCap, Shield, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RoleSwitcher() {
  const { user, switchUser } = useMockAuth();
  const { toast } = useToast();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "learner":
        return <User className="h-4 w-4" />;
      case "mentor":
        return <GraduationCap className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "learner":
        return "text-blue-600";
      case "mentor":
        return "text-green-600";
      case "admin":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const handleRoleSwitch = (role: string) => {
    switchUser(role);
    toast({
      title: "Role switched",
      description: `Now viewing as ${role}`,
    });
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {getRoleIcon(user.role)}
          <span className="capitalize">{user.role}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleRoleSwitch("learner")}>
          <User className="h-4 w-4 mr-2" />
          Learner
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleSwitch("mentor")}>
          <GraduationCap className="h-4 w-4 mr-2" />
          Mentor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleSwitch("admin")}>
          <Shield className="h-4 w-4 mr-2" />
          Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
