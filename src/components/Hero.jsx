import { useRef } from 'react';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DashboardMockup } from './DashboardMockup';

export function Hero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const headlineScale = useTransform(scrollYProgress, [0, 0.65], [1, 0.88]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const deviceScale = useTransform(scrollYProgress, [0, 1], [0.86, 1.04]);
  const deviceY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return <main className="vg-page">
    <section className="vg-hero" ref={heroRef} id="product">
      <motion.div className="vg-glow" style={{ opacity: glowOpacity }} />
      <div className="vg-hero-inner">
        <motion.div className="vg-hero-copy" style={{ scale: headlineScale, opacity: headlineOpacity }}>
          <div className="vg-eyebrow"><ShieldCheck size={15} /> Calm protection for every conversation</div>
          <h1>Stop <em>Voice Fraud</em><br />Before It Costs You</h1>
          <p>Real-time AI detection that spots deepfake and spoofed calls before they reach your people, your data, or your bottom line.</p>
          <motion.a className="vg-dark-button vg-hero-cta" href="/register" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>Get started <ArrowRight size={16} /></motion.a>
          <div className="vg-proof"><span><Check size={13} /> No credit card required</span><span><Check size={13} /> Set up in minutes</span></div>
        </motion.div>
        <motion.div className="vg-device-stage" style={{ scale: deviceScale, y: deviceY }}><DashboardMockup /></motion.div>
      </div>
    </section>
    <section className="vg-bottom-space" id="how-it-works"><p>Security that stays one step ahead.</p></section>
  </main>;
}