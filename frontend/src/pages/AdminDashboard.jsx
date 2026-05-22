import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'ADMIN' });
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, storesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/dashboard'),
        axios.get('http://localhost:5000/api/admin/users'),
        axios.get('http://localhost:5000/api/admin/stores')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/add-user', newUser);
      setShowAddUser(false);
      fetchData(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add user');
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/add-store', newStore);
      setShowAddStore(false);
      fetchData(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add store');
    }
  };

  const filterAndSort = (data) => {
    let filtered = data.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.address.toLowerCase().includes(search.toLowerCase())
    );
    
    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="card stat-card">
          <h3>Total Users</h3>
          <div className="value">{stats.totalUsers}</div>
        </div>
        <div className="card stat-card">
          <h3>Total Stores</h3>
          <div className="value">{stats.totalStores}</div>
        </div>
        <div className="card stat-card">
          <h3>Total Ratings</h3>
          <div className="value">{stats.totalRatings}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="header-row">
          <h2>Users</h2>
          <div className="filters">
            <input 
              type="text" 
              placeholder="Search by name, email, address..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', marginRight: '1rem' }}
            />
            <button className="btn" onClick={() => setShowAddUser(!showAddUser)}>
              {showAddUser ? 'Cancel' : '+ Add User'}
            </button>
          </div>
        </div>

        {showAddUser && (
          <form onSubmit={handleAddUser} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--background)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Create New User (Admin / Store Owner)</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Name (Min 20 chars)" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required minLength={20} maxLength={60} style={{ padding: '0.5rem', flex: '1' }} className="input-group" />
              <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required style={{ padding: '0.5rem', flex: '1' }} className="input-group" />
              <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required style={{ padding: '0.5rem', flex: '1' }} className="input-group" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Address" value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} required style={{ padding: '0.5rem', flex: '2' }} className="input-group" />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ padding: '0.5rem', flex: '1' }} className="input-group">
                <option value="ADMIN">System Admin</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="NORMAL">Normal User</option>
              </select>
            </div>
            <button type="submit" className="btn">Submit User</button>
          </form>
        )}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('email')}>Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('address')}>Address {sortField === 'address' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('role')}>Role {sortField === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th>Store Rating</th>
              </tr>
            </thead>
            <tbody>
              {filterAndSort(users).map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td><span style={{ padding: '0.25rem 0.5rem', background: 'var(--primary)', borderRadius: '4px', fontSize: '0.75rem' }}>{user.role}</span></td>
                  <td>{user.role === 'STORE_OWNER' ? (user.rating ? Number(user.rating).toFixed(1) : 'No Ratings') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="header-row">
          <h2>Stores</h2>
          <button className="btn" onClick={() => setShowAddStore(!showAddStore)}>
            {showAddStore ? 'Cancel' : '+ Add Store'}
          </button>
        </div>

        {showAddStore && (
          <form onSubmit={handleAddStore} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--background)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Register New Store</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Store Name" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} required style={{ padding: '0.5rem', flex: '1' }} className="input-group" />
              <input type="email" placeholder="Store Email" value={newStore.email} onChange={e => setNewStore({...newStore, email: e.target.value})} required style={{ padding: '0.5rem', flex: '1' }} className="input-group" />
              <input type="text" placeholder="Store Address" value={newStore.address} onChange={e => setNewStore({...newStore, address: e.target.value})} required style={{ padding: '0.5rem', flex: '2' }} className="input-group" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <select value={newStore.ownerId} onChange={e => setNewStore({...newStore, ownerId: e.target.value})} required style={{ padding: '0.5rem', flex: '1' }} className="input-group">
                <option value="">-- Select Store Owner --</option>
                {users.filter(u => u.role === 'STORE_OWNER').map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn">Submit Store</button>
          </form>
        )}
        <div className="table-container" style={{ marginTop: '1.5rem' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {filterAndSort(stores).map(store => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.address}</td>
                  <td>{store.rating ? Number(store.rating).toFixed(1) : 'No Ratings'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
