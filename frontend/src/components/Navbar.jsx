import { useEffect, useState, useRef } from 'react';
import { ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Close drawer if screen resizes to desktop (> 720px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 720 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const navLinks = [
    { label: 'Product', href: '#product' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Blog', href: '#blog' },
  ];

  const handleLinkClick = (e, href) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <motion.header
        className={`vg-nav ${scrolled || isOpen ? 'is-scrolled' : ''}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <a className="vg-brand" href="/" aria-label="VoiceGuard home" onClick={() => setIsOpen(false)}>
          <span className="vg-brand-icon">
            <ShieldCheck size={17} strokeWidth={2.2} />
          </span>
          <span>VoiceGuard</span>
        </a>

        {/* Desktop Links */}
        <nav className="vg-nav-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop and Mobile Actions */}
        <div className="vg-nav-actions">
          <a className="vg-login" href="/login">
            Login
          </a>
          <motion.a
            className="vg-dark-button vg-nav-cta"
            href="/register"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Get started <ArrowRight size={14} />
          </motion.a>

          {/* Mobile-Only Burger Menu Button */}
          <button
            ref={buttonRef}
            type="button"
            className={`vg-burger-btn ${isOpen ? 'is-open' : ''}`}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="vg-mobile-menu"
          >
            <span className="vg-burger-box" aria-hidden="true">
              <span className="vg-burger-line vg-burger-line-1" />
              <span className="vg-burger-line vg-burger-line-2" />
              <span className="vg-burger-line vg-burger-line-3" />
            </span>
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer Overlay and Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="vg-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="vg-mobile-menu"
              className="vg-mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="vg-mobile-menu-inner">
                <div className="vg-mobile-kicker">
                  <span>Navigation</span>
                  <span className="vg-mobile-kicker-dot" />
                </div>

                <nav className="vg-mobile-nav" aria-label="Mobile navigation links">
                  {navLinks.map((link, idx) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      className="vg-mobile-link"
                      onClick={(e) => handleLinkClick(e, link.href)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * idx, duration: 0.2 }}
                    >
                      <span>{link.label}</span>
                      <ChevronRight size={14} className="vg-mobile-chevron" />
                    </motion.a>
                  ))}
                </nav>

                <div className="vg-mobile-divider" />

                <div className="vg-mobile-actions">
                  <a
                    className="vg-mobile-login-btn"
                    href="/login"
                    onClick={() => setIsOpen(false)}
                  >
                    Login to Console
                  </a>
                  <motion.a
                    className="vg-dark-button vg-mobile-cta"
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Get started</span>
                    <ArrowRight size={14} />
                  </motion.a>
                </div>

                <div className="vg-mobile-status">
                  <span className="vg-status-radar">
                    <i className="radar-dot" />
                    <i className="radar-ring" />
                  </span>
                  <span className="vg-status-text">VoiceGuard Shield: Active</span>
                  <span className="vg-status-ping">0.4ms</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}