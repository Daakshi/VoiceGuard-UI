import { motion } from 'framer-motion';

const partners = ['Twilio', 'RingCentral', 'Zoom', 'aircall', 'verizon'];

export function TrustedBy() {
  return <motion.section className="vg-trusted" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}><p>Trusted by security teams at</p><div className="vg-partners">{partners.map((partner) => <span key={partner}>{partner}</span>)}</div></motion.section>;
}