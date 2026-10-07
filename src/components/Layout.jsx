import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, CheckSquare, BarChart3, Settings as SettingsIcon,
  User, LogOut, ChevronDown, Check, ShieldCheck, Wrench, Briefcase, Clock
} from 'lucide-react';
import './Layout.css';
import { COLLAR_TYPES, DEMO_USERS, getEmployees, getLeaveRequests, leaveStatuses } from '../data/mockData';

const Layout = ({ children, currentUser, onSelectUser, onLogout, activeTab, onTabChange }) => {
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const modeMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const currentPath = window.location.hash.substring(1) || '/planning';
  const allRequests = getLeaveRequests();
  const pendingCount = allRequests.filter(r => r.status === leaveStatuses.PENDING).length;

  // Dışarı tıklandığında dropdownları kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) {
        setModeDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuTabs = [
    { id: 'planning', label: 'İzin Planlama', path: '/planning', icon: Calendar },
    { id: 'approvals', label: 'İzin Onayları', path: '/approvals', icon: CheckSquare, badge: pendingCount },
    { id: 'overtime', label: 'Fazla Mesai Onay', path: '/overtime', icon: Clock, badge: 13 },
    { id: 'reports', label: 'Raporlar', path: '/reports', icon: BarChart3 },
    { id: 'settings', label: 'Ayarlar', path: '/settings', icon: SettingsIcon }
  ];

  const initials = `${currentUser?.firstName?.[0] || 'H'}${currentUser?.lastName?.[0] || 'K'}`;

  // Mod ikonunu belirle (Kesinlikle emoji yok, sadece svg ikon)
  const getModeIcon = (user) => {
    if (user?.isManager) return <ShieldCheck size={16} className="mode-role-icon icon-manager" />;
    if (user?.isForeman) return <Wrench size={16} className="mode-role-icon icon-foreman" />;
    return <Briefcase size={16} className="mode-role-icon icon-white" />;
  };

  const getModeLabel = (user) => {
    if (user?.isManager) return 'Yönetici Modu';
    if (user?.isForeman) return 'Formen Modu';
    return 'Çalışan';
  };

  const employees = getEmployees();

  return (
    <div className="apple-app-container">
      {/* APPLE TARZI KURUMSAL TOPBAR */}
      <header className="apple-navbar">
        <div className="apple-navbar-inner">
          
          {/* Sol: Monogram Logo & Menü Sekmeleri */}
          <div className="navbar-section-left">
            <div 
              className="apple-brand-badge" 
              title={`${currentUser?.firstName} ${currentUser?.lastName} - ${getModeLabel(currentUser)}`}
            >
              <span>{initials}</span>
            </div>

            <nav className="apple-nav-tabs">
              {menuTabs.map((tab) => {
                const Icon = tab.icon;
                const isTabActive = currentPath === tab.path || (currentPath === '/' && tab.path === '/planning');

                return (
                  <button
                    key={tab.id}
                    className={`apple-tab-button ${isTabActive ? 'active' : ''}`}
                    onClick={() => {
                      window.location.hash = `#${tab.path}`;
                      if (onTabChange) onTabChange(tab.id);
                    }}
                  >
                    <Icon size={16} className="tab-icon" />
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (tab.id === 'approvals' || tab.id === 'overtime') && (
                      <span className="apple-tab-badge">{tab.badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sağ: İnteraktif Mod Seçici & Profil Menüsü */}
          <div className="navbar-section-right">
            
            {/* 1. PLANLAMA MODU SEÇİCİ DROPDOWN (ÇALIŞAN) */}
            <div className="apple-dropdown-wrapper" ref={modeMenuRef}>
              <button 
                className={`apple-mode-selector-btn ${modeDropdownOpen ? 'open' : ''}`}
                onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                title="Sistem rolünü ve kullanıcı modunu değiştirin"
              >
                {getModeIcon(currentUser)}
                <span className="mode-btn-text">{getModeLabel(currentUser)}</span>
                <ChevronDown size={14} className="mode-chevron" />
              </button>

              {modeDropdownOpen && (
                <div className="apple-menu-dropdown mode-dropdown-menu">
                  <div className="dropdown-section-title">Kullanıcı Rolü & Modu</div>

                  {DEMO_USERS.map((u) => {
                    const emp = employees.find(e => e.id === u.id) || u;
                    const isSelected = currentUser?.id === emp.id;

                    return (
                      <button
                        key={emp.id}
                        className={`apple-menu-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (onSelectUser) onSelectUser(emp);
                          setModeDropdownOpen(false);
                        }}
                      >
                        <div className="item-icon-col">
                          {getModeIcon(emp)}
                        </div>
                        <div className="item-details-col">
                          <div className="item-title">{getModeLabel(emp)}</div>
                          <div className="item-subtitle">{emp.firstName} {emp.lastName} • {emp.department}</div>
                        </div>
                        {isSelected && <Check size={16} className="item-check-icon" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. PROFİL MENÜSÜ */}
            <div className="apple-dropdown-wrapper" ref={profileMenuRef}>
              <button 
                className="apple-profile-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                title={`${currentUser?.firstName} ${currentUser?.lastName}`}
              >
                <User size={17} />
              </button>

              {profileDropdownOpen && (
                <div className="apple-menu-dropdown profile-dropdown-menu">
                  <div className="profile-card-header">
                    <div className="profile-avatar-circle">{initials}</div>
                    <div className="profile-text-group">
                      <div className="profile-name">{currentUser?.firstName} {currentUser?.lastName}</div>
                      <div className="profile-dept">{currentUser?.department} • {currentUser?.position}</div>
                      <div className="profile-role-pill">{currentUser?.collarType || 'Yönetici'}</div>
                    </div>
                  </div>

                  <div className="dropdown-hr" />

                  <button 
                    className="apple-menu-item item-logout"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                  >
                    <div className="item-icon-col">
                      <LogOut size={16} />
                    </div>
                    <div className="item-details-col">
                      <div className="item-title">Oturumu Kapat</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* ANA İÇERİK */}
      <main className="apple-main-canvas">
        {children}
      </main>
    </div>
  );
};

export default Layout;
