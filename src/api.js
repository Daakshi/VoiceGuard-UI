const MOCK_DELAY = 700;

const resolveMockRequest = (payload) => new Promise((resolve) => {
  window.setTimeout(() => resolve({ ok: true, payload }), MOCK_DELAY);
});

export const api = {
  login(credentials) {
    return resolveMockRequest(credentials);
  },
  register(details) {
    return resolveMockRequest(details);
  },

  getProfile() {
    return resolveMockRequest({
      name: 'Avery Chen',
      email: 'avery.chen@example.com',
      phone: '+1 (415) 555-0182',
      preferences: { riskThreshold: 'medium', emailAlerts: true, weeklySummary: true, autoBlock: false },
      device: { status: 'Connected', lastSync: 'Today at 10:38 AM' },
    });
  },

  updateProfile(profile) {
    return resolveMockRequest(profile);
  },

  getOverview() {
    return resolveMockRequest({
      totalCalls: 248,
      safeCalls: 219,
      suspiciousCalls: 29,
      averageRiskScore: 31,
      trend: [18, 22, 16, 28, 24, 31, 27, 35, 30, 41, 37, 44, 39, 31],
      alerts: [
        { id: 'VG-1048', caller: '+1 (415) 555-0138', time: 'Today, 10:42 AM', score: 82, level: 'High risk' },
        { id: 'VG-1042', caller: '+1 (212) 555-0192', time: 'Today, 9:18 AM', score: 67, level: 'Suspicious' },
        { id: 'VG-1037', caller: '+1 (646) 555-0114', time: 'Yesterday, 4:06 PM', score: 58, level: 'Suspicious' },
        { id: 'VG-1029', caller: '+1 (312) 555-0177', time: 'Yesterday, 11:31 AM', score: 76, level: 'High risk' },
      ],
    });
  },

  getAnalytics() {
    return resolveMockRequest({
      ranges: {
        '7d': { points: [24, 31, 27, 35, 30, 41, 37], startLabel: '7 days ago' },
        '30d': { points: [18, 22, 16, 28, 24, 31, 27, 35, 30, 41, 37, 44, 39, 31, 34, 29, 43, 38, 47, 42, 45, 51, 48, 44, 53, 49, 57, 52, 46, 40], startLabel: '30 days ago' },
        '90d': { points: [19, 24, 21, 26, 22, 29, 25, 31, 28, 34, 30, 36, 33, 39, 35, 42, 38, 45, 41, 48, 44, 46, 43, 52, 48, 55, 51, 58, 54, 57, 53, 61, 56, 59, 55, 63, 58, 62, 57, 60, 54, 58, 51, 55, 49, 52, 47, 50, 45, 48, 43, 46, 41, 44, 39, 42, 37, 40, 35, 38, 33, 36, 31, 34, 29, 32, 27, 30, 25, 28, 23, 26, 21, 24, 22, 27, 25, 31, 28, 34, 30, 37, 33, 40, 36, 43, 39, 42, 38, 45], startLabel: '90 days ago' },
      },
      riskBreakdown: { safe: 219, suspicious: 18, 'high-risk': 11 },
      detectionBreakdown: [
        { label: 'Clean', value: 219, tone: 'safe' },
        { label: 'Spoofed caller ID', value: 12, tone: 'suspicious' },
        { label: 'AI voice detected', value: 9, tone: 'high-risk' },
        { label: 'Known scam pattern', value: 8, tone: 'high-risk' },
      ],
      timePattern: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], periods: ['Morning', 'Midday', 'Afternoon', 'Evening'], values: [[2, 3, 5, 1, 4, 1, 2], [1, 4, 3, 2, 3, 2, 1], [3, 2, 6, 2, 5, 2, 3], [2, 5, 4, 3, 4, 1, 2]] },
    });
  },

  getContacts() {
    return resolveMockRequest([
      { id: 'contact-1', name: 'Jordan Lee', number: '+1 (202) 555-0161', verifiedDate: 'Verified Sep 5, 2026' },
      { id: 'contact-2', name: 'Maya Rodriguez', number: '+1 (646) 555-0114', verifiedDate: 'Verified Aug 28, 2026' },
      { id: 'contact-3', name: 'Alex Morgan', number: '+1 (305) 555-0172', verifiedDate: 'Verified Aug 12, 2026' },
    ]);
  },

  addContact(contact) {
    return resolveMockRequest({ id: `contact-${Date.now()}`, ...contact, verifiedDate: 'Verified today' });
  },

  removeContact(id) {
    return resolveMockRequest({ removed: true, id });
  },

  getCalls() {
    return resolveMockRequest([
      { id: 'VG-1048', caller: '+1 (415) 555-0138', name: 'Unknown caller', date: '2026-09-07', time: '10:42 AM', duration: '04:18', risk: 'high-risk', score: 82, detection: 'AI voice detected' },
      { id: 'VG-1042', caller: '+1 (212) 555-0192', name: 'Unknown caller', date: '2026-09-07', time: '9:18 AM', duration: '02:51', risk: 'suspicious', score: 67, detection: 'Spoofed caller ID' },
      { id: 'VG-1037', caller: '+1 (646) 555-0114', name: 'Maya R.', date: '2026-09-06', time: '4:06 PM', duration: '08:33', risk: 'suspicious', score: 58, detection: 'Unusual call pattern' },
      { id: 'VG-1029', caller: '+1 (312) 555-0177', name: 'Unknown caller', date: '2026-09-06', time: '11:31 AM', duration: '01:27', risk: 'high-risk', score: 76, detection: 'AI voice detected' },
      { id: 'VG-1021', caller: '+1 (202) 555-0161', name: 'Jordan Lee', date: '2026-09-05', time: '2:54 PM', duration: '12:06', risk: 'safe', score: 12, detection: 'Clean' },
      { id: 'VG-1016', caller: '+1 (718) 555-0144', name: 'Unknown caller', date: '2026-09-04', time: '8:12 AM', duration: '03:44', risk: 'safe', score: 18, detection: 'Clean' },
      { id: 'VG-1009', caller: '+1 (303) 555-0184', name: 'Sam Patel', date: '2026-09-03', time: '6:40 PM', duration: '05:20', risk: 'suspicious', score: 54, detection: 'Spoofed caller ID' },
      { id: 'VG-1002', caller: '+1 (917) 555-0123', name: 'Unknown caller', date: '2026-09-02', time: '1:15 PM', duration: '00:58', risk: 'high-risk', score: 91, detection: 'AI voice detected' },
      { id: 'VG-0994', caller: '+1 (206) 555-0198', name: 'Nora Kim', date: '2026-09-01', time: '10:09 AM', duration: '07:48', risk: 'safe', score: 8, detection: 'Clean' },
      { id: 'VG-0987', caller: '+1 (617) 555-0106', name: 'Unknown caller', date: '2026-08-31', time: '3:27 PM', duration: '02:16', risk: 'suspicious', score: 61, detection: 'Unusual call pattern' },
      { id: 'VG-0979', caller: '+1 (305) 555-0172', name: 'Alex Morgan', date: '2026-08-30', time: '9:45 AM', duration: '09:11', risk: 'safe', score: 15, detection: 'Clean' },
      { id: 'VG-0970', caller: '+1 (408) 555-0118', name: 'Unknown caller', date: '2026-08-29', time: '5:03 PM', duration: '01:39', risk: 'high-risk', score: 79, detection: 'Spoofed caller ID' },
    ]);
  },

  getCallById(id) {
    const reports = {
      'VG-1048': {
        id: 'VG-1048', caller: '+1 (415) 555-0138', name: 'Unknown caller', carrier: 'T-Mobile', location: 'San Francisco, CA', date: 'September 7, 2026', time: '10:42 AM', duration: '04:18', risk: 'high-risk', score: 82,
        ai: { detected: true, confidence: 94 }, speaker: { result: 'unknown', label: 'Unknown speaker', explanation: 'No matching voice profile was found.' },
        indicators: [{ title: 'Requested a one-time passcode', explanation: 'The caller asked for an OTP, which VoiceGuard treats as sensitive account information.' }, { title: 'Urgency language detected', explanation: 'The call used time pressure to encourage an immediate decision.' }, { title: 'Matches known scam pattern', explanation: 'The call structure is similar to reported account-verification scams.' }],
        reasons: [{ label: 'Synthetic voice signal', value: 94 }, { label: 'Urgency language', value: 79 }, { label: 'Caller ID inconsistency', value: 68 }], recommendation: { title: 'Block this number', text: 'Do not share information with this caller. Blocking prevents future calls from this number.' },
      },
      'VG-1042': {
        id: 'VG-1042', caller: '+1 (212) 555-0192', name: 'Unknown caller', carrier: 'Verizon', location: 'New York, NY', date: 'September 7, 2026', time: '9:18 AM', duration: '02:51', risk: 'suspicious', score: 67,
        ai: { detected: false, confidence: 81 }, speaker: { result: 'unknown', label: 'Unknown speaker', explanation: 'No matching voice profile was found.' },
        indicators: [{ title: 'Spoofed caller ID', explanation: 'The displayed number did not match the network information for this call.' }, { title: 'Unusual call pattern', explanation: 'This caller has not contacted you before and ended the call quickly.' }],
        reasons: [{ label: 'Caller ID inconsistency', value: 76 }, { label: 'Unusual call pattern', value: 55 }, { label: 'Synthetic voice signal', value: 21 }], recommendation: { title: 'Report to VoiceGuard network', text: 'This call has suspicious signals. Reporting it helps improve protection for other members.' },
      },
      'VG-1021': {
        id: 'VG-1021', caller: '+1 (202) 555-0161', name: 'Jordan Lee', carrier: 'AT&T', location: 'Washington, DC', date: 'September 5, 2026', time: '2:54 PM', duration: '12:06', risk: 'safe', score: 12,
        ai: { detected: false, confidence: 97 }, speaker: { result: 'match', label: 'Matches Jordan Lee', explanation: 'The voice matches the saved contact profile.' },
        indicators: [], reasons: [{ label: 'Synthetic voice signal', value: 8 }, { label: 'Caller ID consistency', value: 6 }], recommendation: { title: 'No action needed', text: 'This call looks consistent with a normal conversation.' },
      },
    };
    return resolveMockRequest(reports[id] || { id, caller: 'Unknown caller', name: 'Unknown caller', carrier: 'Unavailable', location: 'Unavailable', date: 'Unknown date', time: 'Unknown time', duration: '—', risk: 'suspicious', score: 50, ai: { detected: false, confidence: 50 }, speaker: { result: 'unknown', label: 'Unknown speaker', explanation: 'No matching voice profile was found.' }, indicators: [], reasons: [], recommendation: { title: 'Review this call', text: 'No additional recommendation is available for this call.' } });
  },

  blockCall(id) {
    return resolveMockRequest({ action: 'blocked', id });
  },

  reportCall(id) {
    return resolveMockRequest({ action: 'reported', id });
  },

  dismissCall(id) {
    return resolveMockRequest({ action: 'dismissed', id });
  },
};
