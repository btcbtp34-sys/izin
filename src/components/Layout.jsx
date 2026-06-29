import React, { useState } from 'react';
import { 
  Home, Calendar, Users, BarChart3, Settings, 
  Menu, X, Bell, Search, User, LogOut 
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children, currentUser, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Ana Sayfa', path: '/' },
    { icon: Calendar, label: 'İzin Planlama', path: '/planning' },
    { icon: Users, label: 'Çalışanlar', path: '/employees' },
    { icon: BarChart3, label: 'Raporlar', path: '/reports' },
    { icon: Settings, label: 'Ayarlar', path: '/settings' }
  ];

  const currentPath = window.location.hash.substring(1) || '/';

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Calendar className="logo-icon" />
            {sidebarOpen && <span className="logo-text">İzin Yönetim</span>}
          </div>
          <button 
            className="toggle-btn desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <a
              key={item.path}
              href={`#${item.path}`}
              className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <div className="user-name">{currentUser?.firstName} {currentUser?.lastName}</div>
                <div className="user-role">{currentUser?.position}</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={18} />
              <span>Çıkış</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Mobile Menu Button - Fixed Position */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
