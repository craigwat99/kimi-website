import { Facebook, Instagram, Mail, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#784982] text-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('hero');
              }}
              className="inline-block text-3xl font-black mb-4 hover:scale-105 transition-transform"
            >
              <img src="/40THtxt.png" alt="" className="inline-block mr-1 align-middle relative -top-[0.05em]" />
            </a>
            <p className="text-white/80 text-lg mb-6 max-w-md">
              Celebrating the past, 1986 - 2026, while looking to the future.
            </p>
            <p className="text-white/60 text-sm">
              Honouring the activists, allies, and community who fought for change 
              and celebrating how far we've come.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { id: 'events', label: 'Events' },
                { id: 'history', label: 'History' },
                { id: 'gallery', label: 'Gallery' },
              ].map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.id);
                    }}
                    className="text-white/70 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/letters-of-love"
                  className="text-white/70 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2"
                >
                  Letters of Love
                </a>
              </li>
              <li>
                <a
                  href="#events"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('events');
                  }}
                  className="text-white/70 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2"
                >
                  Submit Event
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Connect</h3>
            
            <div className="flex gap-4 mb-6">
              <a
                href="https://facebook.com/40yearsoflove"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/40yearsoflove"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            <a
              href="mailto:hello@rainbowwellington.org.nz"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@rainbowwellington.org.nz
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              © {currentYear} 40 Years - Homosexual Law Reform. All rights reserved
            </p>
            
            <p className="text-white/60 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-[#e5c858] fill-current" /> for the community
            </p>
          </div>
        </div>
      </div>

      {/* Logo watermark */}
      <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
        <img
          src="/logomark2.png"
          alt=""
          className="w-64 h-64 object-contain"
        />
      </div>
    </footer>
  );
}
