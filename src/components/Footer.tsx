import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { label: "About Us", href: "/" },
    { label: "Properties", href: "/" },
    { label: "Automobiles", href: "/" },
    { label: "Jewellery", href: "/" },
    { label: "Experts", href: "/" },
  ];

  const locations = [
    "Bangalore",
    "Mysore",
    "Hubli",
    "Mangalore",
    "Belgaum",
  ];

  return (
    <footer className="bg-foreground/5 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Property Hub</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Karnataka's trusted marketplace for land, homes, cars & jewellery.
              List free. Verify with OTP.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Locations */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Popular Locations</h4>
            <ul className="space-y-2">
              {locations.map((location) => (
                <li key={location}>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {location}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <ul className="space-y-3">
              <li className="text-sm text-muted-foreground">
                Karnataka, India
              </li>
              <li>
                <a
                  href="tel:+919964677010"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +91 9964677010
                </a>
              </li>
              <li>
                <a
                  href="mailto:thepropertyforyou@gmail.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  thepropertyforyou@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-4xl mx-auto">
            Property Hub is an information & listing platform. Users must verify documents
            before transactions. Premium listings may include GST. © 2025 Property Hub. All
            Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
