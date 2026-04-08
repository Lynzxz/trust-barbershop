import { useState } from 'react';
import axios from 'axios';

function Login({ setToken, setRole }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', { username, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            setToken(res.data.token);
            setRole(res.data.role);
        } catch(err) {
            alert('Login gagal: ' + (err.response?.data?.error || err.message));
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-96 border border-white/20">
                <h1 className="text-3xl font-bold text-white mb-2">Trust Barbershop</h1>
                <p className="text-gray-400 mb-6">Tasikmalaya</p>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 mb-4 bg-black/50 text-white rounded-lg border border-gray-600" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mb-6 bg-black/50 text-white rounded-lg border border-gray-600" />
                    <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-lg font-bold transition">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;