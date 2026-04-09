import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Login({ setToken, setRole }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('id');
    const [showPassword, setShowPassword] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loginError, setLoginError] = useState('');
    const [shake, setShake] = useState(false);
    const [focused, setFocused] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);

    const contact = {
        whatsapp: '6282120680023',
        email: 'fynxrt@gmail.com',
    };

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Parallax mouse tracking
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const formattedDate = currentTime.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const getGreeting = () => {
        const h = currentTime.getHours();
        if (language === 'id') {
            if (h >= 3 && h < 11) return 'Selamat Pagi';
            if (h >= 11 && h < 15) return 'Selamat Siang';
            if (h >= 15 && h < 18) return 'Selamat Sore';
            return 'Selamat Malam';
        } else {
            if (h >= 5 && h < 12) return 'Good Morning';
            if (h >= 12 && h < 17) return 'Good Afternoon';
            if (h >= 17 && h < 21) return 'Good Evening';
            return 'Good Night';
        }
    };

    const t = {
        id: {
            title: 'Trust Barbershop',
            subtitle: 'Sistem Manajemen Premium',
            username: 'Nama Pengguna',
            usernamePlaceholder: 'Masukkan nama pengguna',
            password: 'Kata Sandi',
            passwordPlaceholder: 'Masukkan kata sandi',
            login: 'Masuk ke Sistem',
            loggingIn: 'Memverifikasi...',
            needHelp: 'Butuh bantuan akses?',
            contactWhatsapp: 'WhatsApp',
            contactEmail: 'Email',
            welcome: 'Selamat Datang',
            errorMsg: 'Username atau kata sandi salah.',
        },
        en: {
            title: 'Trust Barbershop',
            subtitle: 'Premium Management System',
            username: 'Username',
            usernamePlaceholder: 'Enter your username',
            password: 'Password',
            passwordPlaceholder: 'Enter your password',
            login: 'Sign In',
            loggingIn: 'Verifying...',
            needHelp: 'Need access help?',
            contactWhatsapp: 'WhatsApp',
            contactEmail: 'Email',
            welcome: 'Welcome',
            errorMsg: 'Invalid username or password.',
        }
    };

    const texts = t[language];

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);
        try {
            // PASTIKAN URL INI BENAR
            const API_URL = 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/login`, { username, password });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            setToken(res.data.token);
            setRole(res.data.role);
        } catch (err) {
            console.error('Login error:', err);
            setLoginError(texts.errorMsg);
            setShake(true);
            setTimeout(() => setShake(false), 600);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#080b12', position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

            {/* Google Font Import */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                @keyframes floatOrb {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -60px) scale(1.05); }
                    66% { transform: translate(-30px, 40px) scale(0.95); }
                }
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
                }
                @keyframes revealUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes revealDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    15% { transform: translateX(-8px); }
                    30% { transform: translateX(8px); }
                    45% { transform: translateX(-6px); }
                    60% { transform: translateX(6px); }
                    75% { transform: translateX(-3px); }
                    90% { transform: translateX(3px); }
                }
                @keyframes borderGlow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
                @keyframes tickerScroll {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .form-input {
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    color: #e8eaf0;
                    padding: 14px 16px 14px 46px;
                    border-radius: 12px;
                    border: 1.5px solid rgba(255,255,255,0.08);
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    transition: all 0.3s ease;
                    outline: none;
                    letter-spacing: 0.02em;
                }
                .form-input::placeholder { color: rgba(255,255,255,0.2); }
                .form-input:focus {
                    background: rgba(255,255,255,0.07);
                    border-color: rgba(212, 175, 55, 0.6);
                    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.08), inset 0 0 20px rgba(212, 175, 55, 0.03);
                }
                .form-input.has-error {
                    border-color: rgba(239, 68, 68, 0.6);
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
                }

                .login-btn {
                    width: 100%;
                    padding: 15px;
                    border-radius: 12px;
                    border: none;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    color: #080b12;
                    background: linear-gradient(135deg, #d4af37 0%, #f5d778 40%, #d4af37 60%, #b8962e 100%);
                    background-size: 200% auto;
                }
                .login-btn:hover:not(:disabled) {
                    background-position: right center;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(212, 175, 55, 0.35);
                }
                .login-btn:active:not(:disabled) { transform: translateY(0); }
                .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .login-btn.loading { animation: shimmer 1.5s linear infinite; }

                .contact-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 500;
                    font-family: 'DM Sans', sans-serif;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    border: 1.5px solid;
                    letter-spacing: 0.02em;
                }

                .lang-btn {
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    font-family: 'DM Sans', sans-serif;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    border: none;
                    letter-spacing: 0.05em;
                }

                .card-container {
                    animation: revealUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                .header-area {
                    animation: revealDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
                    animation-delay: 0.1s;
                }
                .shake { animation: shake 0.6s ease; }
            `}</style>

            {/* Background orbs */}
            <div style={{
                position: 'absolute', width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
                top: '-100px', left: '-200px',
                animation: 'floatOrb 18s ease-in-out infinite',
                pointerEvents: 'none',
                transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
                transition: 'transform 0.1s ease-out',
            }} />
            <div style={{
                position: 'absolute', width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
                bottom: '-100px', right: '-100px',
                animation: 'floatOrb 22s ease-in-out infinite reverse',
                pointerEvents: 'none',
                transform: `translate(${-mousePos.x * 0.2}px, ${-mousePos.y * 0.2}px)`,
                transition: 'transform 0.1s ease-out',
            }} />

            {/* Subtle grid pattern */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
            }} />

            {/* Top scanline effect */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
                animation: 'scanline 6s linear infinite',
                opacity: 0.3, pointerEvents: 'none', zIndex: 50,
            }} />

            {/* Language toggle */}
            <div style={{
                position: 'fixed', top: '20px', right: '20px', zIndex: 40,
                display: 'flex', gap: '4px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                padding: '4px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
            }}>
                {['id', 'en'].map(lang => (
                    <button
                        key={lang}
                        className="lang-btn"
                        onClick={() => setLanguage(lang)}
                        style={{
                            background: language === lang
                                ? 'linear-gradient(135deg, #d4af37, #b8962e)'
                                : 'transparent',
                            color: language === lang ? '#080b12' : 'rgba(255,255,255,0.4)',
                        }}
                    >
                        {lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
                    </button>
                ))}
            </div>

            {/* Ticker bar at top */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
                height: '32px',
                background: 'rgba(212,175,55,0.08)',
                borderBottom: '1px solid rgba(212,175,55,0.15)',
                display: 'flex', alignItems: 'center',
                overflow: 'hidden',
            }}>
                <div style={{
                    whiteSpace: 'nowrap',
                    color: 'rgba(212,175,55,0.6)',
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    fontWeight: '600',
                    animation: 'tickerScroll 25s linear infinite',
                    fontFamily: "'DM Sans', sans-serif",
                }}>
                    ✦ TRUST BARBERSHOP &nbsp;&nbsp;&nbsp; PREMIUM MANAGEMENT SYSTEM &nbsp;&nbsp;&nbsp; AUTHORIZED ACCESS ONLY &nbsp;&nbsp;&nbsp; ✦ TRUST BARBERSHOP &nbsp;&nbsp;&nbsp; PREMIUM MANAGEMENT SYSTEM &nbsp;&nbsp;&nbsp; AUTHORIZED ACCESS ONLY &nbsp;&nbsp;&nbsp;
                </div>
            </div>

            {/* Main content */}
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 16px 24px',
                position: 'relative', zIndex: 10,
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>

                    {/* Clock & Date */}
                    <div className="header-area" style={{ textAlign: 'center', marginBottom: '28px' }}>
                        <div style={{
                            display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                            gap: '2px',
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(20px)',
                            padding: '10px 20px',
                            borderRadius: '14px',
                            border: '1px solid rgba(255,255,255,0.07)',
                        }}>
                            <span style={{
                                fontFamily: "'DM Sans', monospace",
                                fontSize: '22px',
                                fontWeight: '700',
                                color: '#d4af37',
                                letterSpacing: '0.1em',
                            }}>{formattedTime}</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
                                {formattedDate}
                            </span>
                        </div>
                    </div>

                    {/* Logo & Title */}
                    <div className="header-area" style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                            <div style={{
                                position: 'absolute', inset: '-8px',
                                background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)',
                                borderRadius: '50%',
                            }} />
                            <div style={{
                                width: '72px', height: '72px',
                                background: 'linear-gradient(135deg, #1a1408 0%, #2a1f0a 100%)',
                                borderRadius: '20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1.5px solid rgba(212,175,55,0.3)',
                                boxShadow: '0 0 30px rgba(212,175,55,0.15), inset 0 1px 0 rgba(212,175,55,0.2)',
                                position: 'relative',
                            }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 9C7.65685 9 9 7.65685 9 6C9 4.34315 7.65685 3 6 3C4.34315 3 3 4.34315 3 6C3 7.65685 4.34315 9 6 9Z" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6 21C7.65685 21 9 19.6569 9 18C9 16.3431 7.65685 15 6 15C4.34315 15 3 16.3431 3 18C3 19.6569 4.34315 21 6 21Z" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M20 4L8.12 15.88" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14.47 14.48L20 20" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8.12 8.12L12 12" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>

                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#ffffff',
                            letterSpacing: '-0.01em',
                            lineHeight: 1.2,
                        }}>
                            Trust <span style={{
                                background: 'linear-gradient(135deg, #d4af37, #f5d778)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>Barbershop</span>
                        </h1>
                        <p style={{
                            fontSize: '12px', color: 'rgba(255,255,255,0.35)',
                            letterSpacing: '0.18em', textTransform: 'uppercase',
                            fontWeight: '600', marginTop: '6px',
                        }}>{texts.subtitle}</p>

                        <div style={{
                            marginTop: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        }}>
                            <div style={{ height: '1px', width: '30px', background: 'rgba(212,175,55,0.3)' }} />
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>
                                {getGreeting()}
                            </span>
                            <div style={{ height: '1px', width: '30px', background: 'rgba(212,175,55,0.3)' }} />
                        </div>
                    </div>

                    {/* Login Card */}
                    <div
                        ref={cardRef}
                        className={`card-container ${shake ? 'shake' : ''}`}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(40px)',
                            borderRadius: '20px',
                            padding: '32px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)',
                            animation: 'borderGlow 3s ease-in-out infinite',
                        }} />

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: '12px',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontWeight: '600', letterSpacing: '0.1em',
                                    textTransform: 'uppercase', marginBottom: '8px',
                                }}>{texts.username}</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: '14px', top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: focused === 'username' ? '#d4af37' : 'rgba(255,255,255,0.25)',
                                        transition: 'color 0.3s',
                                        display: 'flex',
                                    }}>
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); setLoginError(''); }}
                                        onFocus={() => setFocused('username')}
                                        onBlur={() => setFocused(null)}
                                        className={`form-input ${loginError ? 'has-error' : ''}`}
                                        placeholder={texts.usernamePlaceholder}
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block', fontSize: '12px',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontWeight: '600', letterSpacing: '0.1em',
                                    textTransform: 'uppercase', marginBottom: '8px',
                                }}>{texts.password}</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: '14px', top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: focused === 'password' ? '#d4af37' : 'rgba(255,255,255,0.25)',
                                        transition: 'color 0.3s', display: 'flex',
                                    }}>
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                        </svg>
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused(null)}
                                        className={`form-input ${loginError ? 'has-error' : ''}`}
                                        placeholder={texts.passwordPlaceholder}
                                        style={{ paddingRight: '46px' }}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: '12px', top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'rgba(255,255,255,0.3)',
                                            display: 'flex', padding: '4px',
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {loginError && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 14px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '10px',
                                    color: '#fca5a5',
                                    fontSize: '13px',
                                    marginTop: '-4px',
                                }}>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`login-btn ${loading ? 'loading' : ''}`}
                                style={{ marginTop: '4px' }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <span style={{
                                            width: '18px', height: '18px',
                                            border: '2px solid rgba(8,11,18,0.3)',
                                            borderTopColor: '#080b12',
                                            borderRadius: '50%',
                                            display: 'inline-block',
                                            animation: 'spin 0.8s linear infinite',
                                        }} />
                                        {texts.loggingIn}
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        {texts.login}
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </form>

                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            margin: '24px 0 16px',
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', fontWeight: '500' }}>
                                {texts.needHelp}
                            </span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="contact-btn"
                                onClick={() => window.open(`https://wa.me/${contact.whatsapp}`, '_blank')}
                                style={{
                                    background: 'rgba(37,211,102,0.06)',
                                    borderColor: 'rgba(37,211,102,0.2)',
                                    color: 'rgba(37,211,102,0.8)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.06)'}
                            >
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.032 2.002c-5.514 0-9.994 4.48-9.994 9.993 0 1.76.455 3.48 1.318 5.003L2 22.002l5.057-1.352c1.47.8 3.13 1.223 4.824 1.223 5.514 0 9.995-4.48 9.995-9.993 0-5.513-4.48-9.994-9.994-9.994z"/>
                                </svg>
                                {texts.contactWhatsapp}
                            </button>
                            <button
                                className="contact-btn"
                                onClick={() => window.location.href = `mailto:${contact.email}`}
                                style={{
                                    background: 'rgba(212,175,55,0.06)',
                                    borderColor: 'rgba(212,175,55,0.2)',
                                    color: 'rgba(212,175,55,0.7)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.06)'}
                            >
                                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                {texts.contactEmail}
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <p style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.18)',
                            letterSpacing: '0.08em',
                            fontWeight: '500',
                        }}>
                            © 2026 Trust Barbershop &nbsp;·&nbsp; All rights reserved
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;
