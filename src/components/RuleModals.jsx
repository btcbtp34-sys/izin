import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Sparkles, AlertTriangle, 
  Calendar, Check, X, ArrowRight, BookOpen, Search,
  Clock, CheckCircle, Info, ChevronRight, Layers, FileText
} from 'lucide-react';
import './RuleModals.css';

/**
 * 1. KURAL UYARI / BİLGİLENDİRME MODALI (RuleNoticeModal)
 * Chrome'un standart alert() penceresi yerine açılan, kurumsal ve modern pop-up ekranı.
 * Kural engellerini ve otomatik tarih düzeltmelerini görselleştirir.
 */
export const RuleNoticeModal = ({
  isOpen,
  onClose,
  type = 'notice', // 'error' | 'notice' | 'warning'
  title,
  subtitle,
  employeeName,
  error,
  notices = [],
  dateInfo,
  onViewAllRules
}) => {
  if (!isOpen) return null;

  const isError = type === 'error';

  // Kural metninden kural etiketini çıkarma yardımcısı (örn: "Kural 5:", "Kural 6:")
  const parseRuleNotice = (text) => {
    const match = text.match(/^(Kural\s+\d+[^:]*):(.*)$/i);
    if (match) {
      return { tag: match[1].trim(), content: match[2].trim() };
    }
    return { tag: 'İş Kuralı', content: text };
  };

  return (
    <div className="rule-modal-backdrop" onClick={onClose}>
      <div className="rule-modal-card animate-scale" onClick={(e) => e.stopPropagation()}>
        
        {/* Başlık Alanı */}
        <div className={`rule-modal-header ${isError ? 'header-error' : 'header-notice'}`}>
          <div className="rule-modal-header-left">
            <div className={`rule-icon-circle ${isError ? 'circle-red' : 'circle-blue'}`}>
              {isError ? <ShieldAlert size={24} /> : <Sparkles size={24} />}
            </div>
            <div>
              <div className="rule-badge-pill">
                {isError ? 'Planlama Kuralı Engeli' : 'Otomatik İş Kuralı Uyarlaması'}
              </div>
              <h3 className="rule-modal-title">
                {title || (isError ? 'Kural Denetimi Uyarısı' : 'İş Kuralları Uygulandı')}
              </h3>
              <p className="rule-modal-subtitle">
                {subtitle || (employeeName ? `${employeeName} için planlama işlemi` : 'İzin planlama motoru bildirimi')}
              </p>
            </div>
          </div>
          <button className="rule-close-btn" onClick={onClose} type="button" title="Kapat">
            <X size={18} />
          </button>
        </div>

        {/* Gövde */}
        <div className="rule-modal-body">
          {/* Hata Durumu (Kural İhlali) */}
          {isError && error && (
            <div className="rule-alert-box error">
              <div className="rule-alert-icon">
                <AlertTriangle size={20} />
              </div>
              <div className="rule-alert-content">
                <strong className="rule-alert-heading">Kural Kısıtlaması:</strong>
                <p className="rule-alert-text">{error}</p>
                <div className="rule-alert-hint">
                  💡 Bu planlamayı kaydetmek için lütfen tarihleri iş kuralına uygun şekilde revize ediniz.
                </div>
              </div>
            </div>
          )}

          {/* Otomatik Düzenleme Durumu (Notices) */}
          {!isError && notices && notices.length > 0 && (
            <div className="rule-notices-container">
              <div className="rule-notices-title">
                <ShieldCheck size={16} className="text-primary-blue" />
                <span>Uygulanan Şirket İş Kuralları:</span>
              </div>
              <div className="rule-notices-list">
                {notices.map((notice, idx) => {
                  const { tag, content } = parseRuleNotice(notice);
                  return (
                    <div key={idx} className="rule-notice-item">
                      <div className="rule-tag-pill">{tag}</div>
                      <div className="rule-notice-text">{content}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tarih ve Pazar Günü Açıklama Kartı (Eğer bilgi mevcutsa) */}
          {dateInfo && (
            <div className="rule-dates-card">
              <div className="dates-card-header">
                <Calendar size={15} />
                <span>Güncellenen İzin Aralığı</span>
              </div>
              <div className="dates-range-flow">
                <div className="date-flow-item">
                  <span className="flow-label">Başlangıç</span>
                  <span className="flow-val">{dateInfo.start}</span>
                </div>
                <ArrowRight size={16} className="flow-arrow" />
                <div className="date-flow-item">
                  <span className="flow-label">Bitiş</span>
                  <span className="flow-val">{dateInfo.end}</span>
                </div>
                <div className="flow-badge-total">
                  <span className="flow-days-val">{dateInfo.duration} İş Günü</span>
                </div>
              </div>
              <div className="dates-sunday-note">
                <Info size={14} />
                <span>Pazar günleri haftalık tatil olduğu için hesaba dahil edilmez ve izin bakiyesinden düşülmez.</span>
              </div>
            </div>
          )}

        </div>

        {/* Alt Butonlar */}
        <div className="rule-modal-footer">
          {onViewAllRules && (
            <button 
              type="button" 
              className="btn-rule-ghost"
              onClick={() => {
                onClose();
                onViewAllRules();
              }}
            >
              <BookOpen size={16} />
              <span>Tüm Kural Setlerini İncele</span>
            </button>
          )}
          <button 
            type="button" 
            className={`btn-rule-primary ${isError ? 'btn-red' : 'btn-blue'}`}
            onClick={onClose}
          >
            <Check size={16} />
            <span>{isError ? 'Anladım, Düzelt' : 'Harika, Devam Et'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

/**
 * 2. KURAL SETLERİ REHBERİ MODALI (RuleDirectoryModal)
 * İzin planlama ekranındaki tüm aktif iş kurallarını (Kural 1 - Kural 11)
 * detaylı açıklamalar ve örnek senaryolarla sunan interaktif pop-up.
 */
export const RuleDirectoryModal = ({ isOpen, onClose }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const rulesData = [
    {
      id: 'rule-5',
      code: 'KURAL 5',
      title: 'Cuma İzni Kuralı (Hafta Sonu Bağlantısı)',
      category: 'weekend',
      badge: 'Otomatik Ekleme',
      badgeColor: 'amber',
      description: 'Cuma günü izin seçildiğinde veya izin bitişi Cuma gününe denk geldiğinde, Cumartesi günü de otomatik olarak plana eklenir.',
      example: 'Örnek: Çalışan yalnızca 10 Temmuz Cuma gününü seçtiğinde; sistem bitiş tarihini 11 Temmuz Cumartesi olarak günceller ve 2 gün izin düşer.',
      systemAction: 'Tarih aralığına Cumartesi otomatik eklenir.'
    },
    {
      id: 'rule-6',
      code: 'KURAL 6',
      title: 'Cumartesi İzni & Pazar Kuralı',
      category: 'weekend',
      badge: 'Pazartesi Ekleme & Pazar Atlama',
      badgeColor: 'blue',
      description: 'Cumartesi günü izin seçildiğinde Pazartesi günü de otomatik olarak plana eklenir. Pazar günleri haftalık tatildir; takvimde yer almaz ve izin hakkından düşülmez.',
      example: 'Örnek: Cumartesi günü izin seçildiğinde ➔ Cumartesi + Pazartesi olmak üzere 2 iş günü izin planlanır (Pazar atlanır ve sayılmaz).',
      systemAction: 'Pazar atlanarak Pazartesi plana bağlanır.'
    },
    {
      id: 'rule-4',
      code: 'KURAL 4',
      title: 'İki Adet 6 Günlük İzin Aralığı',
      category: 'limits',
      badge: 'Zorunlu Aralık: 4 Gün',
      badgeColor: 'purple',
      description: 'Bir çalışan ardışık olarak iki kez 6 günlük izin kullanabilir; ancak bu iki 6 günlük izin bloğu arasında en az 4 tam takvim günü bulunmalıdır.',
      example: 'Örnek: 1-6 Temmuz tarihlerinde 6 gün izin kullanan bir çalışan, ikinci 6 günlük iznini en erken 11 Temmuz tarihinde başlatabilir.',
      systemAction: '4 günden az ara olan planlamalar sistemce engellenir.'
    },
    {
      id: 'rule-7',
      code: 'KURAL 7',
      title: 'Kısa Süreli İzin Limiti (1 Günlük İzinler)',
      category: 'limits',
      badge: 'Yıllık Limit: 4 Kez',
      badgeColor: 'rose',
      description: '2 günden az olan (1 günlük münferit) izinler, bir çalışan tarafından takvim yılı içerisinde en fazla 4 defa planlanabilir ve kullanılabilir.',
      example: 'Örnek: Yıl içinde 4 kez tek günlük izin kullanan çalışan, 5. kez tek günlük izin talebinde bulunamaz.',
      systemAction: '4. izin doldurulduğunda sonraki tek günlük izinler engellenir.'
    },
    {
      id: 'rule-1-2',
      code: 'KURAL 1 & 2',
      title: 'İzin Hakkı & Devir Önceliği',
      category: 'balance',
      badge: 'Kazanılan Önceliklidir',
      badgeColor: 'emerald',
      description: 'İzin planlamalarında öncelikle cari çalışma yılında hak edilen (kazanılan) izin günleri kullanılır. Cari hak tükendikten sonra önceki yıldan devreden izinler harcanır.',
      example: 'Örnek: 14 gün hakkı ve 5 gün devri olan bir kişi 15 gün izin planlarsa; 14 gün hak edilen, 1 gün devreden izinden düşülür.',
      systemAction: 'Sistem izin bakiyesini otomatik sırayla düşer.'
    },
    {
      id: 'rule-8-9',
      code: 'KURAL 8 & 9',
      title: 'Planlama & Onay Akış Ayrımı',
      category: 'workflow',
      badge: 'Yönetici Onayı',
      badgeColor: 'indigo',
      description: 'İzin planlama matrisinde oluşturulan izinler taslak plandır. "Onaya Gönder" işlemiyle "Onay Bekliyor" (Turuncu) statüsüne geçer. Yönetici onayladığında kesinleşir (Yeşil).',
      example: 'Örnek: Formen planlamayı tamamlar, yönetici tek tuşla topluca veya münferit olarak inceler ve onaylar.',
      systemAction: 'Taslak (Mavi) ➔ Onay Bekliyor (Turuncu) ➔ Onaylandı (Yeşil).'
    },
    {
      id: 'rule-10-11',
      code: 'KURAL 10 & 11',
      title: 'Departmana Geri Gönderme & Revizyon',
      category: 'workflow',
      badge: 'Gerekçeli Revizyon',
      badgeColor: 'cyan',
      description: 'Yönetici onaylamadığı izinleri gerekçe belirterek geri gönderebilir. Geri gönderilen izinler plana geri döner, formen/çalışan tarafından düzenlenip tekrar onaya sunulur.',
      example: 'Örnek: Yönetici "Vardiya yoğunluğu nedeniyle 1 hafta kaydırınız" notuyla geri gönderir; çalışan tarihi güncelleyip onaya iletir.',
      systemAction: 'Geri Gönderildi (Kırmızı) ➔ Düzenle ➔ Onay Bekliyor (Turuncu).'
    },
    {
      id: 'rule-sunday',
      code: 'PAZAR KURALI',
      title: 'Pazar Günleri (Haftalık Dinlenme Tatili)',
      category: 'weekend',
      badge: 'Sayılmaz & Gösterilmez',
      badgeColor: 'teal',
      description: 'Şirket çalışma prensibi gereği Pazar günleri haftalık tatildir. İzin planlama matrisinde Pazar kolonları gösterilmez ve hiçbir iznin süresine ya da bakiyesine dahil edilmez.',
      example: 'Örnek: Cuma günü başlayıp Pazartesi biten bir izin yalnızca Cuma, Cumartesi ve Pazartesi olmak üzere 3 iş günü olarak kaydedilir.',
      systemAction: 'Pazar kolonları gizlenir ve bakiye hesabı dışında tutulur.'
    }
  ];

  const filteredRules = rulesData.filter(rule => {
    const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
    const matchesSearch = rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rule.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="rule-modal-backdrop" onClick={onClose}>
      <div className="rule-directory-card animate-scale" onClick={(e) => e.stopPropagation()}>
        
        {/* Üst Başlık */}
        <div className="directory-header">
          <div className="directory-title-wrap">
            <div className="directory-icon-box">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="directory-eyebrow">Şirket Planlama Motoru</div>
              <h2 className="directory-heading">İş Kuralları & Planlama Standartları</h2>
              <p className="directory-subheading">
                İzin planlama sürecinde otomatik olarak denetlenen ve uygulanan 8 kural seti
              </p>
            </div>
          </div>
          <button className="rule-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Filtre ve Arama Barı */}
        <div className="directory-toolbar">
          <div className="directory-search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Kural adı, kod veya içerik ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="directory-search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="directory-tabs">
            <button 
              className={`dir-tab-btn ${filterCategory === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              Tümü ({rulesData.length})
            </button>
            <button 
              className={`dir-tab-btn ${filterCategory === 'weekend' ? 'active' : ''}`}
              onClick={() => setFilterCategory('weekend')}
            >
              Hafta Sonu & Pazar
            </button>
            <button 
              className={`dir-tab-btn ${filterCategory === 'limits' ? 'active' : ''}`}
              onClick={() => setFilterCategory('limits')}
            >
              Limitler & Aralıklar
            </button>
            <button 
              className={`dir-tab-btn ${filterCategory === 'workflow' ? 'active' : ''}`}
              onClick={() => setFilterCategory('workflow')}
            >
              Onay & Süreç
            </button>
          </div>
        </div>

        {/* Kural Kartları Listesi */}
        <div className="directory-cards-container">
          {filteredRules.length === 0 ? (
            <div className="directory-empty-state">
              <Info size={32} />
              <p>Arama kriterinize uygun iş kuralı bulunamadı.</p>
            </div>
          ) : (
            filteredRules.map((rule) => (
              <div key={rule.id} className="rule-detail-card">
                <div className="card-top-row">
                  <div className="rule-code-badge">{rule.code}</div>
                  <span className={`rule-category-pill pill-${rule.badgeColor}`}>
                    {rule.badge}
                  </span>
                </div>
                
                <h4 className="card-rule-title">{rule.title}</h4>
                <p className="card-rule-desc">{rule.description}</p>
                
                <div className="card-example-box">
                  <div className="example-label">💡 Senaryo Örneği:</div>
                  <div className="example-text">{rule.example}</div>
                </div>

                <div className="card-system-footer">
                  <div className="system-indicator">
                    <CheckCircle size={14} className="text-emerald" />
                    <span><strong>Sistem Davranışı:</strong> {rule.systemAction}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alt Bilgi ve Kapatma */}
        <div className="directory-footer">
          <div className="footer-info-text">
            <ShieldCheck size={16} className="text-primary-blue" />
            <span>Tüm kurallar takvimde izin oluşturulurken ve sürükle-bırak yapılırken anlık olarak işletilir.</span>
          </div>
          <button className="btn-close-directory" onClick={onClose} type="button">
            Anladım, Kapat
          </button>
        </div>

      </div>
    </div>
  );
};

/**
 * 3. ÖZEL ONAY MODALI (CustomConfirmModal)
 * Otomatik planlama ve Onaya Gönder gibi kritik işlemler için
 * Chrome'un standart window.confirm() ekranı yerine modern şık pop-up.
 */
export const CustomConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  icon = 'sparkles',
  details = [],
  confirmText = 'Evet, Devam Et',
  cancelText = 'Vazgeç',
  confirmStyle = 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="rule-modal-backdrop" onClick={onClose}>
      <div className="rule-modal-card confirm-modal-card animate-scale" onClick={(e) => e.stopPropagation()}>
        
        <div className="confirm-modal-header">
          <div className="confirm-icon-wrap">
            {icon === 'sparkles' && <Sparkles size={24} className="text-primary-blue" />}
            {icon === 'send' && <Layers size={24} className="text-indigo" />}
            {icon === 'alert' && <AlertTriangle size={24} className="text-amber" />}
          </div>
          <div>
            <h3 className="confirm-modal-title">{title}</h3>
            <p className="confirm-modal-subtitle">{subtitle}</p>
          </div>
          <button className="rule-close-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        {details && details.length > 0 && (
          <div className="confirm-modal-body">
            <div className="confirm-details-box">
              <div className="details-box-header">Uygulanacak Kurallar ve Adımlar:</div>
              <ul className="details-list">
                {details.map((item, idx) => (
                  <li key={idx} className="details-item">
                    <CheckCircle size={14} className="check-bullet" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="confirm-modal-footer">
          <button className="btn-confirm-cancel" onClick={onClose} type="button">
            {cancelText}
          </button>
          <button 
            className={`btn-confirm-submit ${confirmStyle === 'primary' ? 'btn-blue' : 'btn-dark'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            type="button"
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};
