import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Properties", href: "/" },
    { label: "Automobiles", href: "/" },
    { label: "Jewellery", href: "/" },
    { label: "Experts", href: "/" },
    { label: "News", href: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary">ThePropertyForYou</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-foreground/80">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Link to="/post-ad">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Post Free Ad
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block px-2 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start text-foreground/80">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Link to="/post-ad" onClick={() => setIsMenuOpen(false)}>
                <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Free Ad
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
