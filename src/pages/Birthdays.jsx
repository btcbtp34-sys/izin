import React, { useState, useEffect } from 'react';
import { 
  Cake, Calendar, Mail, Phone, ChevronLeft, ChevronRight,
  Download, Send, Gift, PartyPopper, Users, TrendingUp, X
} from 'lucide-react';
import { getBirthdaysByDate, getEmployees } from '../data/mockData';
import './Birthdays.css';

const TEMPLATES = {
  'Samimi': "Sevgili {name},\n\nDoğum günün kutlu olsun! Nice mutlu, huzurlu ve sağlıklı yaşlara. İyi ki varsın! 🎂🎉",
  'Resmi': "Sayın {name},\n\nŞirketimiz adına doğum gününüzü en içten dileklerinizle kutlar, yeni yaşınızda sağlık, mutluluk ve başarılar dileriz.",
  'Yönetici': "Sevgili çalışma arkadaşım {name},\n\nEkibimize kattığın değerler için teşekkür eder, doğum gününü en içten dileklerimle kutlarım. Nice başarılı yıllara!",
  'Eğlenceli': "Mutlu Yıllar {name}! 🥳🎉\n\nYeni yaşının sana bol şans, neşe ve pasta getirmesini dileriz! Doğum günün kutlu olsun! 🍰🎈"
};

const GIFTS = [
  { id: 'giftcard-1000', title: 'Hediye Çeki (1000 TL)', val: 'Trendyol Cüzdan' },
  { id: 'giftcard-2000', title: 'Hediye Çeki (2000 TL)', val: 'Hepsiburada Altın' },
  { id: 'chocolate', title: 'Premium Çikolata Kutusu', val: 'Vakko L' },
  { id: 'cake', title: 'Doğum Günü Pastası', val: 'Divan Pastanesi' },
  { id: 'flowers', title: 'Çiçek Buketi', val: 'Premium Mevsim Buketi' },
  { id: 'leave', title: 'Tatil İzni (1 Gün Extra)', val: 'Ücretli İzin Kartı' }
];

