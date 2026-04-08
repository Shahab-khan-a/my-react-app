import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onLogin(email, password);
    if (!ok) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <div className="bg-[#121214] p-8 rounded-xl w-full max-w-md text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#09090b] border border-white/20 rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#09090b] border border-white/20 rounded focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-amber-500 hover:bg-amber-600 rounded font-semibold"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
