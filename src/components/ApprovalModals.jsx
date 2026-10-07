import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, AlertCircle, MessageSquare, 
  X, Check, Send, User, Calendar, ShieldCheck, ArrowRight, RotateCcw
} from 'lucide-react';
import { differenceInCalendarDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { calculateLeaveDays } from '../data/mockData';
import './ApprovalModals.css';

/**
 * Onay Akışı Görselleştirme Bileşeni (Workflow Timeline)
 * İzin veya Mesai detaylarında sürecin hangi aşamalardan geçtiğini ve
 * kimin ne zaman hangi notla onaylayıp/geri gönderdiğini gösterir.
 */
export const WorkflowTimeline = ({ workflow = [], rejectionReason, approvalNote, currentStatus }) => {
  // Varsayılan akış adımları yoksa temel 2 adımlı yapı üret
  const steps = workflow && workflow.length > 0 ? workflow : [
    {
      step: 1,
      title: 'Talep Oluşturuldu',
      user: 'Sistem Kullanıcısı',
      date: '01.07.2026 09:00',
      status: 'Onaylandı',
      note: 'Talep sisteme girildi.'
    },
    {
      step: 2,
      title: currentStatus === 'Onaylandı' ? 'Yönetici Onayladı' : currentStatus === 'Geri Gönderildi' ? 'Geri Gönderildi' : 'Yönetici Değerlendirmesi',
      user: 'Hasan Cavit Koçak (Yönetici)',
      date: currentStatus === 'Bekliyor' ? 'Bekleniyor...' : '02.07.2026 10:30',
      status: currentStatus || 'Bekliyor',
      note: rejectionReason || approvalNote || (currentStatus === 'Bekliyor' ? 'Yönetici inceleme aşamasında.' : '')
    }
  ];

  return (
    <div className="workflow-timeline-wrapper">
      <div className="workflow-timeline-header">
        <div className="workflow-header-title">
          <ShieldCheck size={16} className="text-primary-blue" />
          <span>Onay Süreç Akışı & Geçmişi</span>
        </div>
        <span className="workflow-count-badge">{steps.length} Adım</span>
      </div>

      {/* Geri Gönderildi Uyarısı / Gerekçe Kutusu */}
      {rejectionReason && (
        <div className="workflow-rejection-callout">
          <div className="callout-icon-wrap red">
            <XCircle size={18} />
          </div>
          <div className="callout-body">
            <div className="callout-title">Geri Gönderme / Red Gerekçesi</div>
            <div className="callout-text">{rejectionReason}</div>
          </div>
        </div>
      )}

      {/* Onay Notu Kutusu */}
      {approvalNote && (
        <div className="workflow-approval-callout">
          <div className="callout-icon-wrap green">
            <CheckCircle size={18} />
          </div>
          <div className="callout-body">
            <div className="callout-title">Yönetici Onay Notu</div>
            <div className="callout-text">{approvalNote}</div>
          </div>
        </div>
      )}

      {/* Dikey Adım Çizgisi (Stepper) */}
      <div className="workflow-steps-list">
        {steps.map((item, idx) => {
          const isDone = item.status === 'Onaylandı' || item.status === 'Tamamlandı';
          const isRejected = item.status === 'Geri Gönderildi' || item.status === 'Reddedildi';
          const isPending = item.status === 'Bekliyor' || item.status === 'Onay Bekliyor';

          return (
            <div key={idx} className={`workflow-step-item ${isDone ? 'done' : isRejected ? 'rejected' : 'pending'}`}>
              <div className="step-marker-col">
                <div className={`step-circle-icon ${isDone ? 'circle-green' : isRejected ? 'circle-red' : 'circle-amber'}`}>
                  {isDone ? <Check size={12} strokeWidth={3} /> :
                   isRejected ? <X size={12} strokeWidth={3} /> :
                   <Clock size={12} strokeWidth={2.5} />}
                </div>
                {idx < steps.length - 1 && <div className="step-connecting-line" />}
              </div>

              <div className="step-content-card">
                <div className="step-header-row">
                  <div className="step-main-info">
                    <span className="step-number-tag">Adım {item.step || idx + 1}</span>
                    <strong className="step-title-text">{item.title}</strong>
                  </div>
                  <span className={`step-status-chip ${isDone ? 'chip-green' : isRejected ? 'chip-red' : 'chip-amber'}`}>
                    {item.status}
                  </span>
                </div>

                <div className="step-meta-row">
                  <div className="meta-user">
                    <User size={13} />
                    <span>{item.user}</span>
                  </div>
                  {item.date && (
                    <div className="meta-date">
                      <Calendar size={13} />
                      <span>{item.date}</span>
                    </div>
                  )}
                </div>

                {item.note && (
                  <div className={`step-note-bubble ${isRejected ? 'note-red' : isDone ? 'note-green' : 'note-neutral'}`}>
                    <MessageSquare size={13} className="note-icon" />
                    <span className="note-text">{item.note}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Onaylama Onay Pop-up'ı (Approve Confirm Modal)
 * Kullanıcı "Onayla" dediğinde emin misin onayı ve isteğe bağlı onay notu alanı açar.
 */
export const ApprovalConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "İzin Talebini Onayla",
  subtitle = "Talebi onaylamak ve ilgili departman takvimine işlemek üzeresiniz.",
  summaryItems = [],
  confirmButtonText = "Onayla ve Kaydet"
}) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const quickNotes = [
    "Uygundur, iyi tatiller dilerim.",
    "Departman iş planına uygundur.",
    "Formen ve vardiya planı onaylanmıştır."
  ];

  const handleConfirm = () => {
    onConfirm(note);
    setNote('');
  };

  return (
    <div className="approval-modal-backdrop" onClick={onClose}>
      <div className="approval-modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="approval-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-bubble green">
              <CheckCircle size={22} />
            </div>
            <div>
              <h3 className="modal-heading">{title}</h3>
              <p className="modal-subheading">{subtitle}</p>
            </div>
          </div>
          <button className="modal-btn-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="approval-modal-body">
          {/* Özet Bilgi Kartı */}
          {summaryItems.length > 0 && (
            <div className="modal-summary-grid">
              {summaryItems.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <span className="summary-label">{item.label}</span>
                  <strong className="summary-value">{item.value}</strong>
                </div>
              ))}
            </div>
          )}

          {/* İsteğe Bağlı Onay Notu */}
          <div className="modal-form-group">
            <label className="modal-form-label">
              <span>Onay Notu (İsteğe Bağlı):</span>
              <span className="optional-tag">Opsiyonel</span>
            </label>
            <textarea
              className="modal-textarea"
              rows={3}
              placeholder="Çalışana veya formene iletilmek üzere onay notu yazabilirsiniz..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {/* Hızlı Seçim Butonları */}
            <div className="quick-chips-wrap">
              <span className="quick-chips-lbl">Hızlı Not:</span>
              {quickNotes.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => setNote(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="approval-modal-footer">
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Vazgeç
          </button>
          <button type="button" className="btn-modal-confirm-green" onClick={handleConfirm}>
            <Check size={16} />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Geri Gönder / Reddet Pop-up'ı (Rejection Modal)
 * Fazla mesaide 'Reddet' veya izin talebinde 'Geri Gönder' dendiğinde
 * zorunlu açıklama/gerekçe alanı ve hızlı chip şablonları sunar.
 */
export const RejectionReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "İzin Talebini Geri Gönder",
  subtitle = "Talep sahibine revize edilmek üzere gerekçeli bildirim iletilecektir.",
  summaryItems = [],
  confirmButtonText = "Geri Gönder ve Bildir",
  isOvertime = false
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const quickLeaveReasons = [
    "Aynı tarihte bakım revizyonu planı mevcut, lütfen haftayı kaydırınız.",
    "Vardiyada kritik personel eksikliği nedeniyle uygun görülmemiştir.",
    "Talep edilen gün sayısı yıllık izin bakiyesini aşmaktadır.",
    "Hafta sonu iş kuralı (Cuma/Pzt blok) gereği tarihleri güncelleyiniz."
  ];

  const quickOvertimeReasons = [
    "PDKS kart basım saatleri ile talep tutarsızdır.",
    "Yetkili formen ön onayı ve çalışma gerekçesi eksik.",
    "Aylık yasal maksimum fazla mesai sınırı (22.5 saat) aşılmıştır.",
    "Onaysız plan dışı fazla mesai çalışması tespit edildi.",
    "Yemek ve mola süresi düşümü hatalı hesaplanmıştır."
  ];

  const quickList = isOvertime ? quickOvertimeReasons : quickLeaveReasons;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(true);
      return;
    }
    setError(false);
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="approval-modal-backdrop" onClick={onClose}>
      <div className="approval-modal-card rejection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="approval-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-bubble red">
              <XCircle size={22} />
            </div>
            <div>
              <h3 className="modal-heading">{title}</h3>
              <p className="modal-subheading">{subtitle}</p>
            </div>
          </div>
          <button className="modal-btn-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="approval-modal-body">
          {/* Özet Bilgi Kartı */}
          {summaryItems.length > 0 && (
            <div className="modal-summary-grid">
              {summaryItems.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <span className="summary-label">{item.label}</span>
                  <strong className="summary-value">{item.value}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Red/Geri Gönderme Gerekçesi Formu */}
          <div className="modal-form-group">
            <label className="modal-form-label">
              <span>{isOvertime ? 'Red Gerekçesi / Açıklama' : 'Geri Gönderme / Revize Gerekçesi'}:</span>
              <span className="required-tag">* Zorunlu</span>
            </label>
            <textarea
              className={`modal-textarea ${error ? 'border-error' : ''}`}
              rows={4}
              placeholder={
                isOvertime
                  ? "Lütfen personelin fazla mesaisinin neden reddedildiğini açıklayınız..."
                  : "Lütfen çalışanın izninin neden geri gönderildiğini ve ne yapması gerektiğini açıklayınız..."
              }
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(false);
              }}
            />

            {error && (
              <div className="modal-input-error">
                <AlertCircle size={14} />
                <span>Lütfen bir gerekçe veya açıklama metni giriniz.</span>
              </div>
            )}

            {/* Hızlı Gerekçe Şablonları */}
            <div className="quick-chips-wrap">
              <span className="quick-chips-lbl">Sık Kullanılan Gerekçeler:</span>
              <div className="chips-flex-row">
                {quickList.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-chip-btn red-hover"
                    onClick={() => {
                      setReason(chip);
                      if (error) setError(false);
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="approval-modal-footer">
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Vazgeç
          </button>
          <button type="button" className="btn-modal-confirm-red" onClick={handleConfirm}>
            <Send size={15} />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Revize Et ve Tekrar Onaya Sun Pop-up'ı (Resubmit Modal)
 * Geri gönderilen bir izin için tarihleri güncelleyerek ve açıklama yazarak
 * tekrar yönetici onayına göndermeyi sağlar.
 */
export const ResubmitModal = ({
  isOpen,
  onClose,
  onConfirm,
  request
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (request) {
      setStartDate(request.startDate || '');
      setEndDate(request.endDate || '');
      setNote('');
      setError('');
    }
  }, [request, isOpen]);

  if (!isOpen || !request) return null;

  // Hesaplanan gün sayısı (Pazar günleri hariç)
  const calculatedDays = startDate && endDate 
    ? calculateLeaveDays(startDate, endDate)
    : request.duration || 1;

  const quickRevisionNotes = [
    "Tarihler yönetici gerekçesine uygun olarak 1 hafta sonraya kaydırıldı.",
    "Bakım duruşu çakışması giderilerek tarihler güncellendi.",
    "Vardiya personeli ile takvim koordine edildi.",
    "İzin süresi revize edilerek onaya tekrar sunuldu."
  ];

  const handleSave = () => {
    if (!startDate || !endDate) {
      setError('Lütfen başlangıç ve bitiş tarihlerini belirleyiniz.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('Bitiş tarihi, başlangıç tarihinden önce olamaz.');
      return;
    }
    setError('');
    onConfirm({
      startDate,
      endDate,
      duration: calculatedDays,
      revisionNote: note || 'Tarihler revize edilerek tekrar onaya sunuldu.'
    });
  };

  return (
    <div className="approval-modal-backdrop" onClick={onClose}>
      <div className="approval-modal-card resubmit-modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="approval-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-bubble amber" style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>
              <RotateCcw size={22} />
            </div>
            <div>
              <h3 className="modal-heading">İzni Revize Et & Tekrar Onaya Sun</h3>
              <p className="modal-subheading">Gerekçeyi inceleyip tarihleri güncelleyerek tekrar yönetici onayına gönderin.</p>
            </div>
          </div>
          <button className="modal-btn-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="approval-modal-body">
          {/* Çalışan Özet Kartı */}
          <div className="modal-summary-grid">
            <div className="summary-item">
              <span className="summary-label">Çalışan</span>
              <strong className="summary-value">{request.employeeName}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Departman</span>
              <strong className="summary-value">{request.department}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Önceki Tarihler</span>
              <span className="summary-value" style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12.5px' }}>
                {format(new Date(request.startDate), 'dd.MM.yyyy')} - {format(new Date(request.endDate), 'dd.MM.yyyy')} ({request.duration} Gün)
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Yeni Süre</span>
              <strong className="summary-value" style={{ color: '#d97706' }}>
                {calculatedDays} Gün (Pazar hariç)
              </strong>
            </div>
          </div>

          {/* Yöneticinin Geri Gönderme Gerekçesi Kutusu */}
          {request.rejectionReason && (
            <div className="resubmit-rejection-warning" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: '12px', color: '#991b1b', display: 'block', marginBottom: 2 }}>Yöneticinin Geri Gönderme Gerekçesi:</strong>
                <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: 1.4 }}>{request.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Yeni Tarih Giriş Alanları */}
          <div className="modal-form-group">
            <label className="modal-form-label">
              <span>Yeni Tarih Aralığı:</span>
              <span className="required-tag">* Zorunlu</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>Başlangıç:</span>
                <input 
                  type="date"
                  className="modal-date-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '13px', color: '#0f172a' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>Bitiş:</span>
                <input 
                  type="date"
                  className="modal-date-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '13px', color: '#0f172a' }}
                />
              </div>
            </div>

            {error && (
              <div className="modal-input-error" style={{ marginTop: 4 }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Revize Açıklama Notu */}
          <div className="modal-form-group">
            <label className="modal-form-label">
              <span>Revize Notu / Açıklama:</span>
              <span className="optional-tag">Yöneticiye iletilecek</span>
            </label>
            <textarea
              className="modal-textarea"
              rows={2}
              placeholder="Yöneticiye yapılan değişiklik hakkında bilgi verin..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="quick-chips-wrap">
              <span className="quick-chips-lbl">Hızlı Açıklama:</span>
              <div className="chips-flex-row">
                {quickRevisionNotes.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-chip-btn"
                    onClick={() => setNote(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="approval-modal-footer">
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Vazgeç
          </button>
          <button 
            type="button" 
            className="btn-modal-confirm-green"
            style={{ background: '#d97706', borderColor: '#b45309' }}
            onClick={handleSave}
          >
            <Send size={15} />
            <span>Güncelle ve Tekrar Onaya Sun</span>
          </button>
        </div>
      </div>
    </div>
  );
};
