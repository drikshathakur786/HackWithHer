import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function NavBar() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login page
      navigate('/login');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Show loading state
  if (isLoading) {
    return (
      <nav className="border-b border-border/40 sticky top-0 z-50 w-full backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-semibold text-brand">सखी</span>
            <span className="text-xl font-semibold">Junction</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/home" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/community" className={`nav-link ${isActive('/community') ? 'active' : ''}`}>Community</Link>
            <Link to="/health-tracker" className={`nav-link ${isActive('/health-tracker') ? 'active' : ''}`}>Health Tracker</Link>
            <Link to="/articles" className={`nav-link ${isActive('/articles') ? 'active' : ''}`}>Articles</Link>
            <Link to="/self-care" className={`nav-link ${isActive('/self-care') ? 'active' : ''}`}>Self-Care</Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </Button>
            
            {/* Loading skeleton */}
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-border/40 sticky top-0 z-50 w-full backdrop-blur-md bg-background/80">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-semibold text-brand">सखी</span>
          <span className="text-xl font-semibold">Junction</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/home" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/community" className={`nav-link ${isActive('/community') ? 'active' : ''}`}>Community</Link>
          <Link to="/health-tracker" className={`nav-link ${isActive('/health-tracker') ? 'active' : ''}`}>Health Tracker</Link>
          <Link to="/articles" className={`nav-link ${isActive('/articles') ? 'active' : ''}`}>Articles</Link>
          <Link to="/self-care" className={`nav-link ${isActive('/self-care') ? 'active' : ''}`}>Self-Care</Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          </Button>
          
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3 py-2">
                  <User className="h-4 w-4 text-brand" />
                  <span className="text-sm font-medium text-brand">
                    {user.email.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">Welcome back!</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="ghost" className="font-medium">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-brand hover:bg-brand-600 text-white font-medium">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}