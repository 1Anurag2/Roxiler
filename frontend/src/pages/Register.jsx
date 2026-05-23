import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await axios.post('https://roxilerbackend-six.vercel.app/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-box">
        <h2 style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '2rem' }}>Create Account</h2>
        {error && <div className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required minLength={20} maxLength={60} />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Min 20, max 60 characters</small>
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>8-16 chars, 1 uppercase, 1 special char</small>
          </div>
          <div className="input-group">
            <label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} required maxLength={400} disabled={isLoading} />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
