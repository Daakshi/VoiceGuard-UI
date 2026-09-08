import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './api';
import { connectSignaling, disconnectSignaling, addSignalingListener } from './signaling';
import './styles.css';
import './landing.css';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AnimatePresence, motion } from 'framer-motion';

const riskLabels = { safe: 'Safe', suspicious: 'Suspicious', 'high-risk': 'High risk' };
const protectedPaths = ['/dashboard', '/analytics', '/call-history', '/alerts', '/contacts', '/settings', '/calls'];

function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function DashboardLogo() {
  return <a className="dashboard-wordmark" href="/dashboard" aria-label="VoiceGuard dashboard"><span className="wordmark-mark" aria-hidden="true"><i /><i /><i /></span><span>VoiceGuard</span></a>;
}

function DashboardHeader({ activePath }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const navLinks = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Call history', href: '/call-history' },
    { label: 'Contacts', href: '/contacts' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      <header className="dashboard-header">
        <DashboardLogo />
        <nav className="dashboard-nav-desktop" aria-label="Dashboard navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className={activePath === link.href ? 'nav-active' : ''}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
          <a data-signout="true" href="/login">Sign out</a>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className={`vg-burger-btn dashboard-burger-btn ${isOpen ? 'is-open' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="dashboard-mobile-menu"
        >
          <span className="vg-burger-box" aria-hidden="true">
            <span className="vg-burger-line vg-burger-line-1" />
            <span className="vg-burger-line vg-burger-line-2" />
            <span className="vg-burger-line vg-burger-line-3" />
          </span>
        </button>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="vg-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="dashboard-mobile-menu"
              className="vg-mobile-menu dashboard-mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard Navigation"
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

                <nav className="vg-mobile-nav" aria-label="Dashboard mobile links">
                  {navLinks.map((link, idx) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      className={`vg-mobile-link ${activePath === link.href ? 'nav-active-mobile' : ''}`}
                      onClick={() => setIsOpen(false)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * idx, duration: 0.2 }}
                    >
                      <span>{link.label}</span>
                      {activePath === link.href && <span className="vg-active-dot" />}
                    </motion.a>
                  ))}
                </nav>

                <div className="vg-mobile-divider" />

                <div className="vg-mobile-actions">
                  <a
                    className="vg-mobile-login-btn vg-mobile-signout"
                    data-signout="true"
                    href="/login"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign out
                  </a>
                </div>

                <div className="vg-mobile-status">
                  <span className="vg-status-radar">
                    <i className="radar-dot" />
                    <i className="radar-ring" />
                  </span>
                  <span className="vg-status-text">Protection Active</span>
                  <span className="vg-status-ping">Online</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Logo() {
  return (
    <a className="wordmark" href="/login" aria-label="VoiceGuard home">
      <span className="wordmark-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>VoiceGuard</span>
    </a>
  );
}

function MobileGuardPreview() {
  return <aside className="mobile-guard-preview" aria-label="VoiceGuard mobile protection preview">
    <div className="preview-orbit preview-orbit-one" />
    <div className="preview-orbit preview-orbit-two" />
    <div className="preview-copy"><span className="preview-kicker"><i />Live protection</span><strong>Know who is really calling.</strong><p>Voice analysis runs quietly in the background while you talk.</p></div>
    <div className="phone-frame"><div className="phone-speaker" /><div className="phone-screen"><div className="phone-status"><span>9:41</span><span>● ● ●</span></div><div className="phone-appbar"><span className="phone-shield">✓</span><strong>VoiceGuard</strong><span className="phone-signal">•••</span></div><div className="call-state"><span className="caller-avatar">?</span><small>Incoming call</small><strong>Unknown caller</strong><span className="caller-number">+1 (202) 555-0161</span></div><div className="voice-pulse"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="scan-status"><span className="scan-dot" />Analyzing voice signature<span>72%</span></div><div className="phone-actions"><span>Mute</span><b>↗</b><span>Speaker</span></div></div></div>
  </aside>;
}

function Field({ id, label, type = 'text', value, onChange, error, autoComplete }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} type={type} value={value} onChange={onChange} autoComplete={autoComplete} aria-invalid={Boolean(error)} required />
      <p className="field-error" aria-live="polite">{error}</p>
    </div>
  );
}

function validate(form, register) {
  const errors = {};
  if (register && !form.name.trim()) errors.name = 'Name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.';
  if (!form.password) errors.password = 'Password is required.';
  if (register && form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

function RiskRing({ score }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  return <div className="risk-ring" aria-label={`Average risk score ${score} out of 100`}><svg viewBox="0 0 110 110" role="img"><circle className="ring-track" cx="55" cy="55" r="45" /><circle className="ring-value" cx="55" cy="55" r="45" strokeDasharray={circumference} strokeDashoffset={offset} /></svg><div className="ring-label"><strong>{score}</strong><span>of 100</span></div></div>;
}

function TrendChart({ points, startLabel = '14 days ago', endLabel = 'Today' }) {
  const width = 760;
  const height = 230;
  const padding = { top: 20, right: 12, bottom: 30, left: 12 };
  const max = Math.max(...points, 50);
  const x = (index) => padding.left + (index * (width - padding.left - padding.right)) / (points.length - 1);
  const y = (value) => padding.top + (1 - value / max) * (height - padding.top - padding.bottom);
  const line = points.map((point, index) => `${x(index)},${y(point)}`).join(' ');
  const area = `${x(0)},${height - padding.bottom} ${line} ${x(points.length - 1)},${height - padding.bottom}`;
  return <div className="trend-chart"><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={`Risk score trend from ${startLabel} to ${endLabel}`}><defs><linearGradient id="risk-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#bb4c31" stopOpacity=".25" /><stop offset="1" stopColor="#bb4c31" stopOpacity="0" /></linearGradient></defs><line className="chart-grid" x1="0" x2={width} y1={y(50)} y2={y(50)} /><line className="chart-grid" x1="0" x2={width} y1={y(25)} y2={y(25)} /><polygon className="chart-area" points={area} /><polyline className="chart-line" points={line} />{points.map((point, index) => <circle key={`${point}-${index}`} className="chart-point" cx={x(index)} cy={y(point)} r="3" />)}</svg><div className="chart-labels"><span>{startLabel}</span><span>{endLabel}</span></div></div>;
}

function EmptyAlerts() {
  return <div className="empty-alerts"><div className="empty-icon">+</div><h3>No calls yet</h3><p>Once the VoiceGuard mobile app starts protecting your calls, suspicious activity will appear here.</p></div>;
}

function SuccessScreen() {
  return <main className="success-screen"><div className="success-mark">✓</div><p className="eyebrow">VoiceGuard</p><h1>Signed in successfully.</h1><p>Your dashboard is ready.</p></main>;
}

function AlertRow({ alert }) {
  return (
    <a className="alert-row" href={`/call-history/${alert.id}`}>
      <span className={`alert-indicator ${alert.score >= 75 ? 'high' : ''}`} />
      <span className="alert-main">
        <strong>{alert.caller}</strong>
        <small>{alert.time}</small>
      </span>
      <span className="alert-level">{alert.level}</span>
      <span className="alert-score">{alert.score}<small>/100</small></span>
      <span className="alert-arrow" aria-hidden="true">↗</span>
    </a>
  );
}

function Alerts() {
  const [calls, setCalls] = useState(null);

  useEffect(() => {
    api.getCalls().then((res) => setCalls(res.payload || []));
  }, []);

  if (!calls) return <main className="dashboard-loading"><span className="spinner dark" />Loading alerts</main>;

  const alerts = calls.filter((c) => c.risk !== 'safe' || c.score >= 50);

  return (
    <main className="dashboard-shell">
      <DashboardHeader activePath="/dashboard" />
      <div className="dashboard-content">
        <a className="back-link" href="/dashboard">← Back to overview</a>
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Security alerts</p>
            <h1>Flagged calls</h1>
            <p>Calls that triggered suspicious or high-risk voice and spoofing signals.</p>
          </div>
          <span className="status-pill"><i />{alerts.length} active {alerts.length === 1 ? 'alert' : 'alerts'}</span>
        </div>

        {alerts.length ? (
          <section className="history-table" aria-label="Security alerts">
            <div className="history-header" aria-hidden="true">
              <span>Caller</span>
              <span>Date & time</span>
              <span>Duration</span>
              <span>Risk level</span>
              <span>Score</span>
              <span>Detection</span>
              <span />
            </div>
            {alerts.map((call) => (
              <CallHistoryRow key={call.id} call={call} />
            ))}
          </section>
        ) : (
          <div className="contacts-empty" style={{ marginTop: '24px' }}>
            <div className="empty-icon" style={{ borderColor: '#477254', color: '#477254' }}>✓</div>
            <h2>All clear — no security alerts</h2>
            <p>VoiceGuard has not detected any suspicious or high-risk calls. Any flagged activity from your Android app will appear here immediately.</p>
          </div>
        )}
      </div>
    </main>
  );
}


function Dashboard() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.getOverview().then((response) => setOverview(response.payload));
  }, []);

  if (!overview) return <main className="dashboard-loading"><span className="spinner dark" />Loading overview</main>;

  const hasCalls = overview.totalCalls > 0;
  return <main className="dashboard-shell">
    <DashboardHeader activePath="/dashboard" />
    <div className="dashboard-content">
      <div className="dashboard-heading"><div><p className="eyebrow">Overview</p><h1>Call security</h1><p>Monitor calls protected by VoiceGuard.</p></div><span className="status-pill"><i />Protection active</span></div>
      <section className="metric-row" aria-label="Call overview statistics"><div className="metric"><span>Total calls</span><strong>{overview.totalCalls}</strong><small>All protected calls</small></div><div className="metric"><span>Safe calls</span><strong>{overview.safeCalls}</strong><small>{hasCalls ? `${Math.round((overview.safeCalls / overview.totalCalls) * 100)}% of total` : 'No calls recorded'}</small></div><div className="metric"><span>Suspicious / high-risk</span><strong>{overview.suspiciousCalls}</strong><small>Needs review</small></div><div className="headline-metric"><div><span>Average risk score</span><small>Across all calls</small></div><RiskRing score={overview.averageRiskScore} /></div></section>
      <div className="dashboard-grid"><section className="trend-panel"><div className="panel-heading"><div><p className="eyebrow">Last 14 days</p><h2>Risk trend</h2></div><span className="legend"><i />Risk score</span></div>{hasCalls ? <TrendChart points={overview.trend} /> : <div className="empty-chart">Risk activity will appear here after your first protected call.</div>}</section><section className="alerts-panel"><div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h2>Recent alerts</h2></div><a href="/alerts">View all</a></div>{overview.alerts.length ? <div className="alert-list">{overview.alerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)}</div> : <EmptyAlerts />}</section></div>
    </div>
  </main>;
}

function RiskDonut({ breakdown }) {
  const total = Object.values(breakdown || {}).reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return (
      <div className="donut-wrap">
        <div className="empty-chart" style={{ width: '100%', borderBottom: 0 }}>
          No calls recorded yet. Risk distribution will populate once calls are protected.
        </div>
      </div>
    );
  }
  const circumference = 2 * Math.PI * 42;
  let offset = 0;
  const segments = Object.entries(breakdown).map(([key, value]) => {
    const length = (value / total) * circumference;
    const segment = { key, value, length, offset };
    offset += length;
    return segment;
  });
  return <div className="donut-wrap"><div className="donut-chart"><svg viewBox="0 0 100 100" role="img" aria-label="Calls by risk level"><circle className="donut-track" cx="50" cy="50" r="42" />{segments.map((segment) => <circle key={segment.key} className={`donut-segment ${segment.key}`} cx="50" cy="50" r="42" strokeDasharray={`${segment.length} ${circumference - segment.length}`} strokeDashoffset={-segment.offset} />)}</svg><div><strong>{total}</strong><span>total calls</span></div></div><div className="donut-legend">{segments.map((segment) => <div key={segment.key}><span><i className={segment.key} />{riskLabels[segment.key]}</span><strong>{segment.value}</strong></div>)}</div></div>;
}

function DetectionBreakdown({ items }) {
  const total = (items || []).reduce((sum, item) => sum + item.value, 0);
  if (total === 0 || !items || !items.length) {
    return (
      <div className="detection-list">
        <div className="empty-chart" style={{ padding: '24px', borderBottom: 0 }}>
          No detection signals recorded yet.
        </div>
      </div>
    );
  }
  return <div className="detection-list">{items.map((item) => <div className="detection-item" key={item.label}><div><span>{item.label}</span><strong>{item.value} <small>{Math.round((item.value / total) * 100)}%</small></strong></div><div className="detection-track"><i className={item.tone} style={{ width: `${(item.value / total) * 100}%` }} /></div></div>)}</div>;
}

function TimeHeatmap({ pattern }) {
  const max = Math.max(...(pattern?.values?.flat() || [0]));
  return <div className="heatmap"><div className="heatmap-grid"><span /><div className="heatmap-days">{(pattern?.days || []).map((day) => <span key={day}>{day}</span>)}</div>{(pattern?.periods || []).map((period, rowIndex) => <div className="heatmap-row" key={period}><span>{period}</span>{(pattern.values[rowIndex] || []).map((value, columnIndex) => <i key={`${period}-${pattern.days[columnIndex]}`} className={max > 0 && value > 0 ? `heat-${Math.min(4, Math.ceil((value / max) * 4))}` : ''} title={`${value} calls on ${pattern.days[columnIndex]} ${period.toLowerCase()}`} />)}</div>)}</div><p className="heatmap-note">{max > 0 ? 'Darker cells indicate more calls needing attention.' : 'No calls recorded for this period yet.'}</p></div>;
}

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    api.getAnalytics().then((response) => setAnalytics(response.payload));
  }, []);

  if (!analytics) return <main className="dashboard-loading"><span className="spinner dark" />Loading analytics</main>;
  const selectedRange = analytics.ranges[range];
  return <main className="dashboard-shell">
    <DashboardHeader activePath="/analytics" />
    <div className="dashboard-content analytics-content">
      <div className="dashboard-heading"><div><p className="eyebrow">Patterns and signals</p><h1>Analytics</h1><p>Understand how VoiceGuard is identifying risk over time.</p></div></div>
      <section className="analytics-trend"><div className="analytics-section-heading"><div><p className="eyebrow">Risk movement</p><h2>Risk trend</h2></div><div className="range-tabs" role="group" aria-label="Risk trend time range">{['7d', '30d', '90d'].map((option) => <button key={option} className={range === option ? 'selected' : ''} type="button" onClick={() => setRange(option)}>{option}</button>)}</div></div><TrendChart points={selectedRange.points} startLabel={selectedRange.startLabel} /></section>
      <div className="analytics-grid"><section className="analytics-panel"><div className="analytics-section-heading"><div><p className="eyebrow">Call distribution</p><h2>Risk level</h2></div></div><RiskDonut breakdown={analytics.riskBreakdown} /></section><section className="analytics-panel"><div className="analytics-section-heading"><div><p className="eyebrow">Detection signals</p><h2>Detection type</h2></div></div><DetectionBreakdown items={analytics.detectionBreakdown} /></section></div>
      <section className="analytics-panel heatmap-panel"><div className="analytics-section-heading"><div><p className="eyebrow">Suspicious activity</p><h2>When calls need attention</h2><p>Suspicious calls by day and time of day.</p></div></div><TimeHeatmap pattern={analytics.timePattern} /></section>
    </div>
  </main>;
}

function RiskBadge({ level }) {
  return <span className={`risk-badge ${level}`}><i />{riskLabels[level]}</span>;
}

function CallHistoryRow({ call }) {
  return <a className="history-row" href={`/call-history/${call.id}`}>
    <span className="history-caller"><strong>{call.name}</strong><small>{call.caller}</small></span>
    <span className="history-date"><strong>{call.date}</strong><small>{call.time}</small></span>
    <span className="history-duration">{call.duration}</span>
    <RiskBadge level={call.risk} />
    <span className="history-score">{call.score}<small>/100</small></span>
    <span className="history-detection">{call.detection}</span>
    <span className="history-arrow" aria-hidden="true">↗</span>
  </a>;
}

function CallHistory() {
  const [calls, setCalls] = useState(null);
  const [search, setSearch] = useState('');
  const [risk, setRisk] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState('date');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    api.getCalls().then((response) => setCalls(response.payload));
  }, []);

  const filteredCalls = useMemo(() => {
    if (!calls) return [];
    return calls.filter((call) => {
      const matchesSearch = `${call.caller} ${call.name}`.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = risk === 'all' || call.risk === risk;
      const matchesFrom = !fromDate || call.date >= fromDate;
      const matchesTo = !toDate || call.date <= toDate;
      return matchesSearch && matchesRisk && matchesFrom && matchesTo;
    }).sort((first, second) => sort === 'score' ? second.score - first.score : second.date.localeCompare(first.date));
  }, [calls, search, risk, fromDate, toDate, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / pageSize));
  const visibleCalls = filteredCalls.slice((page - 1) * pageSize, page * pageSize);
  const updateFilter = (setter) => (event) => { setter(event.target.value); setPage(1); };

  if (!calls) return <main className="dashboard-loading"><span className="spinner dark" />Loading call history</main>;

  return <main className="dashboard-shell">
    <DashboardHeader activePath="/call-history" />
    <div className="dashboard-content history-content">
      <div className="dashboard-heading"><div><p className="eyebrow">Protected calls</p><h1>Call history</h1><p>Review every call analyzed by VoiceGuard.</p></div></div>
      <section className="history-toolbar" aria-label="Call history filters"><label className="search-field"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search number or name" value={search} onChange={updateFilter(setSearch)} /></label><label><span>Risk level</span><select value={risk} onChange={updateFilter(setRisk)}><option value="all">All levels</option><option value="safe">Safe</option><option value="suspicious">Suspicious</option><option value="high-risk">High risk</option></select></label><label><span>From</span><input type="date" value={fromDate} onChange={updateFilter(setFromDate)} /></label><label><span>To</span><input type="date" value={toDate} onChange={updateFilter(setToDate)} /></label><label><span>Sort by</span><select value={sort} onChange={updateFilter(setSort)}><option value="date">Newest first</option><option value="score">Highest risk</option></select></label></section>
      <div className="history-summary"><span>{filteredCalls.length} {filteredCalls.length === 1 ? 'call' : 'calls'}</span><span>All times shown in your local timezone</span></div>
      <section className="history-table" aria-label="Past calls"><div className="history-header" aria-hidden="true"><span>Caller</span><span>Date & time</span><span>Duration</span><span>Risk level</span><span>Score</span><span>Detection</span><span /></div>{visibleCalls.length ? visibleCalls.map((call) => <CallHistoryRow key={call.id} call={call} />) : <div className="history-empty"><div className="empty-icon">+</div><h2>{calls.length === 0 ? 'No calls recorded yet' : 'No calls match these filters'}</h2><p>{calls.length === 0 ? 'Calls made or received on your VoiceGuard Android mobile app will automatically sync here.' : 'Try changing the search or filter range.'}</p></div>}</section>
      {totalPages > 1 && <nav className="pagination" aria-label="Call history pagination"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Next</button></nav>}
    </div>
  </main>;
}

function DetailResult({ detected, confidence }) {
  return <div className="result-line"><span className={`result-icon ${detected ? 'negative' : 'positive'}`}>{detected ? '!' : '✓'}</span><div><strong>{detected ? 'Detected' : 'Not detected'}</strong><small>{detected ? `Confidence ${confidence}%` : `Confidence ${confidence}%`}</small></div></div>;
}

function CallDetails({ id }) {
  const [report, setReport] = useState(undefined);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.getCallById(id).then((response) => setReport(response.payload || null));
  }, [id]);

  const performAction = async (action, label) => {
    await api[action](id);
    setToast(label);
    window.setTimeout(() => setToast(''), 2600);
  };

  if (report === undefined) return <main className="dashboard-loading"><span className="spinner dark" />Loading call report</main>;

  if (!report) {
    return (
      <main className="dashboard-shell">
        <DashboardHeader activePath="/call-history" />
        <div className="dashboard-content detail-content">
          <a className="back-link" href="/call-history">← Back to call history</a>
          <div className="history-empty" style={{ marginTop: '40px' }}>
            <div className="empty-icon">!</div>
            <h2>Call report not found</h2>
            <p>No call record found matching ID "{id}".</p>
          </div>
        </div>
      </main>
    );
  }

  return <main className="dashboard-shell">
    <DashboardHeader activePath="/call-history" />
    <div className="dashboard-content detail-content">
      <a className="back-link" href="/call-history">← Back to call history</a>
      <div className="detail-heading"><div><p className="eyebrow">Call report · {report.id}</p><h1>{report.name}</h1><p>{report.caller}</p></div><RiskBadge level={report.risk} /></div>
      <div className="detail-layout">
        <aside className="detail-sidebar">
          <section className={`score-card ${report.risk}`}><span>Overall risk score</span><strong>{report.score}</strong><small>out of 100</small><div className="score-scale"><i style={{ width: `${report.score}%` }} /></div><p>{report.score >= 75 ? 'High likelihood of risk' : report.score >= 40 ? 'Some signals need review' : 'Low likelihood of risk'}</p></section>
          <section className="detail-section caller-section"><h2>Caller information</h2><dl><div><dt>Number</dt><dd>{report.caller}</dd></div><div><dt>Name</dt><dd>{report.name}</dd></div><div><dt>Carrier</dt><dd>{report.carrier}</dd></div><div><dt>Location</dt><dd>{report.location}</dd></div></dl></section>
          <section className="detail-section"><h2>Call details</h2><dl><div><dt>Date</dt><dd>{report.date}</dd></div><div><dt>Time</dt><dd>{report.time}</dd></div><div><dt>Duration</dt><dd>{report.duration}</dd></div></dl></section>
        </aside>
        <div className="detail-report">
          <section className="report-section"><div className="section-heading"><div><p className="eyebrow">Voice analysis</p><h2>Detection results</h2></div></div><div className="result-grid"><div className="result-card"><span>AI / synthetic voice</span><DetailResult detected={report.ai.detected} confidence={report.ai.confidence} /></div><div className="result-card"><span>Speaker verification</span><div className="result-line"><span className={`result-icon ${report.speaker.result === 'match' ? 'positive' : 'negative'}`}>{report.speaker.result === 'match' ? '✓' : '!'}</span><div><strong>{report.speaker.label}</strong><small>{report.speaker.explanation}</small></div></div></div></div></section>
          <section className="report-section"><div className="section-heading"><div><p className="eyebrow">Call context</p><h2>Scam indicators</h2></div></div>{report.indicators.length ? <ul className="indicator-list">{report.indicators.map((indicator) => <li key={indicator.title}><span>!</span><div><strong>{indicator.title}</strong><p>{indicator.explanation}</p></div></li>)}</ul> : <p className="quiet-copy">No specific scam indicators were found in this call.</p>}</section>
          <section className="report-section"><div className="section-heading"><div><p className="eyebrow">Risk breakdown</p><h2>Reasons for this risk score</h2></div></div><div className="reason-list">{report.reasons.map((reason) => <div className="reason" key={reason.label}><div><span>{reason.label}</span><strong>{reason.value}</strong></div><div className="reason-track"><i style={{ width: `${reason.value}%` }} /></div></div>)}</div></section>
          <section className="recommendation"><div><p className="eyebrow">Recommended action</p><h2>{report.recommendation.title}</h2><p>{report.recommendation.text}</p></div><div className="action-buttons"><button type="button" onClick={() => performAction('blockCall', 'Number blocked for future calls.')}>Block</button><button type="button" onClick={() => performAction('reportCall', 'Call reported to the VoiceGuard network.')}>Report</button><button type="button" className="button-quiet" onClick={() => performAction('dismissCall', 'Alert dismissed.')}>Dismiss</button></div></section>
        </div>
      </div>
    </div>
    {toast && <div className="toast" role="status">✓ {toast}</div>}
  </main>;
}

function ContactCard({ contact, onRemove }) {
  const isOnline = Boolean(contact.is_online);
  return (
    <article className="contact-card">
      <div className="contact-avatar" aria-hidden="true">
        {contact.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
      </div>
      <div className="contact-info">
        <h2>{contact.name}</h2>
        <p>{contact.number}</p>
        <span className={`verified-label ${isOnline ? 'is-live' : ''}`}>
          <i className={isOnline ? 'pulse-green' : ''} />
          {isOnline ? 'Active on Android app' : contact.verifiedDate}
        </span>
      </div>
      <button className="remove-contact" type="button" onClick={() => onRemove(contact)}>Remove</button>
    </article>
  );
}

function Contacts() {
  const [contacts, setContacts] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', number: '' });
  const [formError, setFormError] = useState('');
  const [pendingRemove, setPendingRemove] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.getContacts().then((response) => setContacts(response.payload));
  }, []);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFormError('');
  };

  const addContact = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.number.trim()) {
      setFormError('Name and number are required.');
      return;
    }
    const response = await api.addContact(form);
    setContacts((current) => [...current, response.payload]);
    setForm({ name: '', number: '' });
    setShowForm(false);
    notify(`${response.payload.name} added as a trusted contact.`);
  };

  const removeContact = async () => {
    await api.removeContact(pendingRemove.id);
    setContacts((current) => current.filter((contact) => contact.id !== pendingRemove.id));
    notify(`${pendingRemove.name} removed from trusted contacts.`);
    setPendingRemove(null);
  };

  const filteredContacts = contacts?.filter((contact) => contact.name.toLowerCase().includes(search.toLowerCase())) || [];

  if (!contacts) return <main className="dashboard-loading"><span className="spinner dark" />Loading contacts</main>;

  return <main className="dashboard-shell">
    <DashboardHeader activePath="/contacts" />
    <div className="dashboard-content contacts-content">
      <div className="dashboard-heading"><div><p className="eyebrow">Speaker verification</p><h1>Trusted contacts</h1><p>Known people can be matched during call analysis.</p></div><button className="add-contact-button" type="button" onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close' : '+ Add contact'}</button></div>
      <section className="contact-explainer"><span className="explainer-mark">✓</span><div><strong>Why trusted contacts?</strong><p>VoiceGuard uses these contacts to verify familiar speakers and reduce false positives on calls from people you know.</p></div></section>
      {showForm && <form className="contact-form" onSubmit={addContact}><div><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" value={form.name} onChange={updateForm} placeholder="e.g. Alex Smith" /></div><div><label htmlFor="contact-number">Phone number or email</label><input id="contact-number" name="number" type="text" value={form.number} onChange={updateForm} placeholder="e.g. +1 (555) 019-2834 or email" /></div><button type="submit">Verify and add</button>{formError && <p role="alert">{formError}</p>}</form>}
      <div className="contacts-toolbar"><label className="contact-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search by name" value={search} onChange={(event) => setSearch(event.target.value)} /></label><span>{filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}</span></div>
      {filteredContacts.length ? <div className="contact-list">{filteredContacts.map((contact) => <ContactCard key={contact.id} contact={contact} onRemove={setPendingRemove} />)}</div> : <section className="contacts-empty"><div className="empty-icon">+</div><h2>{contacts.length ? 'No contacts match your search' : 'No trusted contacts yet'}</h2><p>{contacts.length ? 'Try a different name.' : 'Add people you know so speaker verification can recognize their calls and reduce false positives.'}</p>{!contacts.length && <button type="button" onClick={() => setShowForm(true)}>Add your first contact</button>}</section>}
    </div>
    {pendingRemove && <div className="confirm-backdrop" role="presentation"><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="remove-title"><p className="eyebrow">Remove contact</p><h2 id="remove-title">Remove {pendingRemove.name}?</h2><p>Future calls from this person will no longer use their trusted voice profile.</p><div><button type="button" className="button-quiet" onClick={() => setPendingRemove(null)}>Cancel</button><button type="button" onClick={removeContact}>Remove contact</button></div></section></div>}
    {toast && <div className="toast" role="status">✓ {toast}</div>}
  </main>;
}

function SettingToggle({ id, label, description, checked, onChange }) {
  return <label className="setting-toggle" htmlFor={id}><span><strong>{label}</strong><small>{description}</small></span><input id={id} type="checkbox" checked={checked} onChange={onChange} /><i aria-hidden="true" /></label>;
}

function Settings() {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.getProfile().then((response) => { setProfile(response.payload); setDraft(response.payload); });
  }, []);

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const updatePreference = async (field, value) => {
    const next = { ...profile, preferences: { ...profile.preferences, [field]: value } };
    setProfile(next);
    setDraft(next);
    await api.updateProfile(next);
    notify('Security preference saved.');
  };
  const saveProfile = async (event) => {
    event.preventDefault();
    const response = await api.updateProfile(draft);
    setProfile(response.payload);
    setDraft(response.payload);
    setEditing(false);
    notify('Profile saved.');
  };
  const updatePassword = async (event) => {
    event.preventDefault();
    if (!password.current || !password.next || password.next !== password.confirm) {
      setPasswordError('Enter your current password and matching new passwords.');
      return;
    }
    await api.updateProfile({ password });
    setPassword({ current: '', next: '', confirm: '' });
    setPasswordError('');
    notify('Password updated.');
  };

  if (!profile) return <main className="dashboard-loading"><span className="spinner dark" />Loading settings</main>;
  const initials = profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2);
  return <main className="dashboard-shell">
    <DashboardHeader activePath="/settings" />
    <div className="dashboard-content settings-content">
      <div className="dashboard-heading"><div><p className="eyebrow">Account controls</p><h1>Settings</h1><p>Manage your profile, security preferences, and account.</p></div></div>
      <form className="settings-section profile-section" onSubmit={saveProfile}><div className="settings-section-heading"><div><p className="eyebrow">Profile</p><h2>Your information</h2><p>Used to identify your account and contact you about protection.</p></div>{editing ? <button className="settings-button primary" type="submit">Save changes</button> : <button className="settings-button" type="button" onClick={() => setEditing(true)}>Edit profile</button>}</div><div className="profile-fields"><div className="avatar-placeholder" aria-label={`Avatar for ${profile.name}`}>{initials}</div><div className="settings-field"><label htmlFor="profile-name">Name</label><input id="profile-name" value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} disabled={!editing} /></div><div className="settings-field"><label htmlFor="profile-email">Email</label><input id="profile-email" type="email" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} disabled={!editing} /></div><div className="settings-field"><label htmlFor="profile-phone">Phone number</label><input id="profile-phone" type="tel" value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} disabled={!editing} /></div></div></form>
      <section className="settings-section"><div className="settings-section-heading"><div><p className="eyebrow">Security preferences</p><h2>Protection settings</h2><p>Choose how much activity VoiceGuard should surface and block.</p></div></div><div className="preference-group"><div className="threshold-setting"><div><strong>Risk sensitivity</strong><small>Higher sensitivity flags more calls for review.</small></div><div className="threshold-options" role="group" aria-label="Risk sensitivity">{['low', 'medium', 'high'].map((option) => <button key={option} className={profile.preferences.riskThreshold === option ? 'selected' : ''} type="button" onClick={() => updatePreference('riskThreshold', option)}>{option}</button>)}</div></div><SettingToggle id="email-alerts" label="Email alerts for high-risk calls" description="Send an email when a call reaches the high-risk band." checked={profile.preferences.emailAlerts} onChange={(event) => updatePreference('emailAlerts', event.target.checked)} /><SettingToggle id="weekly-summary" label="Weekly summary email" description="Receive a weekly overview of your protected calls." checked={profile.preferences.weeklySummary} onChange={(event) => updatePreference('weeklySummary', event.target.checked)} /><SettingToggle id="auto-block" label="Auto-block high-risk numbers" description="Automatically block numbers that receive a high-risk result." checked={profile.preferences.autoBlock} onChange={(event) => updatePreference('autoBlock', event.target.checked)} /></div></section>
      <section className="settings-section"><div className="settings-section-heading"><div><p className="eyebrow">Account</p><h2>Password and devices</h2></div></div><form className="password-form" onSubmit={updatePassword}><div className="settings-field"><label htmlFor="current-password">Current password</label><input id="current-password" type="password" value={password.current} onChange={(event) => setPassword((current) => ({ ...current, current: event.target.value }))} /></div><div className="settings-field"><label htmlFor="new-password">New password</label><input id="new-password" type="password" value={password.next} onChange={(event) => setPassword((current) => ({ ...current, next: event.target.value }))} /></div><div className="settings-field"><label htmlFor="confirm-new-password">Confirm new password</label><input id="confirm-new-password" type="password" value={password.confirm} onChange={(event) => setPassword((current) => ({ ...current, confirm: event.target.value }))} /></div><button className="settings-button primary" type="submit">Change password</button>{passwordError && <p className="settings-error" role="alert">{passwordError}</p>}</form><div className="device-status"><div className="device-icon">⌁</div><div><strong>VoiceGuard mobile app</strong><span><i />{profile.device.status}</span><small>Last sync {profile.device.lastSync}</small></div></div><a className="logout-link" href="/login">Log out of VoiceGuard</a></section>
      <section className="settings-section danger-section"><div className="settings-section-heading"><div><p className="eyebrow">Danger zone</p><h2>Delete account</h2><p>Delete your profile, preferences, and call history permanently.</p></div><button className="danger-button" type="button" onClick={() => setDeleteOpen(true)}>Delete account</button></div></section>
    </div>
    {deleteOpen && <div className="confirm-backdrop" role="presentation"><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><p className="eyebrow">Danger zone</p><h2 id="delete-title">Delete your account?</h2><p>This cannot be undone. Your profile, settings, and call history will be permanently removed.</p><div><button type="button" className="button-quiet" onClick={() => setDeleteOpen(false)}>Cancel</button><button type="button" className="danger-button" onClick={() => { setDeleteOpen(false); notify('Account deletion is unavailable in this demo.'); }}>Delete account</button></div></section></div>}
    {toast && <div className="toast" role="status">✓ {toast}</div>}
  </main>;
}

function AuthPage({ register }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', remember: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState('');

  if (submitted) return <SuccessScreen />;

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setNotice('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form, register);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      if (register) await api.register(form);
      else await api.login(form);
      window.localStorage.setItem('voiceguard-authenticated', 'true');
      navigateTo('/dashboard');
    } catch (err) {
      setNotice(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <div className="auth-wrap">
        <Logo />
        <div className="auth-stage">
        <section className="auth-card">
          <p className="eyebrow">Secure access</p>
          <h1>{register ? 'Create your account' : 'Sign in to VoiceGuard'}</h1>
          <p className="intro">{register ? 'Set up access to your security workspace.' : 'Enter your details to continue.'}</p>
          <form onSubmit={submit} noValidate>
            {register && <Field id="name" label="Name" value={form.name} onChange={update} error={errors.name} autoComplete="name" />}
            <Field id="email" label="Email address" type="email" value={form.email} onChange={update} error={errors.email} autoComplete="email" />
            <Field id="password" label="Password" type="password" value={form.password} onChange={update} error={errors.password} autoComplete={register ? 'new-password' : 'current-password'} />
            {register ? <Field id="confirmPassword" label="Confirm password" type="password" value={form.confirmPassword} onChange={update} error={errors.confirmPassword} autoComplete="new-password" /> : <div className="form-options"><label className="checkbox-label"><input type="checkbox" name="remember" checked={form.remember} onChange={update} /> <span>Remember me</span></label><a href="/forgot-password" onClick={(event) => { event.preventDefault(); setNotice('Password recovery is not available in this demo.'); }}>Forgot password?</a></div>}
            {notice && <p className="form-error" role="alert">{notice}</p>}
            <button className={`submit-button ${loading ? 'is-loading' : ''}`} disabled={loading} type="submit"><span className="button-label">{register ? 'Create account' : 'Sign in'}</span><span className="spinner" aria-hidden="true" /></button>
          </form>
          <p className="switch-prompt">{register ? 'Already have an account?' : 'Need an account?'} <a href={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Register'}</a></p>
        </section>
        <MobileGuardPreview />
        </div>
        <p className="legal">Access is monitored and protected.</p>
      </div>
    </main>
  );
}

function App() {
  const [liveNotice, setLiveNotice] = useState('');
  const isAuthenticated = () => Boolean(window.localStorage.getItem('vg_token'));
  const requestedInitialPath = window.location.pathname;
  const initialPath = isAuthenticated() && ['/', '/login', '/register'].includes(requestedInitialPath)
    ? '/dashboard'
    : !isAuthenticated() && protectedPaths.some((path) => requestedInitialPath === path || requestedInitialPath.startsWith(`${path}/`))
      ? '/login'
      : requestedInitialPath;
  const [currentPath, setCurrentPath] = useState(initialPath);

  // Verify authentication with backend database on app load
  useEffect(() => {
    if (isAuthenticated()) {
      api.getProfile().catch(() => {
        window.localStorage.removeItem('vg_token');
        window.localStorage.removeItem('vg_user');
        window.localStorage.removeItem('voiceguard-authenticated');
        navigateTo('/login');
      });
    }
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem('vg_token');
    if (token && isAuthenticated()) {
      connectSignaling(token);
    }
    const removeListener = addSignalingListener((msg) => {
      if (msg.type === 'call.incoming') {
        setLiveNotice(`📱 Incoming call on Android app from ${msg.sender_name || 'caller'}...`);
        window.setTimeout(() => setLiveNotice(''), 6000);
      } else if (msg.type === 'call.ended') {
        setLiveNotice(`📱 Call ended on Android app. Synced to call history & reports.`);
        window.setTimeout(() => setLiveNotice(''), 6000);
      } else if (msg.type === 'call.accepted') {
        setLiveNotice(`📱 Call connected on Android app.`);
        window.setTimeout(() => setLiveNotice(''), 6000);
      }
    });
    return () => removeListener();
  }, [currentPath]);

  useEffect(() => {
    if (window.location.pathname !== initialPath) window.history.replaceState({}, '', initialPath);
    const handleNavigation = (event) => {
      const link = event.target.closest('a');
      if (!link || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.origin !== window.location.origin || link.pathname === window.location.pathname && link.hash) return;
      event.preventDefault();
      if (link.dataset.signout === 'true') {
        window.localStorage.removeItem('voiceguard-authenticated');
        window.localStorage.removeItem('vg_token');
        window.localStorage.removeItem('vg_user');
        disconnectSignaling();
      }
      const requestedPath = link.dataset.signout === 'true' ? '/login' : link.pathname;
      const nextPath = isAuthenticated() && ['/', '/login', '/register'].includes(requestedPath)
        ? '/dashboard'
        : !isAuthenticated() && protectedPaths.some((path) => requestedPath === path || requestedPath.startsWith(`${path}/`))
          ? '/login'
          : requestedPath;
      window.history.pushState({}, '', nextPath);
      setCurrentPath(nextPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handlePopState = () => setCurrentPath(window.location.pathname);
    document.addEventListener('click', handleNavigation);
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.removeEventListener('click', handleNavigation);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  let page;
  if (currentPath === '/') page = <><Navbar /><Hero /></>;
  else if (currentPath === '/dashboard') page = <Dashboard />;
  else if (currentPath === '/analytics') page = <Analytics />;
  else if (currentPath === '/call-history') page = <CallHistory />;
  else if (currentPath === '/alerts') page = <Alerts />;
  else {
    const detailMatch = currentPath.match(/^\/(?:call-history|calls)\/([^/]+)$/);
    if (detailMatch) page = <CallDetails id={detailMatch[1]} />;
    else if (currentPath === '/contacts') page = <Contacts />;
    else if (currentPath === '/settings') page = <Settings />;
    else if (currentPath === '/login' || currentPath === '/register') page = <AuthPage register={currentPath === '/register'} />;
    else page = isAuthenticated() ? <Dashboard /> : <AuthPage register={false} />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={currentPath} className="page-transition" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
          {page}
        </motion.div>
      </AnimatePresence>
      {liveNotice && <div className="toast" role="status">✓ {liveNotice}</div>}
    </>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
