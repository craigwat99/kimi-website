import { useState, useEffect } from 'react';
import { Menu, X, Calendar, History, Image, Heart, HelpCircle, PlusCircle } from 'lucide-react';

interface NavigationProps {
  onNavigate: (sectionId: string) => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'history', label: 'History', icon: History },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'letters-of-love', label: 'Letters of Love', icon: Heart, href: '/letters-of-love' },
    { id: 'quiz', label: 'The Quiz', icon: HelpCircle, href: '/quiz' },
  ];

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('hero');
            }}
            className={`font-bold text-xl transition-colors duration-300 ${
              isScrolled ? 'text-[#784982]' : 'text-white'
            }`}
          >
            <img src="/40TH.png" alt="" className="inline-block w-[1.4em] h-[1.4em] mr-1 align-middle relative -top-[0.05em]" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={'href' in link && link.href ? link.href : `#${link.id}`}
                onClick={'href' in link && link.href ? undefined : (e) => {
                  e.preventDefault();
                  handleNavClick(link.id);
                }}
                className={`relative font-medium text-sm transition-all duration-300 hover:-translate-y-0.5 group ${
                  isScrolled ? 'text-gray-700 hover:text-[#784982]' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#784982] transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </a>
            ))}
            
            <button
              onClick={() => handleNavClick('events')}
              className={`flex items-center gap-2 px-5 py-2.5 font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? 'bg-[#784982] text-white shadow-lg hover:shadow-xl'
                  : 'bg-[#784982] text-white hover:bg-[#784982]/90'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Submit Event
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`rounded-2xl p-4 space-y-2 ${isScrolled ? 'bg-gray-50' : 'bg-white/10 backdrop-blur-lg'}`}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.id}
                  href={'href' in link && link.href ? link.href : `#${link.id}`}
                  onClick={'href' in link && link.href ? undefined : (e) => {
                    e.preventDefault();
                    handleNavClick(link.id);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isScrolled
                      ? 'text-gray-700 hover:bg-white hover:text-[#784982] hover:shadow-md'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </a>
              );
            })}
            
            <button
              onClick={() => handleNavClick('events')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-[#784982] text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              <PlusCircle className="w-5 h-5" />
              Submit Event
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
