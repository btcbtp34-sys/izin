import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    phone: '+90 555 123 4567',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    leaveApprovalNotif: true,
    birthdayNotif: true,
    
    // System
    language: 'tr',
    theme: 'light',
    dateFormat: 'DD/MM/YYYY',
    
    // Leave Settings
    maxCarryOver: 30,
    minAdvanceNotice: 7,
    autoApprove: false
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'system', label: 'Sistem', icon: Globe },
    { id: 'leave', label: 'İzin Ayarları', icon: SettingsIcon },
    { id: 'security', label: 'Güvenlik', icon: Shield }
  ];

  const handleSave = () => {
    alert('Ayarlar kaydedildi!');
  };

  return (
    <div className="settings-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Ayarlar</h1>
        <p className="page-subtitle">Sistem ve kullanıcı ayarlarını yönetin</p>
      </div>

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Profil Bilgileri</h2>
              <p className="settings-section-description">
                Kişisel bilgilerinizi güncelleyin
              </p>

              <div className="form-group">
                <label className="form-label">Ad</label>
                <input
                  type="text"
                  className="input"
                  value={settings.firstName}
                  onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Soyad</label>
                <input
                  type="text"
                  className="input"
                  value={settings.lastName}
                  onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-posta</label>
                <input
                  type="email"
                  className="input"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input
                  type="tel"
                  className="input"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Bildirim Tercihleri</h2>
              <p className="settings-section-description">
                Hangi bildirimleri almak istediğinizi seçin
              </p>

              <div className="setting-item">
                <div className="setting-item-info">
                  <h4>E-posta Bildirimleri</h4>
                  <p>Önemli güncellemeler için e-posta alın</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-item-info">
                  <h4>Push Bildirimleri</h4>
                  <p>Tarayıcı üzerinden anlık bildirimler</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-item-info">
                  <h4>İzin Onayları</h4>
                  <p>İzin onay/red bildirimleri</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.leaveApprovalNotif}
                    onChange={(e) => setSettings({ ...settings, leaveApprovalNotif: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-item-info">
                  <h4>Doğum Günleri</h4>
                  <p>Çalışan doğum günü hatırlatmaları</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.birthdayNotif}
                    onChange={(e) => setSettings({ ...settings, birthdayNotif: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Sistem Ayarları</h2>
              <p className="settings-section-description">
                Genel sistem tercihlerini yapılandırın
              </p>

              <div className="form-group">
                <label className="form-label">Dil</label>
                <select
                  className="select"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tema</label>
                <select
                  className="select"
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                >
                  <option value="light">Açık</option>
                  <option value="dark">Koyu</option>
                  <option value="auto">Otomatik</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tarih Formatı</label>
                <select
                  className="select"
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="settings-section">
              <h2 className="settings-section-title">İzin Yönetimi Ayarları</h2>
              <p className="settings-section-description">
                İzin kurallarını ve limitleri belirleyin
              </p>

              <div className="form-group">
                <label className="form-label">Maksimum Devir (%)</label>
                <input
                  type="number"
                  className="input"
                  value={settings.maxCarryOver}
                  onChange={(e) => setSettings({ ...settings, maxCarryOver: e.target.value })}
                  min="0"
                  max="100"
                />
                <small className="form-help">
                  Bir önceki yıldan devredilebilecek maksimum izin yüzdesi
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Bildirim Süresi (gün)</label>
                <input
                  type="number"
                  className="input"
                  value={settings.minAdvanceNotice}
                  onChange={(e) => setSettings({ ...settings, minAdvanceNotice: e.target.value })}
                  min="0"
                />
                <small className="form-help">
                  İzin talebinin kaç gün önceden yapılması gerektiği
                </small>
              </div>

              <div className="setting-item">
                <div className="setting-item-info">
                  <h4>Otomatik Onay</h4>
                  <p>Belirli koşullarda izinleri otomatik onayla</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.autoApprove}
                    onChange={(e) => setSettings({ ...settings, autoApprove: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Güvenlik</h2>
              <p className="settings-section-description">
                Hesap güvenliği ve şifre ayarları
              </p>

              <div className="form-group">
                <label className="form-label">Mevcut Şifre</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>

              <div className="form-group">
                <label className="form-label">Yeni Şifre</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>

              <div className="form-group">
                <label className="form-label">Yeni Şifre (Tekrar)</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>

              <button className="btn btn-primary">
                Şifreyi Güncelle
              </button>
            </div>
          )}

          {/* Save Button */}
          <div className="settings-actions">
            <button className="btn btn-secondary">
              İptal
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