const Birthdays = () => {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 4, 16)); // 16 Mayıs 2026
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [birthdaysOnDate, setBirthdaysOnDate] = useState([]);

  // Popup Modals State
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('Samimi');
  const [selectedGift, setSelectedGift] = useState('giftcard-1000');
  const [giftNote, setGiftNote] = useState('');
  
  // Get birthdays for selected date
  useEffect(() => {
    const birthdays = getBirthdaysByDate(selectedDate);
    setBirthdaysOnDate(birthdays);
    setSelectedEmployees([]); // Reset selection on date change
  }, [selectedDate]);

  // Update Message template dynamically based on activeEmployee and selectedTemplate
  useEffect(() => {
    const raw = TEMPLATES[selectedTemplate] || '';
    if (activeEmployee) {
      setMsgText(raw.replace('{name}', activeEmployee.firstName));
    } else if (selectedEmployees.length > 0) {
      setMsgText(raw.replace('{name}', `${selectedEmployees.length} çalışma arkadaşımıza`));
    }
  }, [selectedTemplate, activeEmployee, selectedEmployees, showMsgModal]);

  // Calculate age
  const calculateAge = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('.');
    const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const toggleEmployee = (id) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedEmployees.length === birthdaysOnDate.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(birthdaysOnDate.map(emp => emp.id));
    }
  };

  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const formatDate = (date) => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getDayName = (date) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[date.getDay()];
  };

  // Action handlers
  const handleSendMessage = (employee = null) => {
    if (employee) {
      setActiveEmployee(employee);
      setSelectedTemplate('Samimi');
      setShowMsgModal(true);
    } else if (selectedEmployees.length > 0) {
      setActiveEmployee(null);
      setSelectedTemplate('Samimi');
      setShowMsgModal(true);
    } else {
      alert('Lütfen en az bir kişi seçin!');
    }
  };

  const handleSendCard = (employee = null) => {
    handleSendMessage(employee); // Map Card sending to message custom modal
  };

  const handleSendGift = (employee = null) => {
    if (employee) {
      setActiveEmployee(employee);
      setSelectedGift('giftcard-1000');
      setGiftNote('Yeni yaşın kutlu olsun! Nice sağlıklı, başarılı yıllara... 🎁');
      setShowGiftModal(true);
    } else if (selectedEmployees.length > 0) {
      setActiveEmployee(null);
      setSelectedGift('giftcard-1000');
      setGiftNote('Yeni yaşınız kutlu olsun! Nice sağlıklı, başarılı yıllara... 🎁');
      setShowGiftModal(true);
    } else {
      alert('Lütfen en az bir kişi seçin!');
    }
  };

  const handleExportExcel = () => {
    alert(`${birthdaysOnDate.length} kişinin doğum günü bilgileri Excel'e aktarılıyor...\n\n📊 İndirme başlıyor...`);
  };

  const handleTemplateSelect = (templateName) => {
    alert(`"${templateName}" şablonu seçildi!\n\nMesaj içeriği hazırlanıyor...`);
  };

  const handleNewTemplate = () => {
    alert('Yeni mesaj şablonu oluşturuluyor...\n\n✍️ Şablon editörü açılıyor...');
  };

  const handleFilter = (filterName) => {
    alert(`"${filterName}" filtresi uygulanıyor...\n\n🔍 Sonuçlar güncelleniyor...`);
  };

  return (
    <div className="birthdays-page-new">
      {/* Header */}
      <div className="page-header-new">
        <div className="header-left-new">
          <div className="page-title-new">
            <PartyPopper size={24} className="title-icon" />
            <h1>Bugün Doğanlar</h1>
          </div>
        </div>
      </div>

      <div className="content-wrapper-new">
        {/* Main Content */}
        <div className="main-section-new">
          {/* Date Picker */}
          <div className="date-picker-bar">
            <div className="date-label">Bugün</div>
            <div className="date-controls">
              <button className="date-nav-button" onClick={prevDay}>
                <ChevronLeft size={18} />
              </button>
              <div className="date-display-box">
                <Calendar size={16} />
                <span className="date-text">{formatDate(selectedDate)}</span>
              </div>
              <button className="date-nav-button" onClick={nextDay}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="date-day-name">{getDayName(selectedDate)}</div>
          </div>

          {/* Birthday Count */}
          <div className="birthday-count-banner">
            <Cake size={20} />
            <span>Bugün toplam <strong>{birthdaysOnDate.length} kişi</strong> doğuyor</span>
          </div>

          {/* Employee Table */}
          <div className="table-container-new">
            <table className="birthday-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input 
                      type="checkbox" 
                      checked={selectedEmployees.length === birthdaysOnDate.length && birthdaysOnDate.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>Ad Soyad</th>
                  <th>Departman</th>
                  <th>Pozisyon</th>
                  <th>Doğum Tarihi</th>
                  <th>İletişim</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {birthdaysOnDate.map(employee => (
                  <tr key={employee.id}>
                    <td className="checkbox-col">
                      <input 
                        type="checkbox" 
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => toggleEmployee(employee.id)}
                      />
                    </td>
                    <td>
                      <div className="employee-cell">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=667eea&color=fff`}
                          alt={`${employee.firstName} ${employee.lastName}`}
                          className="employee-avatar"
                        />
                        <span className="employee-name">{employee.firstName} {employee.lastName}</span>
                      </div>
                    </td>
                    <td>{employee.department}</td>
                    <td>{employee.position}</td>
                    <td>
                      <div className="birth-info">
                        <div>{employee.birthDate}</div>
                        <div className="age-small">({calculateAge(employee.birthDate)} yaş)</div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info-cell">
                        <div className="contact-row">
                          {employee.email}
                        </div>
                        <div className="contact-row">
                          {employee.phone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button className="icon-action-btn" title="Mesaj Gönder" style={{ color: '#e11d48', background: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => handleSendMessage(employee)}>
                          <Mail size={14} />
                        </button>
                        <button className="icon-action-btn" title="Hediye Gönder" style={{ color: '#10b981', background: '#e6fffa', border: '1px solid #b2f5ea', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => handleSendGift(employee)}>
                          <Gift size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="table-pagination">
              <div className="pagination-info">Tümü seçildi ({birthdaysOnDate.length})</div>
              <div className="pagination-controls">
                <button className="page-btn">
                  <ChevronLeft size={16} />
                </button>
                <button className="page-btn active">1</button>
                <button className="page-btn">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Info Cards */}
          <div className="bottom-info-cards">
            <div className="info-card-item" onClick={() => handleSendCard()} style={{cursor: 'pointer'}}>
              <Gift size={24} className="info-icon" />
              <div>
                <h4>Doğum Günü Kartı Özelleştir</h4>
                <p>Şirket logosu iletilirdi veya geri takibinize dağınlı görünülebilirsiniz</p>
              </div>
            </div>
            <div className="info-card-item" onClick={() => handleSendMessage()} style={{cursor: 'pointer'}}>
              <Send size={24} className="info-icon" />
              <div>
                <h4>Toplu Mesaj Gönder</h4>
                <p>Seçili {selectedEmployees.length} kişiye toplu doğum günü mesajı göndermek için takvimi</p>
              </div>
            </div>
            <div className="info-card-item" onClick={() => alert('Takvim özelliği yakında...')} style={{cursor: 'pointer'}}>
              <Calendar size={24} className="info-icon" />
              <div>
                <h4>İpucu</h4>
                <p>Kaşilere özel türel veya hatıra toplu mesajı göndermek için talebi kullanın</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar-new">
          {/* Action Buttons */}
          <div className="action-buttons-top">
            <button className="action-btn-secondary" onClick={() => handleSendCard()}>
              <Download size={18} />
              Doğum Günü Kartı Gönder
            </button>
            <button className="action-btn-primary" onClick={() => handleSendMessage()}>
              <Send size={18} />
              Mesaj Gönder
            </button>
            <button className="action-btn-secondary" onClick={handleExportExcel}>
              <Gift size={18} />
              Excel'e Aktar
            </button>
          </div>

          {/* Statistics */}
          <div className="stats-card">
            <h3>Doğum Günü İstatistikleri</h3>
            
            <div className="stat-box purple">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{birthdaysOnDate.length}</div>
                <div className="stat-text">Bugün Doğan</div>
              </div>
            </div>

            <div className="stat-box green">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">24</div>
                <div className="stat-text">Bu Hafta</div>
              </div>
            </div>

            <div className="stat-box orange">
              <div className="stat-icon">
                <Cake size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">98</div>
                <div className="stat-text">Bu Ay</div>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="filters-card">
            <h3>Hızlı Filtreler</h3>
            <div className="filter-items">
              <button className="filter-btn" onClick={() => handleFilter('Bu Hafta')}>
                <Calendar size={14} />
                <span>Bu Hafta</span>
                <span className="filter-badge">24 kişi</span>
              </button>
              <button className="filter-btn" onClick={() => handleFilter('Bu Ay')}>
                <Calendar size={14} />
                <span>Bu Ay</span>
                <span className="filter-badge">98 kişi</span>
              </button>
              <button className="filter-btn" onClick={() => handleFilter('Önümüzdeki 7 Gün')}>
                <Calendar size={14} />
                <span>Önümüzdeki 7 Gün</span>
                <span className="filter-badge">31 kişi</span>
              </button>
              <button className="filter-btn active" onClick={() => handleFilter('Tüm Doğum Günü Listesi')}>
                <Calendar size={14} />
                <span>Tüm Doğum Günü Listesi</span>
              </button>
            </div>
          </div>

          {/* Message Templates */}
          <div className="templates-card">
            <div className="card-header-with-link">
              <h3>Mesaj Şablonları</h3>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); alert('Tüm şablonlar görüntüleniyor...'); }}>Tümü</a>
            </div>
            <div className="template-items">
              <div className="template-btn" onClick={() => handleTemplateSelect('Doğum Günü Kutlama Mesajı')}>Doğum Günü Kutlama Mesajı</div>
              <div className="template-btn" onClick={() => handleTemplateSelect('Resmi Kutlama Mesajı')}>Resmi Kutlama Mesajı</div>
              <div className="template-btn" onClick={() => handleTemplateSelect('Samimi Kutlama Mesajı')}>Samimi Kutlama Mesajı</div>
              <div className="template-btn" onClick={() => handleTemplateSelect('Yönetici Kutlama Mesajı')}>Yönetici Kutlama Mesajı</div>
            </div>
            <button className="new-template-btn" onClick={handleNewTemplate}>+ Yeni Şablon Oluştur</button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL - SEND BIRTHDAY MESSAGE */}
      {showMsgModal && (
        <div className="birthday-modal-overlay" onClick={() => setShowMsgModal(false)}>
          <div className="birthday-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="birthday-modal-header">
              <h3>
                <Cake size={20} />
                Doğum Günü Mesajı Gönder
              </h3>
              <button className="birthday-modal-close" onClick={() => setShowMsgModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="birthday-modal-body">
              <div className="birthday-modal-form-group">
                <label>Alıcı</label>
                <input 
                  type="text" 
                  className="birthday-modal-select" 
                  disabled 
                  value={activeEmployee ? `${activeEmployee.firstName} ${activeEmployee.lastName} (${activeEmployee.position})` : `Seçili ${selectedEmployees.length} Çalışan`} 
                />
              </div>

              <div className="birthday-modal-form-group">
                <label>Mesaj Şablonu</label>
                <select 
                  className="birthday-modal-select"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="Samimi">Samimi Kutlama</option>
                  <option value="Resmi">Resmi Kutlama</option>
                  <option value="Yönetici">Yönetici Kutlama</option>
                  <option value="Eğlenceli">Eğlenceli Kutlama</option>
                </select>
              </div>

              <div className="birthday-modal-form-group">
                <label>Mesaj İçeriği</label>
                <textarea 
                  className="birthday-modal-textarea"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                />
              </div>
            </div>
            <div className="birthday-modal-footer">
              <button className="btn-modal" onClick={() => setShowMsgModal(false)}>İptal</button>
              <button className="btn-modal primary-btn" onClick={() => {
                alert('Doğum günü tebrik mesajı başarıyla gönderildi! 🎉');
                setShowMsgModal(false);
              }}>Tebrik Gönder</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL - SEND BIRTHDAY GIFT */}
      {showGiftModal && (
        <div className="birthday-modal-overlay" onClick={() => setShowGiftModal(false)}>
          <div className="birthday-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="birthday-modal-header">
              <h3>
                <Gift size={20} />
                Doğum Günü Hediyesi Gönder
              </h3>
              <button className="birthday-modal-close" onClick={() => setShowGiftModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="birthday-modal-body">
              <div className="birthday-modal-form-group">
                <label>Alıcı</label>
                <input 
                  type="text" 
                  className="birthday-modal-select" 
                  disabled 
                  value={activeEmployee ? `${activeEmployee.firstName} ${activeEmployee.lastName}` : `Seçili ${selectedEmployees.length} Çalışan`} 
                />
              </div>

              <div className="birthday-modal-form-group">
                <label>Hediye Seçin</label>
                <div className="gift-choice-grid">
                  {GIFTS.map(gift => (
                    <div 
                      key={gift.id} 
                      className={`gift-choice-card ${selectedGift === gift.id ? 'selected' : ''}`}
                      onClick={() => setSelectedGift(gift.id)}
                    >
                      <div className="gift-icon-wrapper">
                        <Gift size={16} />
                      </div>
                      <span className="gift-title">{gift.title}</span>
                      <span className="gift-val">{gift.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="birthday-modal-form-group">
                <label>Hediye Kartı Notu</label>
                <textarea 
                  className="birthday-modal-textarea"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Hediye paketi üzerine eklenecek not..."
                  style={{ height: '70px' }}
                />
              </div>
            </div>
            <div className="birthday-modal-footer">
              <button className="btn-modal" onClick={() => setShowGiftModal(false)}>Kapat</button>
              <button className="btn-modal primary-btn" onClick={() => {
                const giftName = GIFTS.find(g => g.id === selectedGift)?.title || 'Hediye';
                alert(`${giftName} gönderim talimatı başarıyla onaylandı! 🎁 En kısa sürede teslim edilecektir.`);
                setShowGiftModal(false);
              }}>Hediyeyi Gönder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Birthdays;
