import { PenSquare, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface NavbarProps {
  isAdmin: boolean;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export function Navbar({ isAdmin, onLogout, onNavigate }: NavbarProps) {
  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <PenSquare className="size-6" />
            <span className="text-xl">Blog Platform</span>
          </button>
          
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('admin')}
                >
                  Admin Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={onLogout}
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => onNavigate('login')}
              >
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
