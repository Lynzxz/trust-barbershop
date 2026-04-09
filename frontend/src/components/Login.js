import { useState, useEffect } from 'react';
import axios from 'axios';

function Login({ setToken, setRole }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('id');
    const [showPassword, setShowPassword] = useState(false);
    const [particles, setParticles] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Contact info
    const contact = {
        whatsapp: '6282120680023',
        email: 'fynxrt@gmail.com',
        phone: '+62 821-2068-0023'
    };

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format time
    const formattedTime = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const formattedDate = currentTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const formattedDateEn = currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Get greeting based on time
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (language === 'id') {
            if (hour >= 3 && hour < 11) return 'Selamat Pagi';
            if (hour >= 11 && hour < 15) return 'Selamat Siang';
            if (hour >= 15 && hour < 18) return 'Selamat Sore';
            return 'Selamat Malam';
        } else {
            if (hour >= 5 && hour < 12) return 'Good Morning';
            if (hour >= 12 && hour < 17) return 'Good Afternoon';
            if (hour >= 17 && hour < 21) return 'Good Evening';
            return 'Good Night';
        }
    };

    // Generate particles
    useEffect(() => {
        const newParticles = [];
        for (let i = 0; i < 60; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 4 + 2,
                duration: Math.random() * 15 + 8,
                delay: Math.random() * 8
            });
        }
        setParticles(newParticles);
    }, []);

    // Translations
    const t = {
        id: {
            title: 'Trust Barbershop',
            subtitle: 'Sistem Manajemen Premium',
            username: 'Nama Pengguna',
            usernamePlaceholder: 'Masukkan nama pengguna',
            password: 'Kata Sandi',
            passwordPlaceholder: 'Masukkan kata sandi',
            login: 'Masuk',
            loggingIn: 'Sedang masuk...',
            needHelp: 'Butuh bantuan?',
            contactWhatsapp: 'Hubungi via WhatsApp',
            contactEmail: 'Kirim Email',
            welcome: 'Selamat Datang',
            demoCreds: 'Demo: admin / admin123',
            language: 'Bahasa',
            footer: 'Sistem Manajemen Premium'
        },
        en: {
            title: 'Trust Barbershop',
            subtitle: 'Premium Management System',
            username: 'Username',
            usernamePlaceholder: 'Enter your username',
            password: 'Password',
            passwordPlaceholder: 'Enter your password',
            login: 'Login',
            loggingIn: 'Logging in...',
            needHelp: 'Need help?',
            contactWhatsapp: 'Contact via WhatsApp',
            contactEmail: 'Send Email',
            welcome: 'Welcome',
            demoCreds: 'Demo: admin / admin123',
            language: 'Language',
            footer: 'Premium Management System'
        }
    };

    const texts = t[language];

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/login', { username, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            setToken(res.data.token);
            setRole(res.data.role);
        } catch (err) {
            alert(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const openWhatsApp = () => {
        window.open(`https://wa.me/${contact.whatsapp}`, '_blank');
    };

    const openEmail = () => {
        window.location.href = `mailto:${contact.email}`;
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black">
            {/* Particle Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute bg-cyan-400/20 rounded-full animate-float"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* Animated Gradient Orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse-slow animation-delay-1000 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000 pointer-events-none" />

            {/* Language Switcher */}
            <div className="absolute top-4 right-4 z-20 flex gap-2 bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/10">
                <button
                    onClick={() => setLanguage('id')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${language === 'id' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    🇮🇩 ID
                </button>
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${language === 'en' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    🇬🇧 EN
                </button>
            </div>

            {/* Main Login Card */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Date & Time Display */}
                    <div className="text-center mb-6 animate-slideDown">
                        <div className="inline-block bg-black/30 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10">
                            <p className="text-cyan-400 text-sm font-mono">{formattedTime}</p>
                            <p className="text-gray-400 text-xs">{language === 'id' ? formattedDate : formattedDateEn}</p>
                        </div>
                    </div>

                    {/* Logo & Title */}
                    <div className="text-center mb-6 animate-slideDown animation-delay-100">
                        <div className="inline-block">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-2xl animate-bounce-slow">
                                    <span className="text-white text-4xl animate-pulse-slow">✂️</span>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mt-4 tracking-tight">{texts.title}</h1>
                        <p className="text-cyan-400 text-sm mt-1">{texts.subtitle}</p>
                        <div className="mt-2 flex items-center justify-center gap-2">
                            <span className="text-amber-400 text-lg">✨</span>
                            <p className="text-gray-400 text-sm">{getGreeting()}, {texts.welcome}!</p>
                            <span className="text-amber-400 text-lg">✨</span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl animate-fadeIn">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-gray-300 text-sm font-medium">{texts.username}</label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-gray-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                                        placeholder={texts.usernamePlaceholder}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-300 text-sm font-medium">{texts.password}</label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-800/50 text-white pl-10 pr-12 py-3 rounded-xl border border-gray-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                                        placeholder={texts.passwordPlaceholder}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>{texts.loggingIn}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{texts.login}</span>
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-4 text-center">
                            <p className="text-gray-500 text-xs bg-gray-800/30 inline-block px-3 py-1 rounded-full">
                                {texts.demoCreds}
                            </p>
                        </div>

                        {/* Need Help Section */}
                        <div className="mt-6 pt-4 border-t border-gray-700/50">
                            <p className="text-gray-400 text-xs text-center mb-3">{texts.needHelp}</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={openWhatsApp}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.032 2.002c-5.514 0-9.994 4.48-9.994 9.993 0 1.76.455 3.48 1.318 5.003L2 22.002l5.057-1.352c1.47.8 3.13 1.223 4.824 1.223 5.514 0 9.995-4.48 9.995-9.993 0-5.513-4.48-9.994-9.994-9.994z"/>
                                    </svg>
                                    {texts.contactWhatsapp}
                                </button>
                                <button
                                    onClick={openEmail}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {texts.contactEmail}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-gray-500 text-xs">
                            © 2026 {texts.title} | {texts.footer}
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
                    25% { transform: translateY(-25px) translateX(15px); opacity: 0.5; }
                    50% { transform: translateY(0px) translateX(30px); opacity: 0.2; }
                    75% { transform: translateY(25px) translateX(15px); opacity: 0.5; }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.08); }
                }
                .animate-float { animation: float infinite ease-in-out; }
                .animate-slideDown { animation: slideDown 0.5s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
                .animation-delay-100 { animation-delay: 0.1s; }
                .animation-delay-1000 { animation-delay: 1s; }
                .animation-delay-2000 { animation-delay: 2s; }
            `}</style>
        </div>
    );
}

export default Login;