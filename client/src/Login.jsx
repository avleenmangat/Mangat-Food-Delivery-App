import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ setUser }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({ name: '', email: '', password: '' });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await axios.post('http://localhost:5000/api/auth/register', formData);
        setMessage('Registered successfully! Please log in.');
        setIsRegistering(false);
      } else {
        const res = await axios.post('http://localhost:5000/api/auth/login', formData);
        localStorage.setItem('token', res.data.token);
        const payload = JSON.parse(atob(res.data.token.split('.')[1]));
        setUser({ id: payload.id });
      }
    } catch (err) {
      setMessage('Something went wrong. Try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegistering && (
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <button
          type="button"
          onClick={toggleMode}
          className="w-full text-sm text-blue-600 mt-2 hover:underline"
        >
          {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
        {message && <p className="text-red-500 text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
