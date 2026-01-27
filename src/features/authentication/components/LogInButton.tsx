import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, BookOpen, LogIn as LogInIcon, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { LoginDialog } from "@/features/authentication/components/LoginDialog";
import { useSignOutMutation } from "@/features/authentication/api/authApiSlice.ts";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function UserProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, displayName, initials, email } = useCurrentUser();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [signOut] = useSignOutMutation();

  const handleSignOut = async () => {
    try {
      setShowLoginDialog(false)
      setIsDropdownOpen(false);
      await signOut().unwrap();
      console.log('Successfully signed out.');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isAuthenticated && user) {
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Avatar className="w-8 h-8 border-2 border-accent">
              <AvatarImage src={"/placeholder-user.jpg"} />
              <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="text-foreground">
            {displayName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/usuario/me")}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={true}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Mis Préstamos (proximamente)</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="hover:bg-destructive/10 text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else {
    return (
      <div>
        <button
          onClick={() => setShowLoginDialog(true)}
          className="group flex items-center px-3 pr-2 py-2 w-max rounded-md bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center overflow-hidden transition-all duration-300 ease-in-out md:group-hover:w-[140px] w-[24px]">
            <LogInIcon className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap transition-opacity duration-300 opacity-0 md:group-hover:opacity-100 ml-2">
              Iniciar Sesión
            </span>
          </div>
        </button>
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      </div>
    );
  }
}