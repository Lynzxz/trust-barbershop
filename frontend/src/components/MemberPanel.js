import { useEffect, useState } from 'react';
import axios from 'axios';

function MemberPanel({ token, setToken }) {
    const [dashboard, setDashboard] = useState({
        member: {},
        shopProfile: {},
        recentVisits: [],
        events: [],
        loyalty: { rule: 7, visits_until_free: 0, progress_percent: 0, current_stamps: 0, free_coupons: 0 }
    });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', address: '', email: '' });
    const [loading, setLoading] = useState(false);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
    fetchDashboard();
}, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDashboard = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/member/dashboard', { headers });
            setDashboard(res.data);
            setProfileForm({
                full_name: res.data.member.full_name || '',
                phone: res.data.member.phone || '',
                address: res.data.member.address || '',
                email: res.data.member.email || ''
            });
        } catch (err) {
            console.error('Error fetching dashboard:', err);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put('http://localhost:5000/api/member/profile', profileForm, { headers });
            alert('Profile updated successfully!');
            setEditingProfile(false);
            fetchDashboard();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const useFreeCoupon = async () => {
        if (dashboard.loyalty.free_coupons <= 0) {
            alert('You have no free coupons available!');
            return;
        }
        
        if (window.confirm('Use 1 free coupon for a free haircut + shampoo?')) {
            setLoading(true);
            try {
                await axios.post('http://localhost:5000/api/member/use-coupon', {}, { headers });
                alert('Free service recorded! Enjoy your haircut!');
                fetchDashboard();
            } catch (err) {
                alert('Error: ' + (err.response?.data?.error || err.message));
            } finally {
                setLoading(false);
            }
        }
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
    };

    const tabs = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'loyalty', icon: '🎫', label: 'Loyalty Card' },
        { id: 'history', icon: '📜', label: 'History' },
        { id: 'events', icon: '📅', label: 'Events' },
        { id: 'profile', icon: '👤', label: 'Profile' }
    ];

    // Safe access variables
    const shopName = dashboard.shopProfile && dashboard.shopProfile.name ? dashboard.shopProfile.name : 'Trust Barbershop';
    const shopLogo = dashboard.shopProfile && dashboard.shopProfile.logo_url ? dashboard.shopProfile.logo_url : null;
    const shopOpen = dashboard.shopProfile && dashboard.shopProfile.is_open ? true : false;
    const memberName = dashboard.member && dashboard.member.full_name ? dashboard.member.full_name : '';
    const memberUsername = dashboard.member && dashboard.member.username ? dashboard.member.username : '';
    const totalVisits = dashboard.member && dashboard.member.total_visits ? dashboard.member.total_visits : 0;
    const freeCoupons = dashboard.loyalty && dashboard.loyalty.free_coupons ? dashboard.loyalty.free_coupons : 0;
    const memberSince = dashboard.member && dashboard.member.member_since ? dashboard.member.member_since : new Date();
    const currentStamps = dashboard.loyalty && dashboard.loyalty.current_stamps ? dashboard.loyalty.current_stamps : 0;
    const loyaltyRule = dashboard.loyalty && dashboard.loyalty.rule ? dashboard.loyalty.rule : 7;
    const visitsUntilFree = dashboard.loyalty && dashboard.loyalty.visits_until_free !== undefined ? dashboard.loyalty.visits_until_free : 0;
    const progressPercent = dashboard.loyalty && dashboard.loyalty.progress_percent ? dashboard.loyalty.progress_percent : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
            {/* Header */}
            <header className="bg-black/50 backdrop-blur-md border-b border-amber-500/30 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {shopLogo ? (
                            <img src={shopLogo} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">✂️</span>
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">{shopName}</h1>
                            <p className="text-xs text-amber-400">Member Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${shopOpen ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                            {shopOpen ? 'OPEN' : 'CLOSED'}
                        </div>
                        <button onClick={logout} className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition">Logout</button>
                    </div>
                </div>
            </header>

            {/* Member Name Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/20 px-6 py-3">
                <p className="text-gray-300 text-sm">Welcome back, <span className="text-amber-400 font-bold">{memberName || memberUsername}</span>!</p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-800 px-6">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 font-medium transition-all duration-200 flex items-center gap-2 ${
                                activeTab === tab.id 
                                    ? 'text-amber-400 border-b-2 border-amber-400' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div>
                        {/* Welcome Card */}
                        <div className="bg-gradient-to-r from-amber-900/30 to-black/50 rounded-2xl p-6 mb-8 border border-amber-500/30">
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome to {shopName}!</h2>
                            <p className="text-gray-300">Your trusted barbershop in Tasikmalaya. Quality haircut, premium service.</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border border-gray-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">✂️</span>
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Visits</p>
                                        <p className="text-2xl font-bold text-white">{totalVisits}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border border-gray-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">🎫</span>
                                    <div>
                                        <p className="text-gray-400 text-sm">Free Coupons</p>
                                        <p className="text-2xl font-bold text-amber-400">{freeCoupons}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border border-gray-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">📅</span>
                                    <div>
                                        <p className="text-gray-400 text-sm">Member Since</p>
                                        <p className="text-lg font-bold text-white">{new Date(memberSince).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loyalty Progress Preview */}
                        <div className="bg-black/40 rounded-2xl p-6 border border-gray-800 mb-8">
                            <h3 className="text-white font-bold mb-4">Loyalty Progress</h3>
                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                <span>Stamps: {currentStamps} / {loyaltyRule}</span>
                                <span>{visitsUntilFree === 0 ? 'Ready for free!' : visitsUntilFree + ' more visits for free'}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <div 
                                    className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: progressPercent + '%' }}
                                ></div>
                            </div>
                            {freeCoupons > 0 && (
                                <button 
                                    onClick={useFreeCoupon}
                                    className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
                                >
                                    Use Free Coupon ({freeCoupons} available)
                                </button>
                            )}
                        </div>

                        {/* Recent Visits */}
                        <div className="bg-black/40 rounded-2xl p-6 border border-gray-800">
                            <h3 className="text-white font-bold mb-4">Recent Visits</h3>
                            <div className="space-y-3">
                                {dashboard.recentVisits.map((v, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                                        <div>
                                            <p className="text-white font-medium">{v.package ? v.package.name : '-'}</p>
                                            <p className="text-gray-400 text-sm">Barber: {v.barber ? v.barber.name : '-'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400 text-sm">{new Date(v.visit_date).toLocaleDateString()}</p>
                                            {v.rating && <p className="text-yellow-400 text-sm">{'⭐'.repeat(v.rating)}</p>}
                                        </div>
                                    </div>
                                ))}
                                {dashboard.recentVisits.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No visits yet. Book your first haircut!</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* LOYALTY CARD TAB */}
                {activeTab === 'loyalty' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-amber-900/40 to-black/60 rounded-3xl p-6 border border-amber-500/30 backdrop-blur-sm">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg">
                                    ✂️
                                </div>
                                <h3 className="text-white font-bold text-xl">Loyalty Card</h3>
                                <p className="text-gray-400 text-sm">{shopName}</p>
                            </div>
                            
                            <div className="grid grid-cols-7 gap-2 mb-6">
                                {[...Array(loyaltyRule)].map((_, i) => (
                                    <div 
                                        key={i}
                                        className={`aspect-square rounded-lg flex items-center justify-center text-lg transition-all ${
                                            i < currentStamps 
                                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' 
                                                : 'bg-gray-700 text-gray-500'
                                        }`}
                                    >
                                        {i < currentStamps ? '✓' : (i + 1)}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="text-center">
                                <p className="text-gray-300 text-sm">
                                    {visitsUntilFree === 0 
                                        ? '🎉 Congratulations! You have earned a free coupon!' 
                                        : visitsUntilFree + ' more visit(s) to get a free haircut + shampoo!'}
                                </p>
                                {freeCoupons > 0 && (
                                    <div className="mt-4 p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                                        <p className="text-amber-400 font-bold">{freeCoupons} Free Coupon(s) Available!</p>
                                        <p className="text-gray-400 text-xs mt-1">Redeem at the counter</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-black/40 rounded-2xl p-6 border border-gray-800">
                            <h3 className="text-white font-bold mb-4">How It Works</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-bold">1</div>
                                    <div>
                                        <p className="text-white font-medium">Get a stamp</p>
                                        <p className="text-gray-400 text-sm">Every haircut service gives you 1 stamp on your loyalty card</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-bold">2</div>
                                    <div>
                                        <p className="text-white font-medium">Collect {loyaltyRule} stamps</p>
                                        <p className="text-gray-400 text-sm">After {loyaltyRule} visits, you get a FREE coupon!</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-bold">3</div>
                                    <div>
                                        <p className="text-white font-medium">Redeem for free service</p>
                                        <p className="text-gray-400 text-sm">Free haircut + shampoo on your next visit</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                    <div className="bg-black/40 rounded-2xl p-6 border border-gray-800 overflow-x-auto">
                        <h3 className="text-white font-bold mb-4 text-lg">Your Visit History</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left p-3 text-amber-400">Date</th>
                                    <th className="text-left p-3 text-amber-400">Service</th>
                                    <th className="text-left p-3 text-amber-400">Barber</th>
                                    <th className="text-left p-3 text-amber-400">Rating</th>
                                    <th className="text-left p-3 text-amber-400">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.recentVisits.map((v, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        <td className="p-3 text-gray-300 text-sm">{new Date(v.visit_date).toLocaleDateString()}</td>
                                        <td className="p-3 text-white">{v.package ? v.package.name : '-'}</td>
                                        <td className="p-3 text-gray-400">{v.barber ? v.barber.name : '-'}</td>
                                        <td className="p-3">{v.rating && <span className="text-yellow-400">{'⭐'.repeat(v.rating)}</span>}</td>
                                        <td className="p-3 text-gray-400 text-sm">{v.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* EVENTS TAB */}
                {activeTab === 'events' && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboard.events.map((e, i) => (
                            <div key={i} className="bg-black/40 rounded-2xl p-5 border border-gray-800 hover:border-pink-500/50 transition">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center text-xl">🎪</div>
                                    <div>
                                        <h4 className="text-white font-bold">{e.title}</h4>
                                        <p className="text-gray-400 text-sm">{new Date(e.event_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm">{e.location}</p>
                                <p className="text-gray-500 text-xs mt-2">{e.description}</p>
                            </div>
                        ))}
                        {dashboard.events.length === 0 && (
                            <p className="text-gray-500 text-center py-8 col-span-3">No upcoming events. Check back later!</p>
                        )}
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="bg-black/40 rounded-2xl p-6 border border-gray-800 max-w-2xl mx-auto">
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg">
                                {memberName ? memberName.charAt(0) : '👤'}
                            </div>
                            <h3 className="text-white font-bold text-xl mt-3">{memberName}</h3>
                            <p className="text-gray-400">@{memberUsername}</p>
                        </div>

                        {!editingProfile ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500 text-sm">Full Name</p>
                                        <p className="text-white">{dashboard.member ? dashboard.member.full_name : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Email</p>
                                        <p className="text-white">{dashboard.member && dashboard.member.email ? dashboard.member.email : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Phone</p>
                                        <p className="text-white">{dashboard.member && dashboard.member.phone ? dashboard.member.phone : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Address</p>
                                        <p className="text-white">{dashboard.member && dashboard.member.address ? dashboard.member.address : '-'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setEditingProfile(true)}
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-xl font-bold transition"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={updateProfile} className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-sm block mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.full_name} 
                                        onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                                        className="w-full bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm block mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        value={profileForm.email} 
                                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                        className="w-full bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm block mb-1">Phone / WhatsApp</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.phone} 
                                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                                        className="w-full bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm block mb-1">Address</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.address} 
                                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                                        className="w-full bg-gray-800/50 text-white p-3 rounded-xl border border-gray-700"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl font-bold transition"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setEditingProfile(false)}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl font-bold transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MemberPanel;