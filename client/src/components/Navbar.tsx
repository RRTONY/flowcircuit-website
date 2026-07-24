import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, ClipboardCheck, BarChart3, LogIn, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { clearAllPersistedData } from "@/lib/assessmentPersistence";

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/assessment", label: "Assessment" },
    { href: "/team-dashboard", label: "Teams" },
    { href: "/pricing", label: "Pricing" },
    { href: "/science", label: "Science" },
  ];

  // Hide navbar entirely on the assessment page to maximize screen space for questions
  if (location === '/assessment') return null;

  const handleLogout = async () => {
    await logout();
    clearAllPersistedData();
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-lg md:text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary shrink-0">
            THE FLOW CIRCUIT
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md",
                location === link.href || (link.href === '/team-dashboard' && location.startsWith('/team'))
                  ? "text-foreground bg-muted/50"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Admin link - only visible to admins */}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <div className="w-px h-4 bg-border mx-1" />
              <Link 
                href="/admin"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md flex items-center gap-1",
                  location === '/admin'
                    ? "text-foreground bg-muted/50"
                    : "text-muted-foreground"
                )}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Admin
              </Link>
            </>
          )}

          <div className="w-px h-4 bg-border mx-2" />

          {/* Fix #4: Login/Logout buttons */}
          {!loading && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {user?.name || user?.email || "User"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="mr-1 h-3.5 w-3.5" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                    <LogIn className="mr-1 h-3.5 w-3.5" />
                    Sign In
                  </Button>
                </a>
              )}
            </>
          )}

          <Link href="/assessment">
            <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-md ml-2">
              <ClipboardCheck className="mr-1.5 h-4 w-4" />
              Take Assessment
            </Button>
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/assessment">
            <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-sm text-xs px-3">
              Assess
            </Button>
          </Link>
          <button
            className="p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "block text-base font-medium transition-colors hover:text-primary px-3 py-3 rounded-lg",
                  location === link.href
                    ? "text-foreground bg-muted/50"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Admin link for mobile */}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <div className="border-t border-border/30 my-2" />
                <Link 
                  href="/admin"
                  className={cn(
                    "flex items-center gap-2 text-base font-medium transition-colors hover:text-primary px-3 py-3 rounded-lg",
                    location === '/admin'
                      ? "text-foreground bg-muted/50"
                      : "text-muted-foreground"
                  )}
                >
                  <BarChart3 className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              </>
            )}

            <div className="border-t border-border/30 my-2" />

            {/* Fix #4: Mobile Login/Logout */}
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="px-3 py-2">
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {user?.name || user?.email || "Signed In"}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <a href={getLoginUrl()} className="block px-3 py-2">
                    <Button variant="outline" className="w-full">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </a>
                )}
              </>
            )}
            
            <Link href="/assessment">
              <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold mt-2">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Take the Assessment
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
