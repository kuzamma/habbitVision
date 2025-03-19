import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { 
  CalendarCheckIcon, 
  BellIcon, 
  SettingsIcon, 
  UserIcon, 
  LogOutIcon, 
  HomeIcon, 
  BarChartIcon,
  ChevronDownIcon,
  Award,
  X
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return "U";

    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }

    return user.username.substring(0, 2).toUpperCase();
  };

  // Get display name
  const displayName = user?.fullName || user?.username || "User";

  const navItems = [
    { label: "Dashboard", icon: HomeIcon, href: "/" },
    { label: "Stats", icon: BarChartIcon, href: "/stats" },
    { label: "Achievements", icon: Award, href: "/achievements" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <CalendarCheckIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-gray-800">Habitize</h1>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="ml-8 flex space-x-4">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center cursor-pointer ${
                    location === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-1.5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button type="button" className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary"></span>
          </button>

          {/* Mobile menu button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
          )}

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-1 rounded-full flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User avatar" />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">{displayName}</span>
                    <ChevronDownIcon className="h-4 w-4 ml-1 text-gray-500" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer" 
                onClick={() => navigate("/profile")}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => navigate("/settings")}
              >
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={handleLogout}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarCheckIcon className="h-6 w-6 text-primary mr-2" />
                <span>Habitize</span>
              </div>
              <SheetClose className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </SheetClose>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`px-3 py-3 rounded-md text-base font-medium flex items-center ${
                  location === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            ))}

            <div className="border-t border-gray-200 my-2 pt-2"></div>

            <Link
              href="/profile"
              className="px-3 py-3 rounded-md text-base font-medium flex items-center text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <UserIcon className="h-5 w-5 mr-3" />
              Profile
            </Link>

            <Link
              href="/settings"
              className="px-3 py-3 rounded-md text-base font-medium flex items-center text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <SettingsIcon className="h-5 w-5 mr-3" />
              Settings
            </Link>

            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="px-3 py-3 rounded-md text-base font-medium flex items-center text-gray-600 hover:bg-gray-100 w-full text-left"
            >
              <LogOutIcon className="h-5 w-5 mr-3" />
              Log out
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}