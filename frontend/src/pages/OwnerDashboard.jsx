import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('https://roxilerbackend-three.vercel.app/api/owner/dashboard');
      setDashboard(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!dashboard) return <div className="container">Loading... (Or no store assigned to you)</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Store Owner Dashboard</h1>
      
      <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{dashboard.storeName}</h2>
        <div style={{ color: 'var(--text-secondary)' }}>Average Rating</div>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          {dashboard.averageRating ? Number(dashboard.averageRating).toFixed(1) : 'No Ratings'}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Users Who Rated Your Store</h2>
        {dashboard.users.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Rating Given</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.users.map(user => (
                  <tr key={user.userId}>
                    <td>{user.name}</td>
                    <td>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={star <= user.score ? 'active' : 'inactive'} style={{ cursor: 'default' }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No ratings have been submitted yet.</p>
        )}
      </div>
    </div>
  );
}
