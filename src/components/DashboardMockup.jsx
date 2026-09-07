import { Activity, BatteryMedium, ChevronRight, Radio, Signal, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

const calls = [
  { initials: '?', caller: '+1 (415) 555-0182', detail: 'Live · 0:12', status: 'Analyzing...', tone: 'analyzing', score: 'Scanning' },
  { initials: 'PS', caller: 'Priya Shah', detail: '2 min ago · 3:14', status: 'Safe', tone: 'safe', score: '98% confidence' },
  { initials: '?', caller: '+1 (929) 555-0447', detail: '5 min ago · 1:02', status: 'Fraud detected', tone: 'fraud', score: '96% confidence' },
];

function Waveform() {
  return <div className="vg-waveform" aria-label="Live audio waveform">{[8, 14, 20, 12, 17, 9].map((height, index) => <motion.i key={index} animate={{ height: [height / 2, height, height / 2] }} transition={{ duration: 0.85, repeat: Infinity, delay: index * 0.08, ease: 'easeInOut' }} />)}</div>;
}

function CallRow({ call, index }) {
  return <motion.li className={`vg-call-row ${call.tone}`} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -3, boxShadow: '0 12px 24px rgba(31, 35, 31, .08)' }}>
    <span className="vg-avatar">{call.initials}</span>
    <span className="vg-call-copy"><strong>{call.caller}</strong><small>{call.detail}</small></span>
    {index === 0 ? <Waveform /> : <span className="vg-mini-bars" aria-hidden="true"><i /><i /><i /><i /></span>}
    <span className={`vg-risk ${call.tone}`}>{call.status}</span>
    <small className="vg-confidence">{call.score}</small>
  </motion.li>;
}

export function DashboardMockup() {
  return <motion.div className="vg-device-wrap" initial={{ opacity: 0, y: 42 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}>
    <motion.div className="vg-dashboard" animate={{ y: [0, -6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
      <div className="vg-status-bar"><span>9:41</span><span className="vg-status-icons"><Signal size={12} /><Wifi size={12} /><BatteryMedium size={15} /></span></div>
      <div className="vg-dashboard-head"><div><span className="vg-live-icon"><Radio size={15} /></span><span><small>VoiceGuard</small><strong>Call monitoring</strong></span></div><button type="button" aria-label="View all calls">See all <ChevronRight size={14} /></button></div>
      <div className="vg-monitor-summary"><span><Activity size={14} /> Listening for risk signals</span><strong>24 calls protected</strong></div>
      <motion.ul className="vg-call-list" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} transition={{ staggerChildren: 0.1 }}>{calls.map((call, index) => <CallRow key={call.caller} call={call} index={index} />)}</motion.ul>
      <div className="vg-dashboard-footer"><span className="vg-footer-dot" /> AI analysis is active <span>Updated just now</span></div>
    </motion.div>
  </motion.div>;
}