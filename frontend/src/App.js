import { useState } from 'react';
import Login from './components/Login';
import MemberPanel from './components/MemberPanel';
import AdminPanel from './components/AdminPanel';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  if (!token) {
    return <Login setToken={setToken} setRole={setRole} />;
  }

  if (role === 'admin') {
    return <AdminPanel token={token} setToken={setToken} />;
  }

  return <MemberPanel token={token} setToken={setToken} />;
}

export default App;