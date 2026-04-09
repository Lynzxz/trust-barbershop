import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ── Global styles (same token system as Login/MemberPanel) ─────────────────
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03);}
  ::-webkit-scrollbar-thumb{background:rgba(212,175,55,0.3);border-radius:4px;}

  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes borderGlow { 0%,100%{opacity:.4} 50%{opacity:1} }
  @keyframes floatOrb { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-30px)} }
  @keyframes tickerScroll { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
  @keyframes slideInLeft { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .fade-up { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) both; }
  .fade-in { animation: fadeIn .3s ease both; }
  .slide-left { animation: slideInLeft .4s cubic-bezier(.16,1,.3,1) both; }

  .glass {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(32px);
    border: 1px solid rgba(255,255,255,0.07);
  }
  .glass-gold {
    background: rgba(212,175,55,0.05);
    backdrop-filter: blur(32px);
    border: 1px solid rgba(212,175,55,0.15);
  }
  .gold-text {
    background: linear-gradient(135deg,#d4af37,#f5d778);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all .2s ease;
    text-align: left;
    letter-spacing: .01em;
  }
  .nav-item.active {
    background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05));
    border: 1px solid rgba(212,175,55,0.2);
    color: #d4af37;
  }
  .nav-item.inactive {
    background: transparent;
    color: rgba(255,255,255,0.4);
    border: 1px solid transparent;
  }
  .nav-item.inactive:hover {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.8);
  }
  .nav-item .dot {
    width: 4px; height: 4px; border-radius: 50%; background: #d4af37;
    margin-left: auto; opacity: 0;
  }
  .nav-item.active .dot { opacity: 1; }

  .input-field {
    width: 100%;
    background: rgba(255,255,255,0.04);
    color: #e8eaf0;
    padding: 11px 14px;
    border-radius: 10px;
    border: 1.5px solid rgba(255,255,255,0.08);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    transition: all .25s ease;
    outline: none;
  }
  .input-field:focus {
    border-color: rgba(212,175,55,0.45);
    box-shadow: 0 0 0 3px rgba(212,175,55,0.07);
    background: rgba(255,255,255,0.06);
  }
  .input-field option { background: #1a1a2e; color: #e8eaf0; }

  .btn-gold {
    background: linear-gradient(135deg,#d4af37 0%,#f5d778 40%,#d4af37 60%,#b8962e 100%);
    background-size: 200% auto;
    color: #080b12;
    border: none;
    border-radius: 10px;
    padding: 11px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all .3s ease;
    letter-spacing: .03em;
  }
  .btn-gold:hover:not(:disabled) { background-position: right center; box-shadow: 0 4px 16px rgba(212,175,55,0.3); transform: translateY(-1px); }
  .btn-gold:disabled { opacity: .5; cursor: not-allowed; }

  .btn-cyan {
    background: rgba(6,182,212,0.1);
    color: #67e8f9;
    border: 1px solid rgba(6,182,212,0.2);
    border-radius: 10px;
    padding: 11px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all .25s ease;
  }
  .btn-cyan:hover:not(:disabled) { background: rgba(6,182,212,0.18); }
  .btn-cyan:disabled { opacity: .5; cursor: not-allowed; }

  .btn-red {
    background: rgba(239,68,68,0.08);
    color: #f87171;
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 8px;
    padding: 6px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all .2s ease;
  }
  .btn-red:hover { background: rgba(239,68,68,0.15); }

  .btn-edit {
    background: rgba(6,182,212,0.08);
    color: #67e8f9;
    border: 1px solid rgba(6,182,212,0.15);
    border-radius: 8px;
    padding: 6px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all .2s ease;
  }
  .btn-edit:hover { background: rgba(6,182,212,0.15); }

  .btn-ghost {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.5);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    padding: 11px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: all .2s ease;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.09); color: #fff; }

  .data-row { transition: background .15s ease; }
  .data-row:hover { background: rgba(212,175,55,0.04); }

  label { display: block; font-size: 11px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 6px; }

  .card-hover { transition: all .3s ease; }
  .card-hover:hover { transform: translateY(-2px); border-color: rgba(212,175,55,0.2) !important; }

  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: .07em; }
  .badge-open   { background: rgba(34,197,94,.12); color: #4ade80; border: 1px solid rgba(34,197,94,.2); }
  .badge-closed { background: rgba(239,68,68,.12); color: #f87171; border: 1px solid rgba(239,68,68,.2); }
  .badge-gold   { background: rgba(212,175,55,.1); color: #d4af37; border: 1px solid rgba(212,175,55,.2); }
  .badge-cyan   { background: rgba(6,182,212,.1); color: #67e8f9; border: 1px solid rgba(6,182,212,.2); }

  .stat-num { animation: countUp .5s cubic-bezier(.16,1,.3,1) both; }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 20px;
  }
  .subsection-title {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
`;

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
    const cfg = {
        success: { bg: 'rgba(34,197,94,.1)',   border: 'rgba(34,197,94,.2)',   color: '#4ade80', icon: '✓' },
        error:   { bg: 'rgba(239,68,68,.1)',    border: 'rgba(239,68,68,.2)',   color: '#f87171', icon: '✕' },
        info:    { bg: 'rgba(212,175,55,.1)',   border: 'rgba(212,175,55,.2)',  color: '#d4af37', icon: '✦' },
    }[type] || { bg: 'rgba(212,175,55,.1)', border: 'rgba(212,175,55,.2)', color: '#d4af37', icon: '✦' };
    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px', background: cfg.bg, border: `1px solid ${cfg.border}`, backdropFilter: 'blur(20px)', padding: '12px 18px', borderRadius: '12px', animation: 'fadeUp .3s ease', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: cfg.color, maxWidth: '320px' }}>
            <span style={{ fontWeight: 700, flexShrink: 0 }}>{cfg.icon}</span> {msg}
        </div>
    );
}

// ── Confirm Modal ──────────────────────────────────────────────────────────
function ConfirmModal({ msg, onConfirm, onCancel }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div className="glass" style={{ borderRadius: '20px', padding: '28px', maxWidth: '360px', width: '100%', animation: 'fadeUp .3s ease' }}>
                <p style={{ color: '#e8eaf0', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>{msg}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-red" style={{ flex: 1, padding: '10px' }} onClick={onConfirm}>Confirm</button>
                    <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({ title, fields, data, setData, onSubmit, onClose, loading, accentColor = 'rgba(212,175,55,0.2)' }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9997, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
            <div className="glass" style={{ borderRadius: '20px', padding: '28px', maxWidth: '440px', width: '100%', border: `1px solid ${accentColor}`, animation: 'fadeUp .3s ease' }} onClick={e => e.stopPropagation()}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '20px' }}>{title}</div>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {fields.map(f => (
                        <div key={f.key}>
                            <label>{f.label}</label>
                            <input type={f.type || 'text'} value={data[f.key] || ''} onChange={e => setData({ ...data, [f.key]: e.target.value })} className="input-field" required={f.required} placeholder={f.placeholder} />
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button type="submit" className="btn-gold" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
function AdminPanel({ token, setToken }) {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState(null);

    // Data
    const [chartData, setChartData] = useState([]);
    const [chartPeriod, setChartPeriod] = useState('day');
    const [dashboardStats, setDashboardStats] = useState({ totalMembers: 0, visitsThisMonth: 0, visitsToday: 0, membersWithCoupons: 0, topBarber: null });
    const [leaderboard, setLeaderboard] = useState([]);
    const [members, setMembers] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [events, setEvents] = useState([]);
    const [visits, setVisits] = useState([]);
    const [shopProfile, setShopProfile] = useState({ name: 'Trust Barbershop', is_open: true, loyalty_rule: 7, phone: '', address: '', email: '', logo_url: null });

    // Forms
    const [newMember,  setNewMember]  = useState({ username: '', password: '', full_name: '', email: '', phone: '', address: '', instagram: '' });
    const [newBarber,  setNewBarber]  = useState({ name: '', phone: '', instagram: '', specialization: '' });
    const [newEvent,   setNewEvent]   = useState({ title: '', description: '', event_date: '', location: '' });
    const [newVisit,   setNewVisit]   = useState({ user_id: '', package_id: '', barber_id: '', notes: '', rating: 5, review: '', payment_method: 'cash', discount_amount: 0 });
    const [newPackage, setNewPackage] = useState({ name: '', description: '', price: 0, duration_minutes: 30, is_free: false, requires_coupon: false });

    // Edit states
    const [editingBarber, setEditingBarber] = useState(null);
    const [editingMember, setEditingMember] = useState(null);

    // Member search
    const [memberSearch, setMemberSearch] = useState('');

    const headers = { Authorization: `Bearer ${token}` };
    const showToast = (msg, type = 'success') => setToast({ msg, type });
    const askConfirm = (msg, onConfirm) => setConfirm({ msg, onConfirm, onCancel: () => setConfirm(null) });

    useEffect(() => { fetchAllData(); }, [chartPeriod, activeMenu]); // eslint-disable-line

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [chartRes, statsRes, leaderboardRes, membersRes, barbersRes, packagesRes, eventsRes, visitsRes, profileRes] = await Promise.all([
                axios.get(`${API}/api/admin/chart-data?period=${chartPeriod}`, { headers }),
                axios.get(`${API}/api/admin/dashboard-summary`, { headers }),
                axios.get(`${API}/api/admin/loyalty-leaderboard`, { headers }),
                axios.get(`${API}/api/admin/users`, { headers }),
                axios.get(`${API}/api/admin/barbers`, { headers }),
                axios.get(`${API}/api/packages`, { headers }),
                axios.get(`${API}/api/events`, { headers }),
                axios.get(`${API}/api/admin/visits`, { headers }),
                axios.get(`${API}/api/admin/shop-profile`, { headers }),
            ]);
            setChartData(chartRes.data || []);
            setDashboardStats(statsRes.data);
            setLeaderboard(leaderboardRes.data || []);
            setMembers(membersRes.data || []);
            setBarbers(barbersRes.data || []);
            setPackages(packagesRes.data || []);
            setEvents(eventsRes.data || []);
            setVisits(visitsRes.data || []);
            setShopProfile(profileRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // ── CRUD handlers ──────────────────────────────────────────────────────
    const createMember = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await axios.post(`${API}/api/admin/users`, newMember, { headers }); showToast('Member created successfully!'); setNewMember({ username:'',password:'',full_name:'',email:'',phone:'',address:'',instagram:'' }); fetchAllData(); }
        catch (err) { showToast(err.response?.data?.error || err.message, 'error'); }
        finally { setLoading(false); }
    };
    const updateMember = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await axios.put(`${API}/api/admin/member/${editingMember.id}`, editingMember, { headers }); showToast('Member updated!'); setEditingMember(null); fetchAllData(); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    };
    const deleteMember = (id, name) => askConfirm(`Delete member "${name}"? This cannot be undone.`, async () => {
        setConfirm(null); setLoading(true);
        try { await axios.delete(`${API}/api/admin/member/${id}`, { headers }); showToast('Member deleted.'); fetchAllData(); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    });
    const createBarber = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await axios.post(`${API}/api/admin/barbers`, newBarber, { headers }); showToast('Barber added!'); setNewBarber({ name:'',phone:'',instagram:'',specialization:'' }); fetchAllData(); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    };
    const updateBarber = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await axios.put(`${API}/api/admin/barbers/${editingBarber.id}`, editingBarber, { headers }); showToast('Barber updated!'); setEditingBarber(null); fetchAllData(); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    };
    const deleteBarber = (id, name) => askConfirm(`Delete barber "${name}"?`, async () => {
        setConfirm(null); setLoading(true);
        try { await axios.delete(`${API}/api/admin/barbers/${id}`, { headers }); showToast('Barber deleted.'); fetchAllData(); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    });
    const createEvent = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await axios.post(`${API}/api/admin/events`, newEvent, { headers }); showToast('Event created!'); setNewEvent({ title:'',description:'',event_date:'',location:'' }); fetchAllData(); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    };
    const deleteEvent = (id, title) => askConfirm(`Delete event "${title}"?`, async () => {
        setConfirm(null); setLoading(true);
        try { await axios.delete(`${API}/api/admin/events/${id}`, { headers }); showToast('Event deleted.'); fetchAllData(); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    });
    const addVisit = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await axios.post(`${API}/api/admin/visits`, newVisit, { headers }); showToast('Visit recorded!'); setNewVisit({ user_id:'',package_id:'',barber_id:'',notes:'',rating:5,review:'',payment_method:'cash',discount_amount:0 }); fetchAllData(); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    };
    const addPackage = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await axios.post(`${API}/api/admin/packages`, newPackage, { headers }); showToast('Package added!'); setNewPackage({ name:'',description:'',price:0,duration_minutes:30,is_free:false,requires_coupon:false }); fetchAllData(); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    };
    const deletePackage = (id, name) => askConfirm(`Delete package "${name}"?`, async () => {
        setConfirm(null); setLoading(true);
        try { await axios.delete(`${API}/api/admin/package/${id}`, { headers }); showToast('Package deleted.'); fetchAllData(); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    });
    const updateShopStatus = async () => {
        try { const s = !shopProfile.is_open; await axios.put(`${API}/api/admin/shop-profile`, { ...shopProfile, is_open: s }, { headers }); setShopProfile({ ...shopProfile, is_open: s }); showToast(`Shop is now ${s ? 'OPEN' : 'CLOSED'}`, 'info'); }
        catch (err) { showToast(err.message, 'error'); }
    };
    const uploadLogo = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        if (!file.type.match('image.*')) { showToast('Please upload an image file', 'error'); return; }
        if (file.size > 2 * 1024 * 1024) { showToast('File must be less than 2MB', 'error'); return; }
        const reader = new FileReader();
        reader.onloadend = async () => {
            setLoading(true);
            try { await axios.post(`${API}/api/admin/upload-logo`, { logo_base64: reader.result }, { headers }); showToast('Logo uploaded!'); fetchAllData(); }
            catch (err) { showToast(err.message, 'error'); }
            finally { setLoading(false); }
        };
        reader.readAsDataURL(file);
    };
    const saveShopSettings = async () => {
        setLoading(true);
        try { await axios.put(`${API}/api/admin/shop-profile`, shopProfile, { headers }); showToast('Settings saved!'); }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    };
    const logout = () => askConfirm('Are you sure you want to logout?', () => { localStorage.clear(); setToken(null); });

    const menuItems = [
        { id: 'dashboard',       icon: '◈', label: 'Dashboard',       group: 'Overview' },
        { id: 'members',         icon: '◉', label: 'Members',         group: 'Manage' },
        { id: 'barbers',         icon: '✂', label: 'Barbers',         group: 'Manage' },
        { id: 'visits',          icon: '◎', label: 'New Visit',       group: 'Manage' },
        { id: 'history',         icon: '◇', label: 'History',         group: 'Manage' },
        { id: 'events',          icon: '✦', label: 'Events',          group: 'Content' },
        { id: 'packages',        icon: '▣', label: 'Packages',        group: 'Content' },
        { id: 'manage-packages', icon: '◫', label: 'Manage Packages', group: 'Content' },
        { id: 'settings',        icon: '⊙', label: 'Settings',        group: 'System' },
    ];

    const groups = ['Overview', 'Manage', 'Content', 'System'];

    const filteredMembers = members.filter(m =>
        !memberSearch || m.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) || m.username?.toLowerCase().includes(memberSearch.toLowerCase())
    );

    // ── Sidebar ────────────────────────────────────────────────────────────
    const SidebarContent = ({ onMenuClick }) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {shopProfile.logo_url
                        ? <img src={shopProfile.logo_url} alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }} />
                        : <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#d4af37,#b8962e)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#080b12', flexShrink: 0 }}>✂</div>
                    }
                    <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                            Trust <span className="gold-text">Barbershop</span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Admin Panel</div>
                    </div>
                </div>
                {/* Shop status toggle */}
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Shop Status</span>
                    <button onClick={updateShopStatus} className={`badge ${shopProfile.is_open ? 'badge-open' : 'badge-closed'}`} style={{ cursor: 'pointer', border: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                        {shopProfile.is_open ? 'OPEN' : 'CLOSED'}
                    </button>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
                {groups.map(group => {
                    const items = menuItems.filter(m => m.group === group);
                    return (
                        <div key={group} style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '.12em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', padding: '0 10px', marginBottom: '6px' }}>{group}</div>
                            {items.map(item => (
                                <button key={item.id} onClick={() => { setActiveMenu(item.id); onMenuClick?.(); }} className={`nav-item ${activeMenu === item.id ? 'active' : 'inactive'}`}>
                                    <span style={{ fontSize: '15px', width: '18px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                                    {item.label}
                                    <span className="dot" />
                                </button>
                            ))}
                        </div>
                    );
                })}
            </nav>

            {/* Admin info + logout */}
            <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#d4af37,#b8962e)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#080b12', flexShrink: 0 }}>A</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Administrator</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@trustbarbershop.com</div>
                    </div>
                    <button onClick={logout} style={{ padding: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', cursor: 'pointer', color: '#f87171', flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'all .2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    >
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', textAlign: 'center', letterSpacing: '.06em' }}>Loyalty: {shopProfile.loyalty_rule} visits = 1 free</div>
            </div>
        </div>
    );

    const currentPageTitle = menuItems.find(m => m.id === activeMenu)?.label || 'Dashboard';

    return (
        <div style={{ minHeight: '100vh', background: '#080b12', fontFamily: "'DM Sans', sans-serif", display: 'flex', position: 'relative', overflow: 'hidden' }}>
            <style>{GLOBAL_STYLE}</style>

            {/* Ambient */}
            <div style={{ position: 'fixed', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(212,175,55,0.06) 0%,transparent 70%)', top: '-80px', left: '200px', animation: 'floatOrb 22s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.01) 1px,transparent 1px)', backgroundSize: '50px 50px' }} />

            {/* Ticker */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: '26px', background: 'rgba(212,175,55,0.07)', borderBottom: '1px solid rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <div style={{ whiteSpace: 'nowrap', color: 'rgba(212,175,55,0.45)', fontSize: '10px', letterSpacing: '.15em', fontWeight: '600', animation: 'tickerScroll 30s linear infinite' }}>
                    ✦ TRUST BARBERSHOP &nbsp;&nbsp;&nbsp; ADMIN DASHBOARD &nbsp;&nbsp;&nbsp; AUTHORIZED PERSONNEL ONLY &nbsp;&nbsp;&nbsp; ✦ TRUST BARBERSHOP &nbsp;&nbsp;&nbsp; ADMIN DASHBOARD &nbsp;&nbsp;&nbsp; AUTHORIZED PERSONNEL ONLY &nbsp;&nbsp;&nbsp;
                </div>
            </div>

            {/* ── DESKTOP SIDEBAR ── */}
            <aside style={{ width: '240px', flexShrink: 0, background: 'rgba(8,11,18,0.95)', backdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: '26px', height: 'calc(100vh - 26px)', overflowY: 'auto', zIndex: 20, display: 'none' }} className="desktop-sidebar">
                <SidebarContent />
            </aside>
            <style>{`@media(min-width:1024px){ .desktop-sidebar{ display:block !important; } .mobile-fab{ display:none !important; } }`}</style>

            {/* ── MOBILE SIDEBAR OVERLAY ── */}
            {sidebarOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 45, display: 'flex' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={() => setSidebarOpen(false)} />
                    <div style={{ position: 'relative', width: '240px', background: '#090c14', borderRight: '1px solid rgba(255,255,255,0.07)', height: '100%', overflowY: 'auto', paddingTop: '26px', zIndex: 1, animation: 'slideInLeft .3s ease' }}>
                        <SidebarContent onMenuClick={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* ── MOBILE FAB ── */}
            <button className="mobile-fab" onClick={() => setSidebarOpen(true)} style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 40, width: '52px', height: '52px', background: 'linear-gradient(135deg,#d4af37,#b8962e)', border: 'none', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 24px rgba(212,175,55,0.35)', fontSize: '20px', color: '#080b12' }}>
                ☰
            </button>

            {/* ── MAIN ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingTop: '26px' }}>
                {/* Top bar */}
                <div style={{ position: 'sticky', top: '26px', zIndex: 30, background: 'rgba(8,11,18,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '700', color: '#fff' }}>{currentPageTitle}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '.06em' }}>Trust Barbershop Management</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: shopProfile.is_open ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${shopProfile.is_open ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '20px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: shopProfile.is_open ? '#4ade80' : '#f87171', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: '11px', fontWeight: '700', color: shopProfile.is_open ? '#4ade80' : '#f87171', letterSpacing: '.08em' }}>{shopProfile.is_open ? 'OPEN' : 'CLOSED'}</span>
                        </div>
                        {loading && <div style={{ width: '18px', height: '18px', border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />}
                    </div>
                </div>

                {/* Content */}
                <main style={{ flex: 1, padding: '28px 24px 60px', maxWidth: '1200px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                    {/* ═══ DASHBOARD ═══ */}
                    {activeMenu === 'dashboard' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="fade-up">
                            {/* Stat cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                {[
                                    { label: 'Total Members',   value: dashboardStats.totalMembers,       icon: '◉', accent: '#67e8f9', sub: 'registered' },
                                    { label: 'Visits Today',    value: dashboardStats.visitsToday,         icon: '✂', accent: '#d4af37', sub: 'today' },
                                    { label: 'This Month',      value: dashboardStats.visitsThisMonth,     icon: '◈', accent: '#a78bfa', sub: 'visits' },
                                    { label: 'Coupons Active',  value: dashboardStats.membersWithCoupons,  icon: '✦', accent: '#4ade80', sub: 'members' },
                                ].map((s, i) => (
                                    <div key={i} className="glass card-hover" style={{ borderRadius: '16px', padding: '20px', animationDelay: `${i*.07}s` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.accent}15`, border: `1px solid ${s.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent, fontSize: '18px' }}>{s.icon}</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '.06em' }}>{s.sub}</div>
                                        </div>
                                        <div className="stat-num" style={{ fontSize: '32px', fontWeight: '700', color: '#fff', lineHeight: 1 }}>{s.value}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Top barber */}
                            {dashboardStats.topBarber && (
                                <div className="glass-gold" style={{ borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#d4af37,#b8962e)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, boxShadow: '0 6px 20px rgba(212,175,55,0.3)' }}>🏆</div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Top Performing Barber</div>
                                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>{dashboardStats.topBarber.name}</div>
                                        <div style={{ fontSize: '13px', color: '#d4af37' }}>{dashboardStats.topBarber.total_visits} clients served</div>
                                    </div>
                                </div>
                            )}

                            {/* Chart */}
                            <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Visit Analytics</div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {[['day','7 Days'],['week','30 Days'],['month','6 Months']].map(([p, l]) => (
                                            <button key={p} onClick={() => setChartPeriod(p)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all .2s', fontFamily: "'DM Sans', sans-serif", border: 'none', background: chartPeriod === p ? 'linear-gradient(135deg,#d4af37,#b8962e)' : 'rgba(255,255,255,0.06)', color: chartPeriod === p ? '#080b12' : 'rgba(255,255,255,0.4)' }}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ height: '240px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" fontSize={11} tick={{ fill: 'rgba(255,255,255,0.35)' }} />
                                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tick={{ fill: 'rgba(255,255,255,0.35)' }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#111318', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px' }} labelStyle={{ color: '#d4af37' }} itemStyle={{ color: '#fff' }} />
                                            <Line type="monotone" dataKey="total_visits" stroke="#d4af37" strokeWidth={2} dot={{ fill: '#d4af37', r: 3 }} activeDot={{ r: 5, fill: '#f5d778' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Leaderboard */}
                            <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Loyalty Leaderboard</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {leaderboard.map((m, idx) => (
                                        <div key={m.id} className="data-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', background: idx === 0 ? 'linear-gradient(135deg,#f5d778,#d4af37)' : idx === 1 ? 'rgba(156,163,175,0.2)' : idx === 2 ? 'rgba(180,96,40,0.2)' : 'rgba(255,255,255,0.05)', color: idx === 0 ? '#080b12' : idx < 3 ? '#fff' : 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{idx + 1}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.full_name}</div>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>@{m.username}</div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <span className="badge badge-cyan">{m.total_visits} visits</span>
                                                {m.free_coupons > 0 && <div style={{ marginTop: '4px' }}><span className="badge badge-gold">{m.free_coupons} coupons</span></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ MEMBERS ═══ */}
                    {activeMenu === 'members' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="fade-up">
                            {/* Add member */}
                            <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
                                <div className="subsection-title">Add New Member</div>
                                <form onSubmit={createMember} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                    {[
                                        { label: 'Full Name *', key: 'full_name', required: true },
                                        { label: 'Username *', key: 'username', required: true },
                                        { label: 'Password *', key: 'password', type: 'password', required: true },
                                        { label: 'Email', key: 'email', type: 'email' },
                                        { label: 'Phone / WA', key: 'phone' },
                                        { label: 'Instagram', key: 'instagram' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label>{f.label}</label>
                                            <input type={f.type || 'text'} value={newMember[f.key]} onChange={e => setNewMember({ ...newMember, [f.key]: e.target.value })} className="input-field" required={f.required} />
                                        </div>
                                    ))}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label>Address</label>
                                        <input type="text" value={newMember.address} onChange={e => setNewMember({ ...newMember, address: e.target.value })} className="input-field" />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <button type="submit" className="btn-gold" style={{ width: '100%' }} disabled={loading}>✦ Create Member</button>
                                    </div>
                                </form>
                            </div>

                            {/* Member list */}
                            <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                    <div className="subsection-title" style={{ marginBottom: 0 }}>Member List ({filteredMembers.length})</div>
                                    <input type="text" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="input-field" style={{ maxWidth: '220px', padding: '8px 12px' }} placeholder="Search members..." />
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                                {['Name', 'Contact', 'Visits', 'Coupons', 'Joined', 'Actions'].map(h => (
                                                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '10px', fontWeight: '700', letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMembers.map(m => (
                                                <tr key={m.id} className="data-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{m.full_name}</div>
                                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>@{m.username}</div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{m.phone || '—'}</div>
                                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{m.email || '—'}</div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}><span className="badge badge-cyan">{m.total_visits}</span></td>
                                                    <td style={{ padding: '12px' }}>{m.free_coupons > 0 ? <span className="badge badge-gold">✦ {m.free_coupons}</span> : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>—</span>}</td>
                                                    <td style={{ padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{new Date(m.member_since).toLocaleDateString('id-ID')}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button className="btn-edit" onClick={() => setEditingMember(m)}>Edit</button>
                                                            <button className="btn-red" onClick={() => deleteMember(m.id, m.full_name)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ BARBERS ═══ */}
                    {activeMenu === 'barbers' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="fade-up">
                            <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
                                <div className="subsection-title">Add New Barber</div>
                                <form onSubmit={createBarber} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                    {[
                                        { label: 'Name *', key: 'name', required: true },
                                        { label: 'Phone', key: 'phone' },
                                        { label: 'Instagram', key: 'instagram' },
                                        { label: 'Specialization', key: 'specialization' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label>{f.label}</label>
                                            <input type="text" value={newBarber[f.key]} onChange={e => setNewBarber({ ...newBarber, [f.key]: e.target.value })} className="input-field" required={f.required} />
                                        </div>
                                    ))}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <button type="submit" className="btn-gold" style={{ width: '100%' }} disabled={loading}>✦ Add Barber</button>
                                    </div>
                                </form>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                                {barbers.map(b => (
                                    <div key={b.id} className="glass card-hover" style={{ borderRadius: '16px', padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ width: '44px', height: '44px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✂</div>
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{b.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#d4af37', marginTop: '2px' }}>{b.specialization || 'General Barber'}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn-edit" onClick={() => setEditingBarber(b)}>Edit</button>
                                                <button className="btn-red" onClick={() => deleteBarber(b.id, b.name)}>Del</button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                            {b.phone && <span>📞 {b.phone}</span>}
                                            {b.instagram && <span style={{ color: '#f0abfc' }}>@{b.instagram}</span>}
                                            <span style={{ marginLeft: 'auto', color: '#67e8f9' }}>{b.total_clients || 0} clients</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ═══ NEW VISIT ═══ */}
                    {activeMenu === 'visits' && (
                        <div className="glass fade-up" style={{ borderRadius: '16px', padding: '28px', maxWidth: '700px' }}>
                            <div className="section-title">Record New Visit</div>
                            <form onSubmit={addVisit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {[
                                        { label: 'Member *', key: 'user_id', select: members, optLabel: m => `${m.full_name} (@${m.username})` },
                                        { label: 'Package *', key: 'package_id', select: packages, optLabel: p => `${p.name} — ${p.is_free ? 'FREE' : `Rp ${p.price?.toLocaleString()}`}` },
                                        { label: 'Barber *', key: 'barber_id', select: barbers, optLabel: b => b.name },
                                        { label: 'Payment', key: 'payment_method', options: [['cash','Cash'],['qris','QRIS'],['transfer','Transfer Bank']] },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label>{f.label}</label>
                                            <select value={newVisit[f.key]} onChange={e => setNewVisit({ ...newVisit, [f.key]: e.target.value })} className="input-field" required={f.label.includes('*')}>
                                                <option value="">Select...</option>
                                                {f.select ? f.select.map(item => <option key={item.id} value={item.id}>{f.optLabel(item)}</option>) : f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                    <div>
                                        <label>Rating</label>
                                        <select value={newVisit.rating} onChange={e => setNewVisit({ ...newVisit, rating: parseInt(e.target.value) })} className="input-field">
                                            {[5,4,3,2,1].map(r => <option key={r} value={r}>{'★'.repeat(r)} {['Excellent','Good','Average','Poor','Bad'][5-r]}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label>Discount (Rp)</label>
                                        <input type="number" value={newVisit.discount_amount} onChange={e => setNewVisit({ ...newVisit, discount_amount: parseInt(e.target.value) || 0 })} className="input-field" />
                                    </div>
                                </div>
                                <div>
                                    <label>Notes</label>
                                    <input type="text" value={newVisit.notes} onChange={e => setNewVisit({ ...newVisit, notes: e.target.value })} className="input-field" />
                                </div>
                                <div>
                                    <label>Review</label>
                                    <textarea value={newVisit.review} onChange={e => setNewVisit({ ...newVisit, review: e.target.value })} className="input-field" rows="3" style={{ resize: 'vertical' }} />
                                </div>
                                <button type="submit" className="btn-gold" disabled={loading}>
                                    {loading ? 'Recording...' : '✦ Record Visit'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ═══ HISTORY ═══ */}
                    {activeMenu === 'history' && (
                        <div className="glass fade-up" style={{ borderRadius: '16px', padding: '24px', overflowX: 'auto' }}>
                            <div className="section-title">Visit History</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        {['Date', 'Member', 'Barber', 'Package', 'Rating', 'Payment', 'Review'].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '10px', fontWeight: '700', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visits.map(v => (
                                        <tr key={v.id} className="data-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{new Date(v.visit_date).toLocaleDateString('id-ID')}</td>
                                            <td style={{ padding: '12px' }}><div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{v.user?.full_name}</div><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>@{v.user?.username}</div></td>
                                            <td style={{ padding: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{v.barber?.name || '—'}</td>
                                            <td style={{ padding: '12px' }}><span className="badge badge-gold">{v.package?.name}</span></td>
                                            <td style={{ padding: '12px', color: '#fbbf24', fontSize: '13px' }}>{v.rating ? '★'.repeat(v.rating) : '—'}</td>
                                            <td style={{ padding: '12px' }}><span className="badge badge-cyan">{v.payment_method || 'cash'}</span></td>
                                            <td style={{ padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.review || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ═══ EVENTS ═══ */}
                    {activeMenu === 'events' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="fade-up">
                            <div className="glass" style={{ borderRadius: '16px', padding: '24px', maxWidth: '600px' }}>
                                <div className="subsection-title">Create New Event</div>
                                <form onSubmit={createEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div><label>Title *</label><input type="text" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="input-field" required /></div>
                                    <div><label>Date *</label><input type="date" value={newEvent.event_date} onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })} className="input-field" required /></div>
                                    <div><label>Location</label><input type="text" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} className="input-field" /></div>
                                    <div style={{ gridColumn: '1/-1' }}><label>Description</label><textarea value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} className="input-field" rows="3" style={{ resize: 'vertical' }} /></div>
                                    <div style={{ gridColumn: '1/-1' }}><button type="submit" className="btn-gold" style={{ width: '100%' }} disabled={loading}>✦ Create Event</button></div>
                                </form>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                                {events.map(ev => (
                                    <div key={ev.id} className="glass card-hover" style={{ borderRadius: '14px', padding: '18px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{ev.title}</div>
                                            <button className="btn-red" onClick={() => deleteEvent(ev.id, ev.title)} style={{ padding: '4px 8px', fontSize: '11px' }}>Del</button>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#d4af37', marginBottom: '6px' }}>{new Date(ev.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                        {ev.location && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>📍 {ev.location}</div>}
                                        {ev.description && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{ev.description}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ═══ PACKAGES ═══ */}
                    {activeMenu === 'packages' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }} className="fade-up">
                            {packages.map(p => (
                                <div key={p.id} className="glass card-hover" style={{ borderRadius: '16px', padding: '22px' }}>
                                    <div style={{ width: '44px', height: '44px', background: p.is_free ? 'rgba(34,197,94,0.1)' : 'rgba(212,175,55,0.1)', border: `1px solid ${p.is_free ? 'rgba(34,197,94,0.2)' : 'rgba(212,175,55,0.15)'}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '14px' }}>💈</div>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>{p.name}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '14px', lineHeight: 1.5 }}>{p.description || '—'}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {p.is_free ? <span className="badge badge-open">FREE</span> : <span style={{ fontSize: '16px', fontWeight: '700', color: '#d4af37' }}>Rp {p.price?.toLocaleString()}</span>}
                                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{p.duration_minutes} min</span>
                                    </div>
                                    {p.requires_coupon && <div style={{ marginTop: '8px', fontSize: '11px', color: '#67e8f9' }}>Requires coupon</div>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ═══ MANAGE PACKAGES ═══ */}
                    {activeMenu === 'manage-packages' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="fade-up">
                            <div className="glass" style={{ borderRadius: '16px', padding: '24px', maxWidth: '600px' }}>
                                <div className="subsection-title">Add New Package</div>
                                <form onSubmit={addPackage} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div><label>Name *</label><input type="text" value={newPackage.name} onChange={e => setNewPackage({ ...newPackage, name: e.target.value })} className="input-field" required /></div>
                                    <div><label>Price (Rp)</label><input type="number" value={newPackage.price} onChange={e => setNewPackage({ ...newPackage, price: parseInt(e.target.value) || 0 })} className="input-field" /></div>
                                    <div><label>Duration (min)</label><input type="number" value={newPackage.duration_minutes} onChange={e => setNewPackage({ ...newPackage, duration_minutes: parseInt(e.target.value) || 30 })} className="input-field" /></div>
                                    <div style={{ gridColumn: '1/-1' }}><label>Description</label><input type="text" value={newPackage.description} onChange={e => setNewPackage({ ...newPackage, description: e.target.value })} className="input-field" /></div>
                                    <div style={{ display: 'flex', gap: '20px', gridColumn: '1/-1' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', letterSpacing: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={newPackage.is_free} onChange={e => setNewPackage({ ...newPackage, is_free: e.target.checked })} style={{ accentColor: '#d4af37' }} /> Free Package
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', letterSpacing: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={newPackage.requires_coupon} onChange={e => setNewPackage({ ...newPackage, requires_coupon: e.target.checked })} style={{ accentColor: '#d4af37' }} /> Requires Coupon
                                        </label>
                                    </div>
                                    <div style={{ gridColumn: '1/-1' }}><button type="submit" className="btn-gold" style={{ width: '100%' }} disabled={loading}>✦ Add Package</button></div>
                                </form>
                            </div>
                            <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
                                <div className="subsection-title">Existing Packages</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                                    {packages.map(p => (
                                        <div key={p.id} className="glass card-hover" style={{ borderRadius: '12px', padding: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{p.name}</div>
                                                <button className="btn-red" onClick={() => deletePackage(p.id, p.name)} style={{ padding: '3px 8px', fontSize: '11px' }}>Del</button>
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>{p.description || '—'}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                {p.is_free ? <span className="badge badge-open">FREE</span> : <span style={{ fontSize: '13px', fontWeight: '600', color: '#d4af37' }}>Rp {p.price?.toLocaleString()}</span>}
                                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{p.duration_minutes}m</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ SETTINGS ═══ */}
                    {activeMenu === 'settings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }} className="fade-up">
                            {/* Logo */}
                            <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
                                <div className="subsection-title">Shop Logo</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                    {shopProfile.logo_url
                                        ? <img src={shopProfile.logo_url} alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover', border: '1px solid rgba(212,175,55,0.2)' }} />
                                        : <div style={{ width: '64px', height: '64px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✂</div>
                                    }
                                    <div>
                                        <input type="file" accept="image/png,image/jpeg" onChange={uploadLogo} style={{ display: 'none' }} id="logo-upload" />
                                        <label htmlFor="logo-upload" style={{ cursor: 'pointer', textTransform: 'none', letterSpacing: 0 }}>
                                            <span className="btn-ghost" style={{ display: 'inline-block', padding: '10px 18px', fontSize: '13px' }}>Upload Logo</span>
                                        </label>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '6px' }}>PNG / JPG — max 2MB</div>
                                    </div>
                                </div>
                            </div>

                            {/* Shop info */}
                            <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
                                <div className="subsection-title">Shop Information</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                                    {[
                                        { label: 'Shop Name', key: 'name' },
                                        { label: 'Phone', key: 'phone' },
                                        { label: 'Email', key: 'email', type: 'email' },
                                        { label: 'Loyalty Rule (visits/free)', key: 'loyalty_rule', type: 'number' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label>{f.label}</label>
                                            <input type={f.type || 'text'} value={shopProfile[f.key] || ''} onChange={e => setShopProfile({ ...shopProfile, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} className="input-field" />
                                        </div>
                                    ))}
                                    <div style={{ gridColumn: '1/-1' }}>
                                        <label>Address</label>
                                        <input type="text" value={shopProfile.address || ''} onChange={e => setShopProfile({ ...shopProfile, address: e.target.value })} className="input-field" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <button onClick={updateShopStatus} style={{ padding: '11px 20px', borderRadius: '10px', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all .2s', background: shopProfile.is_open ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: shopProfile.is_open ? '#f87171' : '#4ade80', borderColor: shopProfile.is_open ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)' }}>
                                        {shopProfile.is_open ? '🔴 Close Shop' : '🟢 Open Shop'}
                                    </button>
                                    <button onClick={saveShopSettings} className="btn-gold" disabled={loading} style={{ flex: 1 }}>
                                        {loading ? 'Saving...' : '✦ Save Settings'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* ── MODALS ── */}
            {editingMember && (
                <EditModal
                    title="Edit Member"
                    fields={[
                        { label: 'Full Name', key: 'full_name', required: true },
                        { label: 'Email', key: 'email', type: 'email' },
                        { label: 'Phone', key: 'phone' },
                        { label: 'Address', key: 'address' },
                    ]}
                    data={editingMember}
                    setData={setEditingMember}
                    onSubmit={updateMember}
                    onClose={() => setEditingMember(null)}
                    loading={loading}
                    accentColor="rgba(6,182,212,0.2)"
                />
            )}
            {editingBarber && (
                <EditModal
                    title="Edit Barber"
                    fields={[
                        { label: 'Name', key: 'name', required: true },
                        { label: 'Phone', key: 'phone' },
                        { label: 'Instagram', key: 'instagram' },
                        { label: 'Specialization', key: 'specialization' },
                    ]}
                    data={editingBarber}
                    setData={setEditingBarber}
                    onSubmit={updateBarber}
                    onClose={() => setEditingBarber(null)}
                    loading={loading}
                    accentColor="rgba(212,175,55,0.2)"
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            {confirm && <ConfirmModal msg={confirm.msg} onConfirm={confirm.onConfirm} onCancel={confirm.onCancel} />}
        </div>
    );
}

export default AdminPanel;