import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import DragDropCalendar from './pages/DragDropCalendar';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Birthdays from './pages/Birthdays';
import Approvals from './pages/Approvals';
import OvertimeApproval from './pages/OvertimeApproval';
import { getEmployees, DEMO_USERS, COLLAR_TYPES } from './data/mockData';
import { Shield, HardHat, Briefcase, UserCheck, LogIn, ArrowRight } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('/planning'); // Doğrudan İzin Planlama ile başlasın
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [activeTab, setActiveTab] = useState('planning');

  useEffect(() => {
    // Kayıtlı kullanıcı kontrolü
    const savedUserId = localStorage.getItem('activeUserId');
    const employees = getEmployees();
    
    if (savedUserId) {
      const found = employees.find(e => e.id === parseInt(savedUserId));
      if (found) {
        setCurrentUser(found);
      } else {
        // Varsayılan Yönetici: Hasan Cavit Koçak
        setCurrentUser(employees.find(e => e.id === 1) || employees[0]);
      }
    } else {
      // İlk girişte Hasan Cavit Koçak
      const manager = employees.find(e => e.id === 1) || employees[0];
      setCurrentUser(manager);
    }

    // Hash routing
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || '/planning';
      setCurrentPage(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('activeUserId', user.id.toString());
    setShowLoginScreen(false);
  };

  const handleLogout = () => {
    setShowLoginScreen(true);
  };

  // Giriş Ekranı (Login Screen)
  if (showLoginScreen || !currentUser) {
    const employees = getEmployees();
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          maxWidth: '560px',
          width: '100%',
          padding: '36px',
          color: '#1e293b'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              margin: '0 auto 16px',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)'
            }}>
              <LogIn size={28} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
              İzin Yönetim Sistemi Girişi
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              İş akışını ve onay mekanizmasını test etmek için bir rol seçin
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 1. Yönetici */}
            <div 
              onClick={() => handleSelectUser(employees.find(e => e.id === 1) || employees[0])}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#dbeafe',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>Hasan Cavit Koçak</strong>
                  <span style={{ fontSize: '11px', background: '#2563eb', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                    YÖNETİCİ
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                  Tüm onayları inceleme, onaylama ve geri gönderme yetkisi
                </div>
              </div>
              <ArrowRight size={18} color="#94a3b8" />
            </div>

            {/* 2. Formen */}
            <div 
              onClick={() => handleSelectUser(employees.find(e => e.id === 2) || employees[1])}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HardHat size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>Ali Vural</strong>
                  <span style={{ fontSize: '11px', background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                    FORMEN
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                  Mavi yakalı çalışanların izinlerini planlar ve onaya gönderir
                </div>
              </div>
              <ArrowRight size={18} color="#94a3b8" />
            </div>

            {/* 3. Beyaz Yaka */}
            <div 
              onClick={() => handleSelectUser(employees.find(e => e.id === 5) || employees[2])}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#ede9fe',
                color: '#6d28d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Briefcase size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>Ayşe Demir</strong>
                  <span style={{ fontSize: '11px', background: '#8b5cf6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                    ÇALIŞAN
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                  Kendi yıllık izin planlamasını yapar ve onaya sunar
                </div>
              </div>
              <ArrowRight size={18} color="#94a3b8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case '/':
      case '/planning':
        return (
          <Planning 
            currentUser={currentUser} 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSwitchUser={() => setShowLoginScreen(true)} 
          />
        );
      case '/approvals':
        return <Approvals currentUser={currentUser} onSwitchUser={() => setShowLoginScreen(true)} />;
      case '/overtime':
        return <OvertimeApproval currentUser={currentUser} />;
      case '/calendar-planning':
        return <DragDropCalendar currentUser={currentUser} />;
      case '/employees':
        return <Employees />;
      case '/birthdays':
        return <Birthdays />;
      case '/reports':
        return <Reports />;
      case '/settings':
        return <Settings />;
      default:
        return (
          <Planning 
            currentUser={currentUser} 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSwitchUser={() => setShowLoginScreen(true)} 
          />
        );
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      onSelectUser={handleSelectUser}
      onLogout={handleLogout}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
      }}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
