import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <motion.header className={`vg-nav ${scrolled ? 'is-scrolled' : ''}`} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
      <a className="vg-brand" href="/" aria-label="VoiceGuard home"><span className="vg-brand-icon"><ShieldCheck size={17} strokeWidth={2.2} /></span><span>VoiceGuard</span></a>
      <nav className="vg-nav-links" aria-label="Main navigation"><a href="#product">Product</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><a href="#blog">Blog</a></nav>
      <div className="vg-nav-actions"><a className="vg-login" href="/login">Login</a><motion.a className="vg-dark-button vg-nav-cta" href="/register" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>Get started <ArrowRight size={14} /></motion.a></div>
    </motion.header>
  );
}