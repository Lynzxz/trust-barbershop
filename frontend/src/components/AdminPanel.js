import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function AdminPanel({ token, setToken }) {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [fadeIn, setFadeIn] = useState(true);
    
    // Data states
    const [chartData, setChartData] = useState([]);
    const [chartPeriod, setChartPeriod] = useState('day');
    const [dashboardStats, setDashboardStats] = useState({
        totalMembers: 0,
        visitsThisMonth: 0,
        visitsToday: 0,
        membersWithCoupons: 0,
        topBarber: null
    });
    const [leaderboard, setLeaderboard] = useState([]);
    const [members, setMembers] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [events, setEvents] = useState([]);
    const [visits, setVisits] = useState([]);
    const [shopProfile, setShopProfile] = useState({ name: 'Trust Barbershop', is_open: true, loyalty_rule: 7, phone: '', address: '', email: '', logo_url: null });
    
    // Form states
    const [newMember, setNewMember] = useState({ username: '', password: '', full_name: '', email: '', phone: '', address: '', instagram: '' });
    const [newBarber, setNewBarber] = useState({ name: '', phone: '', instagram: '', specialization: '' });
    const [newEvent, setNewEvent] = useState({ title: '', description: '', event_date: '', location: '' });
    const [newVisit, setNewVisit] = useState({ user_id: '', package_id: '', barber_id: '', notes: '', rating: 5, review: '', payment_method: 'cash', discount_amount: 0 });
    const [newPackage, setNewPackage] = useState({ name: '', description: '', price: 0, duration_minutes: 30, is_free: false, requires_coupon: false });
    
    // Edit states
    const [editingBarber, setEditingBarber] = useState(null);
    const [editingMember, setEditingMember] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchAllData();
        setFadeIn(false);
        setTimeout(() => setFadeIn(true), 100);
    }, [chartPeriod, activeMenu]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [chartRes, statsRes, leaderboardRes, membersRes, barbersRes, packagesRes, eventsRes, visitsRes, profileRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/admin/chart-data?period=${chartPeriod}`, { headers }),
                axios.get('http://localhost:5000/api/admin/dashboard-summary', { headers }),
                axios.get('http://localhost:5000/api/admin/loyalty-leaderboard', { headers }),
                axios.get('http://localhost:5000/api/admin/users', { headers }),
                axios.get('http://localhost:5000/api/admin/barbers', { headers }),
                axios.get('http://localhost:5000/api/packages', { headers }),
                axios.get('http://localhost:5000/api/events', { headers }),
                axios.get('http://localhost:5000/api/admin/visits', { headers }),
                axios.get('http://localhost:5000/api/admin/shop-profile', { headers })
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
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Member CRUD
    const createMember = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/admin/users', newMember, { headers });
            alert('✅ Member created successfully!');
            setNewMember({ username: '', password: '', full_name: '', email: '', phone: '', address: '', instagram: '' });
            fetchAllData();
        } catch (err) {
            alert('❌ ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const updateMember = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/admin/member/${editingMember.id}`, editingMember, { headers });
            alert('✅ Member updated successfully!');
            setEditingMember(null);
            fetchAllData();
        } catch (err) {
            alert('❌ ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const deleteMember = async (id, name) => {
        if (window.confirm(`🗑️ Delete member "${name}"? This action cannot be undone.`)) {
            setLoading(true);
            try {
                await axios.delete(`http://localhost:5000/api/admin/member/${id}`, { headers });
                alert('✅ Member deleted successfully!');
                fetchAllData();
            } catch (err) {
                alert('❌ ' + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // Barber CRUD
    const createBarber = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/admin/barbers', newBarber, { headers });
            alert('✅ Barber added successfully!');
            setNewBarber({ name: '', phone: '', instagram: '', specialization: '' });
            fetchAllData();
        } catch (err) {
            alert('❌ ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateBarber = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/admin/barbers/${editingBarber.id}`, editingBarber, { headers });
            alert('✅ Barber updated successfully!');
            setEditingBarber(null);
            fetchAllData();
        } catch (err) {
            alert('❌ ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteBarber = async (id, name) => {
        if (window.confirm(`🗑️ Delete barber "${name}"? This action cannot be undone.`)) {
            setLoading(true);
            try {
                await axios.delete(`http://localhost:5000/api/admin/barbers/${id}`, { headers });
                alert('✅ Barber deleted successfully!');
                fetchAllData();
            } catch (err) {
                alert('❌ ' + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // Other CRUD
    const createEvent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/admin/events', newEvent, { headers });
            alert('✅ Event created successfully!');
            setNewEvent({ title: '', description: '', event_date: '', location: '' });
            fetchAllData();
        } catch (err) {
            alert('❌ ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (id, title) => {
        if (window.confirm(`🗑️ Delete event "${title}"?`)) {
            setLoading(true);
            try {
                await axios.delete(`http://localhost:5000/api/admin/events/${id}`, { headers });
                alert('✅ Event deleted successfully!');
                fetchAllData();
            } catch (err) {
                alert('❌ ' + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const addVisit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/admin/visits', newVisit, { headers });
            alert('✅ Visit recorded successfully!');
            setNewVisit({ user_id: '', package_id: '', barber_id: '', notes: '', rating: 5, review: '', payment_method: 'cash', discount_amount: 0 });
            fetchAllData();
        } catch (err) {
            alert('❌ ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const addPackage = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/admin/packages', newPackage, { headers });
            alert('✅ Package added successfully!');
            setNewPackage({ name: '', description: '', price: 0, duration_minutes: 30, is_free: false, requires_coupon: false });
            fetchAllData();
        } catch (err) {
            alert('❌ ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deletePackage = async (id, name) => {
        if (window.confirm(`🗑️ Delete package "${name}"?`)) {
            setLoading(true);
            try {
                await axios.delete(`http://localhost:5000/api/admin/package/${id}`, { headers });
                alert('✅ Package deleted successfully!');
                fetchAllData();
            } catch (err) {
                alert('❌ ' + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const updateShopStatus = async () => {
        try {
            const newStatus = !shopProfile.is_open;
            await axios.put('http://localhost:5000/api/admin/shop-profile', { ...shopProfile, is_open: newStatus }, { headers });
            setShopProfile({ ...shopProfile, is_open: newStatus });
            alert(`✅ Shop is now ${newStatus ? 'OPEN' : 'CLOSED'}`);
        } catch (err) {
            alert('❌ ' + err.message);
        }
    };

    const uploadLogo = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                alert('❌ Please upload an image file');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert('❌ File size must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = async () => {
                setLoading(true);
                try {
                    await axios.post('http://localhost:5000/api/admin/upload-logo', { logo_base64: reader.result }, { headers });
                    alert('✅ Logo uploaded successfully!');
                    fetchAllData();
                } catch (err) {
                    alert('❌ ' + err.message);
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const saveShopSettings = async () => {
        setLoading(true);
        try {
            await axios.put('http://localhost:5000/api/admin/shop-profile', shopProfile, { headers });
            alert('✅ Settings saved successfully!');
            fetchAllData();
        } catch (err) {
            alert('❌ ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            setToken(null);
        }
    };

    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', color: 'from-cyan-500 to-blue-600' },
        { id: 'members', icon: '👥', label: 'Members', color: 'from-blue-500 to-indigo-600' },
        { id: 'barbers', icon: '💇', label: 'Barbers', color: 'from-amber-500 to-orange-600' },
        { id: 'visits', icon: '✂️', label: 'New Visit', color: 'from-green-500 to-emerald-600' },
        { id: 'history', icon: '📜', label: 'History', color: 'from-purple-500 to-pink-600' },
        { id: 'events', icon: '📅', label: 'Events', color: 'from-pink-500 to-rose-600' },
        { id: 'packages', icon: '💈', label: 'Packages', color: 'from-indigo-500 to-purple-600' },
        { id: 'manage-packages', icon: '📦', label: 'Manage Packages', color: 'from-emerald-500 to-teal-600' },
        { id: 'settings', icon: '⚙️', label: 'Settings', color: 'from-gray-500 to-gray-700' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed bottom-4 right-4 z-50">
                <button onClick={() => document.getElementById('mobileSidebar').classList.toggle('hidden')} className="bg-cyan-600 text-white p-4 rounded-full shadow-lg shadow-cyan-500/50 hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-72 bg-black/50 backdrop-blur-xl border-r border-cyan-500/20 min-h-screen sticky top-0">
                    <SidebarContent shopProfile={shopProfile} menuItems={menuItems} activeMenu={activeMenu} setActiveMenu={setActiveMenu} updateShopStatus={updateShopStatus} logout={logout} />
                </aside>

                {/* Mobile Sidebar */}
                <aside id="mobileSidebar" className="hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-xl lg:hidden">
                    <div className="relative w-80 h-full bg-black/90 border-r border-cyan-500/20 p-4">
                        <button onClick={() => document.getElementById('mobileSidebar').classList.add('hidden')} className="absolute top-4 right-4 text-white text-2xl">✕</button>
                        <SidebarContent shopProfile={shopProfile} menuItems={menuItems} activeMenu={activeMenu} setActiveMenu={(menu) => { setActiveMenu(menu); document.getElementById('mobileSidebar').classList.add('hidden'); }} updateShopStatus={updateShopStatus} logout={logout} />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden">
                    <div className="sticky top-0 z-30 bg-black/50 backdrop-blur-md border-b border-cyan-500/20 px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white">{menuItems.find(m => m.id === activeMenu)?.label || 'Dashboard'}</h2>
                                <p className="text-gray-500 text-xs sm:text-sm mt-1">Trust Barbershop Management System</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-cyan-500/10 px-3 sm:px-4 py-2 rounded-xl border border-cyan-500/20">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${shopProfile.is_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-cyan-400 text-xs sm:text-sm">{shopProfile.is_open ? 'Shop Open' : 'Shop Closed'}</span>
                                </div>
                                {loading && <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 sm:p-6 lg:p-8 transition-all duration-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {/* DASHBOARD */}
                        {activeMenu === 'dashboard' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {[
                                        { label: 'Total Members', value: dashboardStats.totalMembers, icon: '👥', color: 'from-cyan-500 to-blue-600', change: '+12%' },
                                        { label: 'Visits This Month', value: dashboardStats.visitsThisMonth, icon: '✂️', color: 'from-green-500 to-emerald-600', change: '+8%' },
                                        { label: "Today's Visits", value: dashboardStats.visitsToday, icon: '📅', color: 'from-purple-500 to-pink-600', change: dashboardStats.visitsToday > 0 ? '+2 today' : '0 today' },
                                        { label: 'Members with Coupons', value: dashboardStats.membersWithCoupons, icon: '🎫', color: 'from-amber-500 to-orange-600', change: 'Ready to redeem' },
                                    ].map((stat, i) => (
                                        <div key={i} className="group bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                            <div className="flex justify-between items-start">
                                                <div><p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p><p className="text-xl sm:text-2xl font-bold text-white mt-2">{stat.value}</p><p className="text-green-400 text-xs mt-1">{stat.change}</p></div>
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}><span className="text-white text-xl sm:text-2xl">{stat.icon}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {dashboardStats.topBarber && (
                                    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-4 sm:p-6 border border-amber-500/30 animate-pulse-slow">
                                        <div className="flex flex-col sm:flex-row items-center gap-4"><div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-500 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-lg animate-bounce">🏆</div><div className="text-center sm:text-left"><p className="text-gray-300 text-xs sm:text-sm">Top Performing Barber</p><p className="text-xl sm:text-2xl font-bold text-white">{dashboardStats.topBarber.name}</p><p className="text-amber-400 text-sm">{dashboardStats.topBarber.total_visits} clients served</p></div></div>
                                    </div>
                                )}

                                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"><h3 className="text-white font-bold text-lg">📈 Visit Analytics</h3><div className="flex gap-2">{['day', 'week', 'month'].map(p => (<button key={p} onClick={() => setChartPeriod(p)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${chartPeriod === p ? 'bg-cyan-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{p === 'day' ? '7 Days' : p === 'week' ? '30 Days' : '6 Months'}</button>))}</div></div>
                                    <div className="h-64 sm:h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><XAxis dataKey="label" stroke="#9ca3af" fontSize={12} /><YAxis stroke="#9ca3af" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #06b6d4', borderRadius: '12px' }} /><Line type="monotone" dataKey="total_visits" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div>
                                </div>

                                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800"><h3 className="text-white font-bold text-lg mb-4">🏆 Loyalty Leaderboard</h3><div className="space-y-2 max-h-96 overflow-y-auto">{leaderboard.map((m, idx) => (<div key={m.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all hover:scale-[1.02]"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-gray-700'}`}>{idx + 1}</div><div><p className="text-white font-medium">{m.full_name}</p><p className="text-gray-400 text-xs">@{m.username}</p></div></div><div className="text-left sm:text-right mt-2 sm:mt-0"><p className="text-cyan-400 font-bold">{m.total_visits} visits</p>{m.free_coupons > 0 && <p className="text-amber-400 text-xs">{m.free_coupons} free coupons</p>}</div></div>))}</div></div>
                            </div>
                        )}

                        {/* MEMBERS */}
                        {activeMenu === 'members' && (
                            <div className="space-y-6">
                                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800">
                                    <h3 className="text-white font-bold mb-4 text-lg">➕ Add New Member</h3>
                                    <form onSubmit={createMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <input type="text" placeholder="Full Name*" value={newMember.full_name} onChange={(e) => setNewMember({...newMember, full_name: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700 focus:border-cyan-500 focus:outline-none transition" required />
                                        <input type="text" placeholder="Username*" value={newMember.username} onChange={(e) => setNewMember({...newMember, username: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700 focus:border-cyan-500 focus:outline-none transition" required />
                                        <input type="password" placeholder="Password*" value={newMember.password} onChange={(e) => setNewMember({...newMember, password: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700 focus:border-cyan-500 focus:outline-none transition" required />
                                        <input type="email" placeholder="Email (optional)" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" />
                                        <input type="text" placeholder="Phone/WA (optional)" value={newMember.phone} onChange={(e) => setNewMember({...newMember, phone: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" />
                                        <input type="text" placeholder="Instagram (optional)" value={newMember.instagram} onChange={(e) => setNewMember({...newMember, instagram: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" />
                                        <input type="text" placeholder="Address (optional)" value={newMember.address} onChange={(e) => setNewMember({...newMember, address: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700 sm:col-span-2 lg:col-span-3" />
                                        <button type="submit" disabled={loading} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl font-bold sm:col-span-2 lg:col-span-3 hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50">✨ Create Member</button>
                                    </form>
                                </div>

                                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800 overflow-x-auto">
                                    <h3 className="text-white font-bold mb-4 text-lg">📋 Member List</h3>
                                    <div className="overflow-x-auto"><table className="w-full min-w-[800px]"><thead><tr className="border-b border-gray-800"><th className="text-left p-3 text-cyan-400">Name</th><th className="text-left p-3 text-cyan-400">Contact</th><th className="text-left p-3 text-cyan-400">Visits</th><th className="text-left p-3 text-cyan-400">Coupons</th><th className="text-left p-3 text-cyan-400">Joined</th><th className="text-left p-3 text-cyan-400">Actions</th></tr></thead><tbody>{members.map(m => (<tr key={m.id} className="border-b border-gray-800/50 hover:bg-white/5 transition"><td className="p-3"><p className="text-white font-medium">{m.full_name}</p><p className="text-gray-500 text-xs">@{m.username}</p></td><td className="p-3"><p className="text-gray-300 text-sm">{m.phone || '-'}</p><p className="text-gray-500 text-xs">{m.email || '-'}</p></td><td className="p-3"><span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm">{m.total_visits}</span></td><td className="p-3">{m.free_coupons > 0 ? <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-sm">🎫 {m.free_coupons}</span> : '-'}</td><td className="p-3 text-gray-500 text-sm">{new Date(m.member_since).toLocaleDateString()}</td><td className="p-3"><div className="flex gap-2"><button onClick={() => setEditingMember(m)} className="text-cyan-400 hover:text-cyan-300 text-sm px-2 py-1 rounded-lg hover:bg-cyan-500/10 transition">Edit</button><button onClick={() => deleteMember(m.id, m.full_name)} className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded-lg hover:bg-red-500/10 transition">Delete</button></div></td></tr>))}</tbody></table></div>
                                </div>
                            </div>
                        )}

                        {/* BARBERS */}
                        {activeMenu === 'barbers' && (
                            <div className="space-y-6">
                                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800">
                                    <h3 className="text-white font-bold mb-4 text-lg">💇 Add New Barber</h3>
                                    <form onSubmit={createBarber} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <input type="text" placeholder="Barber Name*" value={newBarber.name} onChange={(e) => setNewBarber({...newBarber, name: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700 focus:border-amber-500 focus:outline-none transition" required />
                                        <input type="text" placeholder="Phone (optional)" value={newBarber.phone} onChange={(e) => setNewBarber({...newBarber, phone: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" />
                                        <input type="text" placeholder="Instagram (optional)" value={newBarber.instagram} onChange={(e) => setNewBarber({...newBarber, instagram: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" />
                                        <input type="text" placeholder="Specialization (optional)" value={newBarber.specialization} onChange={(e) => setNewBarber({...newBarber, specialization: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" />
                                        <button type="submit" disabled={loading} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-3 rounded-xl font-bold sm:col-span-2 lg:col-span-4 hover:shadow-lg transition-all hover:scale-[1.02]">✨ Add Barber</button>
                                    </form>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {barbers.map(b => (
                                        <div key={b.id} className="group bg-black/40 rounded-2xl p-5 border border-gray-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                                            <div className="flex items-start justify-between mb-3"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💇</div><div><h4 className="text-white font-bold text-lg">{b.name}</h4><p className="text-amber-400 text-sm">{b.specialization || 'General Barber'}</p></div></div><div className="flex gap-2"><button onClick={() => setEditingBarber(b)} className="text-cyan-400 hover:text-cyan-300 text-xs px-2 py-1 rounded-lg hover:bg-cyan-500/10 transition">Edit</button><button onClick={() => deleteBarber(b.id, b.name)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10 transition">Delete</button></div></div>
                                            <div className="flex flex-wrap gap-3 text-sm"><span className="text-gray-400">📞 {b.phone || '-'}</span>{b.instagram && <span className="text-pink-400">📷 @{b.instagram}</span>}<span className="text-cyan-400 ml-auto">✂️ {b.total_clients || 0} clients</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* NEW VISIT */}
                        {activeMenu === 'visits' && (
                            <div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800">
                                <h3 className="text-white font-bold mb-4 text-lg">✂️ Record New Visit</h3>
                                <form onSubmit={addVisit} className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <select value={newVisit.user_id} onChange={(e) => setNewVisit({...newVisit, user_id: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" required><option value="">Select Member</option>{members.map(m => <option key={m.id} value={m.id}>{m.full_name} (@{m.username})</option>)}</select>
                                    <select value={newVisit.package_id} onChange={(e) => setNewVisit({...newVisit, package_id: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" required><option value="">Select Package</option>{packages.map(p => <option key={p.id} value={p.id}>{p.name} - {p.is_free ? 'FREE' : `Rp ${p.price.toLocaleString()}`}</option>)}</select>
                                    <select value={newVisit.barber_id} onChange={(e) => setNewVisit({...newVisit, barber_id: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" required><option value="">Select Barber</option>{barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                                    <select value={newVisit.payment_method} onChange={(e) => setNewVisit({...newVisit, payment_method: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700"><option value="cash">Cash</option><option value="qris">QRIS</option><option value="transfer">Transfer Bank</option></select>
                                    <input type="number" placeholder="Discount Amount" value={newVisit.discount_amount} onChange={(e) => setNewVisit({...newVisit, discount_amount: parseInt(e.target.value)})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" />
                                    <select value={newVisit.rating} onChange={(e) => setNewVisit({...newVisit, rating: parseInt(e.target.value)})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700"><option value={5}>⭐ 5 - Excellent</option><option value={4}>⭐ 4 - Good</option><option value={3}>⭐ 3 - Average</option><option value={2}>⭐ 2 - Poor</option><option value={1}>⭐ 1 - Bad</option></select>
                                    <input type="text" placeholder="Notes" value={newVisit.notes} onChange={(e) => setNewVisit({...newVisit, notes: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700 sm:col-span-2" />
                                    <textarea placeholder="Review" value={newVisit.review} onChange={(e) => setNewVisit({...newVisit, review: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700 sm:col-span-2" rows="2" />
                                </div><button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50">✂️ Record Visit</button></form>
                            </div>
                        )}

                        {/* HISTORY */}
                        {activeMenu === 'history' && (
                            <div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800 overflow-x-auto"><h3 className="text-white font-bold mb-4 text-lg">📜 Visit History</h3><div className="overflow-x-auto"><table className="w-full min-w-[800px]"><thead><tr className="border-b border-gray-800"><th className="text-left p-3 text-cyan-400">Date</th><th className="text-left p-3 text-cyan-400">Member</th><th className="text-left p-3 text-cyan-400">Barber</th><th className="text-left p-3 text-cyan-400">Package</th><th className="text-left p-3 text-cyan-400">Rating</th><th className="text-left p-3 text-cyan-400">Review</th></tr></thead><tbody>{visits.map(v => (<tr key={v.id} className="border-b border-gray-800/50 hover:bg-white/5 transition"><td className="p-3 text-gray-300 text-sm">{new Date(v.visit_date).toLocaleDateString()}</td><td className="p-3 text-white">{v.user?.full_name}</td><td className="p-3 text-gray-300">{v.barber?.name || '-'}</td><td className="p-3 text-amber-400">{v.package?.name}</td><td className="p-3">{v.rating && <span className="text-yellow-400">{'⭐'.repeat(v.rating)}</span>}</td><td className="p-3 text-gray-400 text-sm">{v.review || '-'}</td></tr>))}</tbody></table></div></div>
                        )}

                        {/* EVENTS */}
                        {activeMenu === 'events' && (
                            <div className="space-y-6"><div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800"><h3 className="text-white font-bold mb-4 text-lg">📅 Create New Event</h3><form onSubmit={createEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-4"><input type="text" placeholder="Event Title" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" required /><input type="date" value={newEvent.event_date} onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" required /><input type="text" placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" /><textarea placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700 sm:col-span-2" rows="3" /><button type="submit" disabled={loading} className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-3 rounded-xl font-bold sm:col-span-2 hover:shadow-lg transition-all hover:scale-[1.02]">✨ Create Event</button></form></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{events.map(e => (<div key={e.id} className="group bg-black/40 rounded-2xl p-5 border border-gray-800 hover:border-pink-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"><div className="flex items-start justify-between mb-3"><div className="flex items-start gap-3"><div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🎪</div><div><h4 className="text-white font-bold">{e.title}</h4><p className="text-gray-400 text-sm">{new Date(e.event_date).toLocaleDateString()}</p></div></div><button onClick={() => deleteEvent(e.id, e.title)} className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded-lg hover:bg-red-500/10 transition">Delete</button></div><p className="text-gray-500 text-sm">{e.location}</p><p className="text-gray-500 text-xs mt-2">{e.description}</p></div>))}</div></div>
                        )}

                        {/* PACKAGES */}
                        {activeMenu === 'packages' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">{packages.map(p => (<div key={p.id} className="group bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"><div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"><span className="text-white text-2xl">💈</span></div><h4 className="text-white font-bold text-lg sm:text-xl mb-1">{p.name}</h4><p className="text-gray-400 text-sm mb-3">{p.description || 'Premium service'}</p><div className="flex justify-between items-center flex-wrap gap-2">{p.is_free ? <span className="text-green-400 font-bold text-lg">🎫 FREE</span> : <span className="text-amber-400 font-bold text-lg">Rp {p.price.toLocaleString()}</span>}<span className="text-gray-500 text-xs">{p.duration_minutes} min</span></div>{p.requires_coupon && <p className="text-cyan-400 text-xs mt-2">Requires loyalty coupon</p>}</div>))}</div>
                        )}

                        {/* MANAGE PACKAGES */}
                        {activeMenu === 'manage-packages' && (
                            <div className="space-y-6"><div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800"><h3 className="text-white font-bold mb-4 text-lg">➕ Add New Package</h3><form onSubmit={addPackage} className="grid grid-cols-1 sm:grid-cols-2 gap-4"><input type="text" placeholder="Package Name*" value={newPackage.name} onChange={(e) => setNewPackage({...newPackage, name: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" required /><input type="text" placeholder="Description" value={newPackage.description} onChange={(e) => setNewPackage({...newPackage, description: e.target.value})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" /><input type="number" placeholder="Price*" value={newPackage.price} onChange={(e) => setNewPackage({...newPackage, price: parseInt(e.target.value)})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" required /><input type="number" placeholder="Duration (minutes)*" value={newPackage.duration_minutes} onChange={(e) => setNewPackage({...newPackage, duration_minutes: parseInt(e.target.value)})} className="bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" required /><label className="flex items-center gap-2 text-white"><input type="checkbox" checked={newPackage.is_free} onChange={(e) => setNewPackage({...newPackage, is_free: e.target.checked})} className="w-5 h-5" /> Free Package</label><label className="flex items-center gap-2 text-white"><input type="checkbox" checked={newPackage.requires_coupon} onChange={(e) => setNewPackage({...newPackage, requires_coupon: e.target.checked})} className="w-5 h-5" /> Requires Coupon</label><button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-xl font-bold sm:col-span-2 hover:shadow-lg transition-all hover:scale-[1.02]">✨ Add Package</button></form></div>
                            <div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800"><h3 className="text-white font-bold mb-4 text-lg">📦 Existing Packages</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{packages.map(p => (<div key={p.id} className="group bg-gray-800/30 rounded-xl p-4 border border-gray-700 hover:border-emerald-500/50 transition-all hover:scale-[1.02]"><div className="flex justify-between items-start mb-2"><h4 className="text-white font-bold">{p.name}</h4><button onClick={() => deletePackage(p.id, p.name)} className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded-lg hover:bg-red-500/10 transition">Delete</button></div><p className="text-gray-400 text-sm mb-2">{p.description || '-'}</p><div className="flex justify-between items-center flex-wrap gap-2">{p.is_free ? <span className="text-green-400 font-bold">🎫 FREE</span> : <span className="text-amber-400 font-bold">Rp {p.price.toLocaleString()}</span>}<span className="text-gray-500 text-xs">{p.duration_minutes} min</span></div>{p.requires_coupon && <p className="text-cyan-400 text-xs mt-1">Requires loyalty coupon</p>}</div>))}</div></div></div>
                        )}

                        {/* SETTINGS */}
                        {activeMenu === 'settings' && (
                            <div className="bg-black/40 rounded-2xl p-4 sm:p-6 border border-gray-800"><h3 className="text-white font-bold mb-4 text-lg">⚙️ Shop Settings</h3>
                                <div className="mb-8 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20"><h4 className="text-cyan-400 font-bold mb-3">Upload Logo</h4><div className="flex flex-col sm:flex-row items-center gap-6">{shopProfile.logo_url ? <img src={shopProfile.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-cyan-500/30" /> : <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center text-2xl">✂️</div>}<input type="file" accept="image/png,image/jpeg" onChange={uploadLogo} className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 text-sm" /><p className="text-gray-500 text-xs">Upload PNG/JPG (max 2MB)</p></div></div>
                                <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="text-gray-400 text-sm block mb-1">Shop Name</label><input type="text" value={shopProfile.name} onChange={(e) => setShopProfile({...shopProfile, name: e.target.value})} className="w-full bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" /></div><div><label className="text-gray-400 text-sm block mb-1">Phone</label><input type="text" value={shopProfile.phone || ''} onChange={(e) => setShopProfile({...shopProfile, phone: e.target.value})} className="w-full bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" /></div><div className="sm:col-span-2"><label className="text-gray-400 text-sm block mb-1">Address</label><input type="text" value={shopProfile.address || ''} onChange={(e) => setShopProfile({...shopProfile, address: e.target.value})} className="w-full bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" /></div><div><label className="text-gray-400 text-sm block mb-1">Email</label><input type="email" value={shopProfile.email || ''} onChange={(e) => setShopProfile({...shopProfile, email: e.target.value})} className="w-full bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" /></div><div><label className="text-gray-400 text-sm block mb-1">Loyalty Rule (visits for free coupon)</label><input type="number" value={shopProfile.loyalty_rule || 7} onChange={(e) => setShopProfile({...shopProfile, loyalty_rule: parseInt(e.target.value)})} className="w-full bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700" /></div></div><div className="flex flex-col sm:flex-row gap-3 pt-4"><button onClick={updateShopStatus} className={`px-6 py-2 rounded-xl font-bold transition-all hover:scale-[1.02] ${shopProfile.is_open ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>{shopProfile.is_open ? '🔴 Close Shop' : '🟢 Open Shop'}</button><button onClick={saveShopSettings} disabled={loading} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50">💾 Save Settings</button></div></div></div>
                        )}
                    </div>
                </main>
            </div>

            {/* Edit Member Modal */}
            {editingMember && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setEditingMember(null)}>
                    <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-cyan-500/30" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-white font-bold text-xl mb-4">✏️ Edit Member</h3>
                        <form onSubmit={updateMember} className="space-y-4">
                            <input type="text" placeholder="Full Name" value={editingMember.full_name} onChange={(e) => setEditingMember({...editingMember, full_name: e.target.value})} className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700" required />
                            <input type="email" placeholder="Email" value={editingMember.email || ''} onChange={(e) => setEditingMember({...editingMember, email: e.target.value})} className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700" />
                            <input type="text" placeholder="Phone" value={editingMember.phone || ''} onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})} className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700" />
                            <input type="text" placeholder="Address" value={editingMember.address || ''} onChange={(e) => setEditingMember({...editingMember, address: e.target.value})} className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700" />
                            <div className="flex gap-3 pt-4"><button type="submit" disabled={loading} className="flex-1 bg-cyan-600 text-white py-2 rounded-xl font-bold">Save</button><button type="button" onClick={() => setEditingMember(null)} className="flex-1 bg-gray-700 text-white py-2 rounded-xl font-bold">Cancel</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Barber Modal */}
            {editingBarber && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setEditingBarber(null)}>
                    <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-amber-500/30" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-white font-bold text-xl mb-4">✏️ Edit Barber</h3>
                        <form onSubmit={updateBarber} className="space-y-4">
                            <input type="text" placeholder="Name" value={editingBarber.name} onChange={(e) => setEditingBarber({...editingBarber, name: e.target.value})} className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700" required />
                            <input type="text" placeholder="Phone" value={editingBarber.phone || ''} onChange={(e) => setEditingBarber({...editingBarber, phone: e.target.value})} className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700" />
                            <input type="text" placeholder="Instagram" value={editingBarber.instagram || ''} onChange={(e) => setEditingBarber({...editingBarber, instagram: e.target.value})} className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700" />
                            <input type="text" placeholder="Specialization" value={editingBarber.specialization || ''} onChange={(e) => setEditingBarber({...editingBarber, specialization: e.target.value})} className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700" />
                            <div className="flex gap-3 pt-4"><button type="submit" disabled={loading} className="flex-1 bg-amber-600 text-white py-2 rounded-xl font-bold">Save</button><button type="button" onClick={() => setEditingBarber(null)} className="flex-1 bg-gray-700 text-white py-2 rounded-xl font-bold">Cancel</button></div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse-slow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.95; transform: scale(1.01); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

// Sidebar Component
function SidebarContent({ shopProfile, menuItems, activeMenu, setActiveMenu, updateShopStatus, logout }) {
    return (
        <>
            <div className="p-4 sm:p-6 border-b border-cyan-500/20"><div className="flex items-center gap-3">{shopProfile.logo_url ? <img src={shopProfile.logo_url} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover" /> : <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-bold text-xl sm:text-2xl">✂️</span></div>}<div><h1 className="text-white font-bold text-lg sm:text-xl tracking-tight">{shopProfile.name}</h1><p className="text-[10px] text-amber-400 uppercase tracking-wider">Premium Management</p></div></div></div>
            <div className="mx-3 sm:mx-4 mt-3 sm:mt-4 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20"><div className="flex justify-between items-center"><span className="text-gray-300 text-xs sm:text-sm">Shop Status</span><button onClick={updateShopStatus} className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${shopProfile.is_open ? 'bg-green-600' : 'bg-red-600'} text-white`}>{shopProfile.is_open ? 'OPEN' : 'CLOSED'}</button></div><p className="text-[10px] text-gray-500 mt-1">Loyalty: {shopProfile.loyalty_rule} visits = 1 free</p></div>
            <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">{menuItems.map(item => (<button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 ${activeMenu === item.id ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><span className="text-lg sm:text-xl">{item.icon}</span><span className="font-medium text-sm sm:text-base">{item.label}</span>{activeMenu === item.id && <div className="ml-auto w-1 h-6 bg-cyan-400 rounded-full"></div>}</button>))}</nav>
            <div className="p-3 sm:p-4 border-t border-cyan-500/20"><div className="bg-cyan-500/5 rounded-xl p-2 sm:p-3 border border-cyan-500/20"><div className="flex items-center gap-2 sm:gap-3"><div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center"><span className="text-white text-xs sm:text-sm">A</span></div><div className="flex-1"><p className="text-white text-xs sm:text-sm font-medium">Administrator</p><p className="text-gray-500 text-[10px]">admin@trustbarbershop.com</p></div><button onClick={logout} className="p-1.5 sm:p-2 hover:bg-red-500/20 rounded-lg transition"><svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button></div></div></div>
        </>
    );
}

export default AdminPanel;