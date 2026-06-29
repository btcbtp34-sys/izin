import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { getEmployees } from './data/mockData';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('/');

  useEffect(() => {
    // Check data version and reset if needed
    const dataVersion = localStorage.getItem('dataVersion');
    const CURRENT_VERSION = '2026-06-fix'; // June 2026 - Fixed Manager
    
    if (dataVersion !== CURRENT_VERSION) {
      console.log('🔄 Updating data with Hasan Cavit Koçak as manager...');
      localStorage.clear(); // Clear all old data
      localStorage.setItem('dataVersion', CURRENT_VERSION);
      window.location.reload();
      return;
    }
    
    console.log('✅ Running with June 2026 data');
    console.log('👤 Manager: Hasan Cavit Koçak');
    console.log('💡 To reset data: localStorage.clear(); location.reload();');

    // Use fixed manager - Hasan Cavit Koçak (id: 1)
    const employees = getEmployees();
    const manager = employees.find(e => e.id === 1);
    
    if (manager) {
      console.log(`✅ Logged in as: ${manager.firstName} ${manager.lastName} - ${manager.position}`);
    }
    
    setCurrentUser(manager);

    // Handle hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || '/';
      setCurrentPage(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      alert('Çıkış yapıldı!');
      window.location.reload();
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case '/':
        return <Dashboard />;
      case '/planning':
        return <Planning currentUser={currentUser} />;
      case '/employees':
        return <Employees />;
      case '/reports':
        return <Reports />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUser) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Yükleniyor...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Sistem hazırlanıyor
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout currentUser={currentUser} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}

export default App;
