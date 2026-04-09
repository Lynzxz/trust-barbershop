import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ── Shared micro-animation styles ──────────────────────────────────────────
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03);}
  ::-webkit-scrollbar-thumb{background:rgba(212,175,55,0.3);border-radius:4px;}

  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes floatOrb { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-40px) scale(1.04)} 66%{transform:translate(-20px,30px) scale(.96)} }
  @keyframes stampPop { 0%{transform:scale(0) rotate(-15deg);opacity:0} 70%{transform:scale(1.2) rotate(3deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes borderGlow { 0%,100%{opacity:.4} 50%{opacity:1} }
  @keyframes tickerScroll { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }

  .fade-up   { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
  .fade-in   { animation: fadeIn .4s ease both; }
  .stamp-pop { animation: stampPop .45s cubic-bezier(.16,1,.3,1) both; }

  .glass {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(32px);
    border: 1px solid rgba(255,255,255,0.07);
  }
  .glass-gold {
    background: rgba(212,175,55,0.06);
    backdrop-filter: blur(32px);
    border: 1px solid rgba(212,175,55,0.18);
  }
  .gold-text {
    background: linear-gradient(135deg,#d4af37,#f5d778);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .tab-btn {
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    border: none;
    transition: all .25s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .tab-btn.active {
    background: linear-gradient(135deg,#d4af37,#b8962e);
    color: #080b12;
    box-shadow: 0 4px 16px rgba(212,175,55,0.25);
  }
  .tab-btn.inactive {
    background: transparent;
    color: rgba(255,255,255,0.45);
  }
  .tab-btn.inactive:hover {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.8);
  }
  .stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 20px;
    transition: all .3s ease;
    position: relative;
    overflow: hidden;
  }
  .stat-card:hover {
    border-color: rgba(212,175,55,0.3);
    background: rgba(212,175,55,0.04);
    transform: translateY(-2px);
  }
  .input-field {
    width: 100%;
    background: rgba(255,255,255,0.04);
    color: #e8eaf0;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1.5px solid rgba(255,255,255,0.08);
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: all .3s ease;
    outline: none;
  }
  .input-field:focus {
    border-color: rgba(212,175,55,0.5);
    box-shadow: 0 0 0 3px rgba(212,175,55,0.07);
    background: rgba(255,255,255,0.06);
  }
  .btn-gold {
    background: linear-gradient(135deg,#d4af37 0%,#f5d778 40%,#d4af37 60%,#b8962e 100%);
    background-size: 200% auto;
    color: #080b12;
    border: none;
    border-radius: 10px;
    padding: 12px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all .3s ease;
    letter-spacing: .03em;
  }
  .btn-gold:hover:not(:disabled) {
    background-position: right center;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(212,175,55,0.3);
  }
  .btn-ghost {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.6);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 12px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all .25s ease;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.09); color: #fff; }
  .visit-row { transition: background .2s ease; }
  .visit-row:hover { background: rgba(212,175,55,0.05); }
  .badge-open  { background: rgba(34,197,94,.15); color: #4ade80; border: 1px solid rgba(34,197,94,.2); }
  .badge-closed{ background: rgba(239,68,68,.15);  color: #f87171; border: 1px solid rgba(239,68,68,.2); }
  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: .08em; }
  label { display: block; font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
`;

// ── Toast notification ─────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    const bg = type === 'success' ? 'rgba(34,197,94,.12)' : type === 'error' ? 'rgba(239,68,68,.12)' : 'rgba(212,175,55,.12)';
    const border = type === 'success' ? 'rgba(34,197,94,.25)' : type === 'error' ? 'rgba(239,68,68,.25)' : 'rgba(212,175,55,.25)';
    const color = type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#f5d778';
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '✦';
    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px',
            background: bg, border: `1px solid ${border}`, backdropFilter: 'blur(20px)',
            padding: '12px 18px', borderRadius: '12px',
            animation: 'fadeUp .3s ease',
            fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color,
        }}>
            <span style={{ fontWeight: 700 }}>{icon}</span> {msg}
        </div>
    );
}

// ── Confirm Modal ──────────────────────────────────────────────────────────
function ConfirmModal({ msg, onConfirm, onCancel }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div className="glass" style={{ borderRadius: '20px', padding: '28px', maxWidth: '360px', width: '100%', animation: 'fadeUp .3s ease' }}>
                <p style={{ color: '#e8eaf0', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>{msg}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-gold" style={{ flex: 1 }} onClick={onConfirm}>Confirm</button>
                    <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
function MemberPanel({ token, setToken }) {
    const [dashboard, setDashboard] = useState({
        member: {}, shopProfile: {}, recentVisits: [], events: [],
        loyalty: { rule: 7, visits_until_free: 0, progress_percent: 0, current_stamps: 0, free_coupons: 0 }
    });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', address: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [animatedStamps, setAnimatedStamps] = useState([]);

    const headers = { Authorization: `Bearer ${token}` };
    const showToast = (msg, type = 'success') => setToast({ msg, type });

    useEffect(() => {
        fetchDashboard();
        const handleMouseMove = (e) => setMousePos({ x: (e.clientX / window.innerWidth - .5) * 16, y: (e.clientY / window.innerHeight - .5) * 16 });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []); // eslint-disable-line

    useEffect(() => {
        const stamps = dashboard.loyalty?.current_stamps || 0;
        setAnimatedStamps([]);
        for (let i = 0; i < stamps; i++) {
            setTimeout(() => setAnimatedStamps(p => [...p, i]), i * 80);
        }
    }, [dashboard.loyalty?.current_stamps, activeTab]);

    const fetchDashboard = async () => {
        try {
            const res = await axios.get(`${API}/api/member/dashboard`, { headers });
            setDashboard(res.data);
            setProfileForm({ full_name: res.data.member?.full_name || '', phone: res.data.member?.phone || '', address: res.data.member?.address || '', email: res.data.member?.email || '' });
        } catch (err) { console.error(err); }
    };

    const updateProfile = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await axios.put(`${API}/api/member/profile`, profileForm, { headers });
            showToast('Profile updated successfully!');
            setEditingProfile(false);
            fetchDashboard();
        } catch (err) { showToast(err.response?.data?.error || err.message, 'error'); }
        finally { setLoading(false); }
    };

    const useFreeCoupon = () => {
        if ((dashboard.loyalty?.free_coupons || 0) <= 0) { showToast('No free coupons available!', 'error'); return; }
        setConfirm({
            msg: 'Use 1 free coupon for a free haircut + shampoo?',
            onConfirm: async () => {
                setConfirm(null); setLoading(true);
                try {
                    await axios.post(`${API}/api/member/use-coupon`, {}, { headers });
                    showToast('Free service recorded! Enjoy your haircut! 🎉');
                    fetchDashboard();
                } catch (err) { showToast(err.response?.data?.error || err.message, 'error'); }
                finally { setLoading(false); }
            },
            onCancel: () => setConfirm(null)
        });
    };

    const logout = () => { localStorage.clear(); setToken(null); };

    // Safe accessors
    const shopName     = dashboard.shopProfile?.name        || 'Trust Barbershop';
    const shopLogo     = dashboard.shopProfile?.logo_url    || null;
    const shopOpen     = !!dashboard.shopProfile?.is_open;
    const memberName   = dashboard.member?.full_name        || '';
    const memberUsername = dashboard.member?.username       || '';
    const totalVisits  = dashboard.member?.total_visits     || 0;
    const freeCoupons  = dashboard.loyalty?.free_coupons    || 0;
    const memberSince  = dashboard.member?.member_since     || new Date();
    const currentStamps = dashboard.loyalty?.current_stamps || 0;
    const loyaltyRule  = dashboard.loyalty?.rule            || 7;
    const visitsUntilFree = dashboard.loyalty?.visits_until_free ?? 0;
    const progressPercent = dashboard.loyalty?.progress_percent  || 0;

    const tabs = [
        { id: 'dashboard', icon: '◈', label: 'Dashboard' },
        { id: 'loyalty',   icon: '✦', label: 'Loyalty'   },
        { id: 'history',   icon: '◎', label: 'History'   },
        { id: 'events',    icon: '◇', label: 'Events'    },
        { id: 'profile',   icon: '◉', label: 'Profile'   },
    ];

    const initials = memberName ? memberName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : '?';

    return (
        <div style={{ minHeight: '100vh', background: '#080b12', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
            <style>{GLOBAL_STYLE}</style>

            {/* Ambient orbs */}
            <div style={{ position: 'fixed', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)', top: '-100px', left: '-150px', animation: 'floatOrb 20s ease-in-out infinite', pointerEvents: 'none', transform: `translate(${mousePos.x*.25}px,${mousePos.y*.25}px)`, transition: 'transform .1s ease-out', zIndex: 0 }} />
            <div style={{ position: 'fixed', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', bottom: '-80px', right: '-80px', animation: 'floatOrb 26s ease-in-out infinite reverse', pointerEvents: 'none', transform: `translate(${-mousePos.x*.15}px,${-mousePos.y*.15}px)`, transition: 'transform .1s ease-out', zIndex: 0 }} />
            {/* Grid overlay */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

            {/* Ticker */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, height: '28px', background: 'rgba(212,175,55,0.07)', borderBottom: '1px solid rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <div style={{ whiteSpace: 'nowrap', color: 'rgba(212,175,55,0.5)', fontSize: '10px', letterSpacing: '.15em', fontWeight: '600', animation: 'tickerScroll 28s linear infinite' }}>
                    ✦ TRUST BARBERSHOP &nbsp;&nbsp;&nbsp; MEMBER PORTAL &nbsp;&nbsp;&nbsp; PREMIUM LOYALTY PROGRAM &nbsp;&nbsp;&nbsp; ✦ TRUST BARBERSHOP &nbsp;&nbsp;&nbsp; MEMBER PORTAL &nbsp;&nbsp;&nbsp; PREMIUM LOYALTY PROGRAM &nbsp;&nbsp;&nbsp;
                </div>
            </div>

            {/* ── HEADER ── */}
            <header style={{ position: 'sticky', top: '28px', zIndex: 30, background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {shopLogo
                            ? <img src={shopLogo} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
                            : <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#d4af37,#b8962e)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>✂</div>
                        }
                        <div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '700', color: '#fff' }}>
                                Trust <span className="gold-text">Barbershop</span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Member Portal</div>
                        </div>
                    </div>
                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className={`badge ${shopOpen ? 'badge-open' : 'badge-closed'}`}>{shopOpen ? 'OPEN' : 'CLOSED'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '20px' }}>
                            <div style={{ width: '26px', height: '26px', background: 'linear-gradient(135deg,#d4af37,#b8962e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#080b12' }}>{initials}</div>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{memberName || memberUsername}</span>
                        </div>
                        <button onClick={logout} style={{ padding: '7px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f87171', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all .2s', fontFamily: "'DM Sans', sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                        >Logout</button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '0 24px' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px', paddingTop: '8px' }}>
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'active' : 'inactive'}`}>
                                <span style={{ fontSize: '14px' }}>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 60px', position: 'relative', zIndex: 1 }}>

                {/* ═══ DASHBOARD ═══ */}
                {activeTab === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Welcome banner */}
                        <div className="glass-gold fade-up" style={{ borderRadius: '20px', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.7),transparent)', animation: 'borderGlow 3s ease-in-out infinite' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '12px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '8px', fontWeight: '600' }}>Welcome back</div>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>{memberName || memberUsername}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Your trusted barbershop in Tasikmalaya · Quality haircut, premium service</div>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="fade-up">
                            {[
                                { label: 'Total Visits', value: totalVisits, icon: '✂', accent: '#d4af37' },
                                { label: 'Free Coupons', value: freeCoupons, icon: '✦', accent: '#4ade80' },
                                { label: 'Member Since', value: new Date(memberSince).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }), icon: '◈', accent: '#67e8f9' },
                            ].map((s, i) => (
                                <div key={i} className="stat-card" style={{ animationDelay: `${i * .08}s` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '10px' }}>{s.label}</div>
                                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>{s.value}</div>
                                        </div>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.accent}15`, border: `1px solid ${s.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent, fontSize: '18px' }}>{s.icon}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Loyalty preview */}
                        <div className="glass fade-up" style={{ borderRadius: '16px', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Loyalty Progress</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{currentStamps} / {loyaltyRule} visits</div>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
                                <div style={{ height: '100%', width: progressPercent + '%', background: 'linear-gradient(90deg,#d4af37,#f5d778)', borderRadius: '6px', transition: 'width 1s cubic-bezier(.16,1,.3,1)' }} />
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                {visitsUntilFree === 0 ? '🎉 Free coupon ready!' : `${visitsUntilFree} more visit${visitsUntilFree > 1 ? 's' : ''} to earn a free haircut`}
                            </div>
                            {freeCoupons > 0 && (
                                <button className="btn-gold" style={{ marginTop: '16px', width: '100%' }} onClick={useFreeCoupon} disabled={loading}>
                                    ✦ Use Free Coupon ({freeCoupons} available)
                                </button>
                            )}
                        </div>

                        {/* Recent visits */}
                        <div className="glass fade-up" style={{ borderRadius: '16px', padding: '24px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Recent Visits</div>
                            {dashboard.recentVisits.length === 0
                                ? <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No visits yet. Book your first haircut!</div>
                                : dashboard.recentVisits.slice(0, 5).map((v, i) => (
                                    <div key={i} className="visit-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 10px', borderRadius: '10px', borderBottom: i < dashboard.recentVisits.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>{v.package?.name || '-'}</div>
                                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>by {v.barber?.name || '-'}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{new Date(v.visit_date).toLocaleDateString('id-ID')}</div>
                                            {v.rating && <div style={{ color: '#fbbf24', fontSize: '12px', marginTop: '2px' }}>{'★'.repeat(v.rating)}</div>}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* ═══ LOYALTY CARD ═══ */}
                {activeTab === 'loyalty' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="fade-up">
                        {/* Card */}
                        <div className="glass-gold" style={{ borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.8),transparent)', animation: 'borderGlow 3s ease-in-out infinite' }} />
                            {/* Card header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                                <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#d4af37,#b8962e)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 6px 20px rgba(212,175,55,0.3)' }}>✂</div>
                                <div>
                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '700', color: '#fff' }}>Loyalty Card</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{shopName}</div>
                                </div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '.06em' }}>Member</div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#d4af37' }}>@{memberUsername}</div>
                                </div>
                            </div>

                            {/* Stamps grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(loyaltyRule, 7)}, 1fr)`, gap: '10px', marginBottom: '24px' }}>
                                {[...Array(loyaltyRule)].map((_, i) => {
                                    const filled = i < currentStamps;
                                    const animated = animatedStamps.includes(i);
                                    return (
                                        <div key={i} className={filled && animated ? 'stamp-pop' : ''} style={{ animationDelay: `${i * .08}s` }}>
                                            <div style={{
                                                aspectRatio: '1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                                                background: filled ? 'linear-gradient(135deg,#d4af37,#b8962e)' : 'rgba(255,255,255,0.04)',
                                                border: filled ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                color: filled ? '#080b12' : 'rgba(255,255,255,0.2)',
                                                fontWeight: '700', fontSize: '13px',
                                                boxShadow: filled ? '0 4px 12px rgba(212,175,55,0.25)' : 'none',
                                                transition: 'all .3s ease',
                                            }}>
                                                {filled ? '✓' : i + 1}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Progress */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Progress</span>
                                    <span style={{ fontSize: '12px', color: '#d4af37', fontWeight: '600' }}>{Math.round(progressPercent)}%</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: progressPercent + '%', background: 'linear-gradient(90deg,#d4af37,#f5d778)', transition: 'width 1.2s cubic-bezier(.16,1,.3,1)' }} />
                                </div>
                            </div>

                            {/* Status */}
                            <div style={{ textAlign: 'center', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div style={{ fontSize: '13px', color: visitsUntilFree === 0 ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>
                                    {visitsUntilFree === 0 ? '🎉 Congratulations! You earned a free coupon!' : `${visitsUntilFree} more visit${visitsUntilFree > 1 ? 's' : ''} to get a free haircut + shampoo`}
                                </div>
                            </div>

                            {freeCoupons > 0 && (
                                <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(34,197,94,0.08)', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#4ade80', marginBottom: '4px' }}>✦ {freeCoupons} Free Coupon{freeCoupons > 1 ? 's' : ''} Available!</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Redeem at the counter</div>
                                    <button className="btn-gold" style={{ width: '100%' }} onClick={useFreeCoupon} disabled={loading}>Use Now</button>
                                </div>
                            )}
                        </div>

                        {/* How it works */}
                        <div className="glass" style={{ borderRadius: '24px', padding: '32px' }}>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}>How It Works</div>
                            {[
                                { n: '01', title: 'Get a stamp', desc: 'Every haircut service earns you 1 stamp on your loyalty card' },
                                { n: '02', title: `Collect ${loyaltyRule} stamps`, desc: `After ${loyaltyRule} visits, you automatically earn a FREE coupon` },
                                { n: '03', title: 'Redeem for free service', desc: 'Use your coupon for a free haircut + shampoo on your next visit' },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: i < 2 ? '24px' : '0', paddingBottom: i < 2 ? '24px' : '0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <div style={{ width: '36px', height: '36px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>{s.n}</div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{s.title}</div>
                                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{s.desc}</div>
                                    </div>
                                </div>
                            ))}

                            {/* Member stats */}
                            <div style={{ marginTop: '28px', padding: '20px', background: 'rgba(212,175,55,0.05)', borderRadius: '14px', border: '1px solid rgba(212,175,55,0.12)' }}>
                                <div style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '14px', fontWeight: '600' }}>Your Stats</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {[
                                        { label: 'Total Visits', value: totalVisits },
                                        { label: 'Free Coupons', value: freeCoupons },
                                        { label: 'Current Cycle', value: `${currentStamps}/${loyaltyRule}` },
                                        { label: 'Until Next Free', value: visitsUntilFree === 0 ? 'Ready!' : visitsUntilFree },
                                    ].map((s, i) => (
                                        <div key={i} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#d4af37' }}>{s.value}</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ HISTORY ═══ */}
                {activeTab === 'history' && (
                    <div className="glass fade-up" style={{ borderRadius: '20px', padding: '28px', overflowX: 'auto' }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '20px' }}>Visit History</div>
                        {dashboard.recentVisits.length === 0
                            ? <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>No visits recorded yet.</div>
                            : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                            {['Date', 'Service', 'Barber', 'Rating', 'Notes'].map(h => (
                                                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: '600', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboard.recentVisits.map((v, i) => (
                                            <tr key={i} className="visit-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '14px 12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{new Date(v.visit_date).toLocaleDateString('id-ID')}</td>
                                                <td style={{ padding: '14px 12px', fontSize: '14px', color: '#fff', fontWeight: '500' }}>{v.package?.name || '-'}</td>
                                                <td style={{ padding: '14px 12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{v.barber?.name || '-'}</td>
                                                <td style={{ padding: '14px 12px' }}>{v.rating ? <span style={{ color: '#fbbf24', fontSize: '13px' }}>{'★'.repeat(v.rating)}</span> : <span style={{ color: 'rgba(255,255,255,0.2)' }}>-</span>}</td>
                                                <td style={{ padding: '14px 12px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{v.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        }
                    </div>
                )}

                {/* ═══ EVENTS ═══ */}
                {activeTab === 'events' && (
                    <div className="fade-up">
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '20px' }}>Upcoming Events</div>
                        {dashboard.events.length === 0
                            ? <div className="glass" style={{ borderRadius: '16px', padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>No upcoming events. Check back soon!</div>
                            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {dashboard.events.map((e, i) => (
                                    <div key={i} className="glass" style={{ borderRadius: '16px', padding: '20px', transition: 'all .3s ease', cursor: 'default' }}
                                        onMouseEnter={el => { el.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; el.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={el => { el.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; el.currentTarget.style.transform = 'none'; }}
                                    >
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{ width: '42px', height: '42px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>◇</div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{e.title}</div>
                                                <div style={{ fontSize: '12px', color: 'rgba(212,175,55,0.6)', marginTop: '2px' }}>{new Date(e.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                            </div>
                                        </div>
                                        {e.location && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>📍 {e.location}</div>}
                                        {e.description && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{e.description}</div>}
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}

                {/* ═══ PROFILE ═══ */}
                {activeTab === 'profile' && (
                    <div style={{ maxWidth: '560px', margin: '0 auto' }} className="fade-up">
                        {/* Avatar card */}
                        <div className="glass-gold" style={{ borderRadius: '20px', padding: '32px', textAlign: 'center', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.7),transparent)', animation: 'borderGlow 3s ease-in-out infinite' }} />
                            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg,#d4af37,#b8962e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: '#080b12', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(212,175,55,0.3)' }}>
                                {initials}
                            </div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{memberName || 'Member'}</div>
                            <div style={{ fontSize: '13px', color: 'rgba(212,175,55,0.6)' }}>@{memberUsername}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                                {[
                                    { label: 'Visits', value: totalVisits },
                                    { label: 'Coupons', value: freeCoupons },
                                ].map((s, i) => (
                                    <div key={i} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#d4af37' }}>{s.value}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Profile details / edit */}
                        <div className="glass" style={{ borderRadius: '20px', padding: '28px' }}>
                            {!editingProfile ? (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                        {[
                                            { label: 'Full Name', value: dashboard.member?.full_name },
                                            { label: 'Email', value: dashboard.member?.email },
                                            { label: 'Phone / WA', value: dashboard.member?.phone },
                                            { label: 'Address', value: dashboard.member?.address },
                                        ].map((f, i) => (
                                            <div key={i}>
                                                <div style={{ fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>{f.label}</div>
                                                <div style={{ fontSize: '14px', color: f.value ? '#fff' : 'rgba(255,255,255,0.2)' }}>{f.value || '—'}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="btn-gold" style={{ width: '100%' }} onClick={() => setEditingProfile(true)}>Edit Profile</button>
                                </>
                            ) : (
                                <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { label: 'Full Name', key: 'full_name', type: 'text', required: true },
                                        { label: 'Email', key: 'email', type: 'email' },
                                        { label: 'Phone / WhatsApp', key: 'phone', type: 'text' },
                                        { label: 'Address', key: 'address', type: 'text' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label>{f.label}</label>
                                            <input type={f.type} value={profileForm[f.key]} onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })} className="input-field" required={f.required} />
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <button type="submit" className="btn-gold" style={{ flex: 1 }} disabled={loading}>
                                            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><span style={{ width: '14px', height: '14px', border: '2px solid rgba(8,11,18,0.3)', borderTopColor: '#080b12', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} /> Saving...</span> : 'Save Changes'}
                                        </button>
                                        <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setEditingProfile(false)}>Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            {/* Confirm */}
            {confirm && <ConfirmModal msg={confirm.msg} onConfirm={confirm.onConfirm} onCancel={confirm.onCancel} />}
        </div>
    );
}

export default MemberPanel;