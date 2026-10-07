import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, CheckCircle, XCircle, Clock, AlertCircle, 
  Search, Filter, Send, Edit, Trash2, Calendar, User, 
  ShieldCheck, Wrench, Briefcase, ChevronRight, Check, Eye, X, RotateCcw
} from 'lucide-react';
import { 
  getEmployees, getLeaveRequests, updateLeaveRequest, 
  deleteLeaveRequest, leaveStatuses, COLLAR_TYPES, departments 
} from '../data/mockData';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  WorkflowTimeline, ApprovalConfirmModal, RejectionReasonModal, ResubmitModal 
} from '../components/ApprovalModals';
import './Approvals.css';

const Approvals = ({ currentUser, onSwitchUser }) => {
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Pop-up modal durumları
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState(null);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [requestToReject, setRequestToReject] = useState(null);
  const [requestToResubmit, setRequestToResubmit] = useState(null);
  const [isBatchApproveOpen, setIsBatchApproveOpen] = useState(false);

  const employees = getEmployees();
  const allRequests = getLeaveRequests();

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Rol bazlı talepleri filtrele
  const visibleRequests = useMemo(() => {
    let list = allRequests;

    if (currentUser?.isForeman) {
      const teamEmpIds = employees
        .filter(e => e.foremanId === currentUser.id || e.id === currentUser.id)
        .map(e => e.id);
      list = list.filter(r => teamEmpIds.includes(r.employeeId));
    } else if (currentUser?.collarType === COLLAR_TYPES.BLUE_COLLAR || currentUser?.collarType === COLLAR_TYPES.WHITE_COLLAR) {
      if (!currentUser.isManager) {
        list = list.filter(r => r.employeeId === currentUser.id);
      }
    }

    if (selectedStatus !== 'ALL') {
      list = list.filter(r => r.status === selectedStatus);
    }

    if (selectedDept) {
      list = list.filter(r => r.department === selectedDept);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.employeeName?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }, [allRequests, currentUser, selectedStatus, selectedDept, searchQuery, refreshKey, employees]);

  // İstatistik Sayaçları
  const stats = useMemo(() => {
    let baseList = allRequests;
    if (currentUser?.isForeman) {
      const teamEmpIds = employees
        .filter(e => e.foremanId === currentUser.id || e.id === currentUser.id)
        .map(e => e.id);
      baseList = baseList.filter(r => teamEmpIds.includes(r.employeeId));
    } else if (!currentUser?.isManager) {
      baseList = baseList.filter(r => r.employeeId === currentUser?.id);
    }

    const pending = baseList.filter(r => r.status === leaveStatuses.PENDING);
    const approved = baseList.filter(r => r.status === leaveStatuses.APPROVED);
    const rejected = baseList.filter(r => r.status === leaveStatuses.REJECTED);

    return {
      pendingCount: pending.length,
      pendingDays: pending.reduce((s, r) => s + (r.duration || 0), 0),
      approvedCount: approved.length,
      approvedDays: approved.reduce((s, r) => s + (r.duration || 0), 0),
      rejectedCount: rejected.length,
      rejectedDays: rejected.reduce((s, r) => s + (r.duration || 0), 0)
    };
  }, [allRequests, currentUser, refreshKey, employees]);

  // Yönetici Onayını Onayla Modalından Tamamlama
  const handleConfirmApprove = (note) => {
    if (!requestToApprove) return;
    const currentWorkflow = requestToApprove.approvalWorkflow ? [...requestToApprove.approvalWorkflow] : [];
    
    currentWorkflow.push({
      step: currentWorkflow.length + 1,
      title: 'Yönetici Onayladı',
      user: `${currentUser?.name || 'Hasan Cavit Koçak'} (${currentUser?.title || (currentUser?.isManager ? 'Yönetici' : 'Yetkili')})`,
      date: format(new Date(), 'dd.MM.yyyy HH:mm'),
      status: 'Onaylandı',
      note: note || 'İzin talebi yönetici tarafından onaylanmıştır.'
    });

    const updated = updateLeaveRequest(requestToApprove.id, {
      status: leaveStatuses.APPROVED,
      approvalNote: note || '',
      approvalWorkflow: currentWorkflow
    });

    if (selectedRequestForDetail?.id === requestToApprove.id) {
      setSelectedRequestForDetail(updated);
    }

    setRequestToApprove(null);
    setRefreshKey(k => k + 1);
    showToast(`${requestToApprove.employeeName} için izin başarıyla onaylandı!`);
  };

  // Yönetici Geri Gönderme / Reddetmeyi Modalından Tamamlama
  const handleConfirmReject = (reason) => {
    if (!requestToReject) return;
    const currentWorkflow = requestToReject.approvalWorkflow ? [...requestToReject.approvalWorkflow] : [];

    currentWorkflow.push({
      step: currentWorkflow.length + 1,
      title: 'Geri Gönderildi',
      user: `${currentUser?.name || 'Hasan Cavit Koçak'} (${currentUser?.title || (currentUser?.isManager ? 'Yönetici' : 'Yetkili')})`,
      date: format(new Date(), 'dd.MM.yyyy HH:mm'),
      status: 'Geri Gönderildi',
      note: reason
    });

    const updated = updateLeaveRequest(requestToReject.id, {
      status: leaveStatuses.REJECTED,
      rejectionReason: reason,
      approvalWorkflow: currentWorkflow
    });

    if (selectedRequestForDetail?.id === requestToReject.id) {
      setSelectedRequestForDetail(updated);
    }

    setRequestToReject(null);
    setRefreshKey(k => k + 1);
    showToast(`${requestToReject.employeeName} için izin revize edilmek üzere geri gönderildi.`, 'warning');
  };

  // Toplu Onaylama Modalından Tamamlama
  const handleConfirmBatchApprove = (note) => {
    const pendingList = visibleRequests.filter(r => r.status === leaveStatuses.PENDING);
    if (pendingList.length === 0) return;

    pendingList.forEach(r => {
      const currentWorkflow = r.approvalWorkflow ? [...r.approvalWorkflow] : [];
      currentWorkflow.push({
        step: currentWorkflow.length + 1,
        title: 'Toplu Yönetici Onayı',
        user: `${currentUser?.name || 'Hasan Cavit Koçak'} (Yönetici)`,
        date: format(new Date(), 'dd.MM.yyyy HH:mm'),
        status: 'Onaylandı',
        note: note || 'Toplu onaylama işlemi ile onaylandı.'
      });
      updateLeaveRequest(r.id, { 
        status: leaveStatuses.APPROVED,
        approvalNote: note || '',
        approvalWorkflow: currentWorkflow
      });
    });

    setIsBatchApproveOpen(false);
    setRefreshKey(k => k + 1);
    showToast(`${pendingList.length} adet izin talebi başarıyla onaylandı!`);
  };

  // Formen / Çalışan: Geri gönderilen talebi revize ederek tekrar onaya sun
  const handleConfirmResubmit = ({ startDate, endDate, duration, revisionNote }) => {
    if (!requestToResubmit) return;
    const currentWorkflow = requestToResubmit.approvalWorkflow ? [...requestToResubmit.approvalWorkflow] : [];
    
    currentWorkflow.push({
      step: currentWorkflow.length + 1,
      title: 'Revize Edilerek Tekrar Onaya Sunuldu',
      user: `${currentUser?.name || 'Ali Vural'} (${currentUser?.title || (currentUser?.isForeman ? 'Formen' : 'Çalışan')})`,
      date: format(new Date(), 'dd.MM.yyyy HH:mm'),
      status: 'Bekliyor',
      note: `Yeni Tarihler: ${format(new Date(startDate), 'dd MMM', { locale: tr })} - ${format(new Date(endDate), 'dd MMM yyyy', { locale: tr })} (${duration} Gün). ${revisionNote ? 'Revize Notu: ' + revisionNote : ''}`
    });

    const updated = updateLeaveRequest(requestToResubmit.id, { 
      startDate,
      endDate,
      duration,
      status: leaveStatuses.PENDING,
      approvalWorkflow: currentWorkflow
    });

    if (selectedRequestForDetail?.id === requestToResubmit.id) {
      setSelectedRequestForDetail(updated);
    }

    setRequestToResubmit(null);
    setRefreshKey(k => k + 1);
    showToast(`${requestToResubmit.employeeName} için izin tarihleri güncellendi ve tekrar yönetici onayına sunuldu!`);
  };

  return (
    <div className="approvals-page-wrapper">
      
      {/* Toast Bildirimi */}
      {toastMessage && (
        <div className={`approvals-toast toast-${toastMessage.type}`}>
          {toastMessage.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* 1. SAYFA BAŞLIĞI VE ÖZET KARTLAR */}
      <div className="approvals-header-section">
        <div className="approvals-title-group">
          <div className="title-with-badge">
            <h1 className="approvals-page-title">İzin Onay Yönetimi</h1>
            <span className="role-indicator-badge">
              {currentUser?.isManager ? 'Yönetici Onay Yetkilisi' :
               currentUser?.isForeman ? 'Formen Ekip Onay Takibi' : 'Bireysel Onay Takibi'}
            </span>
          </div>
          <p className="approvals-page-subtitle">
            {currentUser?.isManager 
              ? 'Tüm departmanlardan gelen izin taleplerini inceleyin, onaylayın veya revize için geri gönderin.'
              : currentUser?.isForeman
              ? 'Mavi yakalı ekibinizin izin taleplerinin onay durumunu takip edin ve geri gönderilenleri güncelleyin.'
              : 'İzin taleplerinizin güncel onay süreçlerini takip edin.'}
          </p>
        </div>

        {currentUser?.isManager && stats.pendingCount > 0 && (
          <button className="btn-apple-primary" onClick={() => setIsBatchApproveOpen(true)}>
            <Check size={16} />
            <span>Bekleyen Tümünü Onayla ({stats.pendingCount})</span>
          </button>
        )}
      </div>

      {/* 2. ÖZET İSTATİSTİK SAYAÇLARI */}
      <div className="approvals-metrics-grid">
        <div 
          className={`metric-card card-amber ${selectedStatus === leaveStatuses.PENDING ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === leaveStatuses.PENDING ? 'ALL' : leaveStatuses.PENDING)}
        >
          <div className="metric-header">
            <span className="metric-title">Onay Bekleyenler</span>
            <div className="metric-icon-box amber"><Clock size={18} /></div>
          </div>
          <div className="metric-numbers">
            <strong className="metric-count">{stats.pendingCount}</strong>
            <span className="metric-days">Toplam {stats.pendingDays} Gün</span>
          </div>
        </div>

        <div 
          className={`metric-card card-green ${selectedStatus === leaveStatuses.APPROVED ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === leaveStatuses.APPROVED ? 'ALL' : leaveStatuses.APPROVED)}
        >
          <div className="metric-header">
            <span className="metric-title">Onaylanan İzinler</span>
            <div className="metric-icon-box green"><CheckCircle size={18} /></div>
          </div>
          <div className="metric-numbers">
            <strong className="metric-count">{stats.approvedCount}</strong>
            <span className="metric-days">Toplam {stats.approvedDays} Gün</span>
          </div>
        </div>

        <div 
          className={`metric-card card-red ${selectedStatus === leaveStatuses.REJECTED ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === leaveStatuses.REJECTED ? 'ALL' : leaveStatuses.REJECTED)}
        >
          <div className="metric-header">
            <span className="metric-title">Geri Gönderilenler</span>
            <div className="metric-icon-box red"><XCircle size={18} /></div>
          </div>
          <div className="metric-numbers">
            <strong className="metric-count">{stats.rejectedCount}</strong>
            <span className="metric-days">Revize Bekliyor</span>
          </div>
        </div>
      </div>

      {/* 3. FİLTRELER BARI */}
      <div className="approvals-filter-bar">
        <div className="filter-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Çalışan adı, departman veya gerekçe ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-input"
          />
        </div>

        <div className="filter-controls-group">
          {currentUser?.isManager && (
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="filter-select-box"
            >
              <option value="">Tüm Departmanlar</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select-box"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value={leaveStatuses.PENDING}>Onay Bekleyenler ({stats.pendingCount})</option>
            <option value={leaveStatuses.APPROVED}>Onaylananlar ({stats.approvedCount})</option>
            <option value={leaveStatuses.REJECTED}>Geri Gönderilenler ({stats.rejectedCount})</option>
            <option value={leaveStatuses.PLANNED}>Planlananlar</option>
          </select>
        </div>
      </div>

      {/* 4. ONAY TALEPLERİ LİSTESİ */}
      <div className="approvals-table-card">
        {visibleRequests.length === 0 ? (
          <div className="approvals-empty-state">
            <CheckCircle size={36} color="#10b981" />
            <h3>Kayıt Bulunamadı</h3>
            <p>Seçilen kriterlere uygun izin onayı talebi bulunmuyor.</p>
          </div>
        ) : (
          <table className="approvals-data-table">
            <thead>
              <tr>
                <th>Çalışan</th>
                <th>Departman</th>
                <th>Tarih Aralığı</th>
                <th>Süre</th>
                <th>Tür</th>
                <th>Gerekçe / Açıklama</th>
                <th>Durum</th>
                <th style={{ textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((req) => {
                return (
                  <tr 
                    key={req.id} 
                    className="approval-row"
                    onClick={() => setSelectedRequestForDetail(req)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Çalışan */}
                    <td className="cell-employee">
                      <div className="emp-info-wrap">
                        <div className="emp-avatar-monogram">
                          {req.employeeName?.split(' ').map(n => n[0]).join('') || 'Ç'}
                        </div>
                        <div className="emp-name-column">
                          <strong className="emp-full-name">{req.employeeName}</strong>
                        </div>
                      </div>
                    </td>

                    {/* Departman */}
                    <td className="cell-department">
                      <span>{req.department}</span>
                    </td>

                    {/* Tarihler */}
                    <td className="cell-dates">
                      <div className="dates-display">
                        <span className="date-main">
                          {format(new Date(req.startDate), 'dd MMM yyyy', { locale: tr })} - {format(new Date(req.endDate), 'dd MMM yyyy', { locale: tr })}
                        </span>
                      </div>
                    </td>

                    {/* Süre */}
                    <td className="cell-duration">
                      <strong className="duration-highlight">{req.duration} Gün</strong>
                    </td>

                    {/* Tür */}
                    <td className="cell-type">
                      <span className="leave-type-pill">{req.type}</span>
                    </td>

                    {/* Gerekçe */}
                    <td className="cell-reason">
                      <div className="reason-container">
                        <span className="reason-text" title={req.reason}>
                          {req.reason || 'Yıllık izin talebi'}
                        </span>
                        {req.rejectionReason && (
                          <div className="rejection-hint-badge" title={req.rejectionReason}>
                            <AlertCircle size={11} />
                            <span>Geri gönderme notu var</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Durum Rozeti */}
                    <td className="cell-status">
                      <span className={`approval-status-pill status-${
                        req.status === leaveStatuses.APPROVED ? 'approved' :
                        req.status === leaveStatuses.PENDING ? 'pending' :
                        req.status === leaveStatuses.REJECTED ? 'rejected' : 'planned'
                      }`}>
                        <span className="status-dot"></span>
                        <span>{req.status}</span>
                      </span>
                    </td>

                    {/* İşlemler */}
                    <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons-wrap">
                        {/* Yönetici Onay ve Geri Gönderme Butonları */}
                        {currentUser?.isManager && req.status === leaveStatuses.PENDING && (
                          <>
                            <button 
                              className="btn-action-icon approve" 
                              onClick={() => setRequestToApprove(req)}
                              title="Talebi Onayla (Pop-up açılır)"
                            >
                              <CheckCircle size={15} />
                              <span>Onayla</span>
                            </button>
                            <button 
                              className="btn-action-icon reject" 
                              onClick={() => setRequestToReject(req)}
                              title="Talebi Revize İçin Geri Gönder (Açıklama girilir)"
                            >
                              <XCircle size={15} />
                              <span>Geri Gönder</span>
                            </button>
                          </>
                        )}

                        {/* Geri Gönderilen İzni Tekrar Onaya Sunma */}
                        {req.status === leaveStatuses.REJECTED && (
                          <button 
                            className="btn-action-icon resubmit" 
                            onClick={() => setRequestToResubmit(req)}
                            title="Tarihleri Revize Et ve Tekrar Onaya Gönder"
                          >
                            <RotateCcw size={14} />
                            <span>Revize Et & Sun</span>
                          </button>
                        )}

                        {/* Detay & Süreç İncele Butonu */}
                        <button 
                          className="btn-action-icon detail"
                          onClick={() => setSelectedRequestForDetail(req)}
                          title="Süreç ve Onay Akışı Detayını Gör"
                        >
                          <Eye size={14} />
                          <span>Detay</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 5. İZİN VE ONAY AKIŞI DETAY MODALI */}
      {selectedRequestForDetail && (
        <div className="approval-modal-backdrop" onClick={() => setSelectedRequestForDetail(null)}>
          <div className="approval-modal-card detail-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="approval-modal-header">
              <div className="modal-title-wrap">
                <div className="emp-avatar-monogram" style={{ width: 44, height: 44, fontSize: 16 }}>
                  {selectedRequestForDetail.employeeName?.split(' ').map(n => n[0]).join('') || 'Ç'}
                </div>
                <div>
                  <h3 className="modal-heading">{selectedRequestForDetail.employeeName}</h3>
                  <p className="modal-subheading">{selectedRequestForDetail.department} • İzin Talep Detayı</p>
                </div>
              </div>
              <button className="modal-btn-close" onClick={() => setSelectedRequestForDetail(null)} type="button">
                <X size={18} />
              </button>
            </div>

            <div className="approval-modal-body">
              {/* Temel Bilgiler Grid */}
              <div className="modal-summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Başlangıç Tarihi</span>
                  <strong className="summary-value">
                    {format(new Date(selectedRequestForDetail.startDate), 'dd MMMM yyyy', { locale: tr })}
                  </strong>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Bitiş Tarihi</span>
                  <strong className="summary-value">
                    {format(new Date(selectedRequestForDetail.endDate), 'dd MMMM yyyy', { locale: tr })}
                  </strong>
                </div>
                <div className="summary-item">
                  <span className="summary-label">İzin Süresi</span>
                  <strong className="summary-value" style={{ color: '#2563eb' }}>
                    {selectedRequestForDetail.duration} Gün
                  </strong>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Durum</span>
                  <strong className="summary-value">
                    {selectedRequestForDetail.status}
                  </strong>
                </div>
              </div>

              {selectedRequestForDetail.reason && (
                <div className="detail-user-reason-box" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Çalışan İzin Nedeni:</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13.5, color: '#1e293b' }}>{selectedRequestForDetail.reason}</p>
                </div>
              )}

              {/* GÖRSEL ONAY AKIŞI TIMELINE'I */}
              <WorkflowTimeline 
                workflow={selectedRequestForDetail.approvalWorkflow}
                rejectionReason={selectedRequestForDetail.rejectionReason}
                approvalNote={selectedRequestForDetail.approvalNote}
                currentStatus={selectedRequestForDetail.status}
              />
            </div>

            <div className="approval-modal-footer">
              {currentUser?.isManager && selectedRequestForDetail.status === leaveStatuses.PENDING && (
                <>
                  <button 
                    type="button" 
                    className="btn-modal-confirm-red"
                    onClick={() => {
                      setRequestToReject(selectedRequestForDetail);
                    }}
                  >
                    <XCircle size={15} />
                    <span>Geri Gönder</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-modal-confirm-green"
                    onClick={() => {
                      setRequestToApprove(selectedRequestForDetail);
                    }}
                  >
                    <CheckCircle size={15} />
                    <span>Onayla</span>
                  </button>
                </>
              )}

              {selectedRequestForDetail.status === leaveStatuses.REJECTED && (
                <button 
                  type="button" 
                  className="btn-modal-confirm-green"
                  style={{ background: '#d97706', borderColor: '#b45309' }}
                  onClick={() => setRequestToResubmit(selectedRequestForDetail)}
                >
                  <RotateCcw size={15} />
                  <span>Tarihleri Revize Et & Tekrar Onaya Sun</span>
                </button>
              )}

              <button type="button" className="btn-modal-cancel" onClick={() => setSelectedRequestForDetail(null)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ONAYLAMA POP-UP'I (ApprovalConfirmModal) */}
      <ApprovalConfirmModal
        isOpen={Boolean(requestToApprove)}
        onClose={() => setRequestToApprove(null)}
        onConfirm={handleConfirmApprove}
        title="İzin Talebini Onayla"
        subtitle="İzin talebini onaylamak ve yıllık izin takvimine işlemek üzeresiniz."
        summaryItems={requestToApprove ? [
          { label: 'Çalışan', value: requestToApprove.employeeName },
          { label: 'Departman', value: requestToApprove.department },
          { 
            label: 'Tarih Aralığı', 
            value: `${format(new Date(requestToApprove.startDate), 'dd MMM', { locale: tr })} - ${format(new Date(requestToApprove.endDate), 'dd MMM yyyy', { locale: tr })}` 
          },
          { label: 'İzin Süresi', value: `${requestToApprove.duration} Gün` }
        ] : []}
        confirmButtonText="Onayla ve Kaydet"
      />

      {/* 7. GERİ GÖNDERME / REDDETME POP-UP'I (RejectionReasonModal) */}
      <RejectionReasonModal
        isOpen={Boolean(requestToReject)}
        onClose={() => setRequestToReject(null)}
        onConfirm={handleConfirmReject}
        title="İzin Talebini Geri Gönder"
        subtitle="Çalışana ve formenine revize gerekçesi iletilecektir. Lütfen nedeni yazınız."
        summaryItems={requestToReject ? [
          { label: 'Çalışan', value: requestToReject.employeeName },
          { label: 'Departman', value: requestToReject.department },
          { 
            label: 'Tarih Aralığı', 
            value: `${format(new Date(requestToReject.startDate), 'dd MMM', { locale: tr })} - ${format(new Date(requestToReject.endDate), 'dd MMM yyyy', { locale: tr })}` 
          },
          { label: 'Talep Edilen Süre', value: `${requestToReject.duration} Gün` }
        ] : []}
        confirmButtonText="Geri Gönder ve Bildir"
        isOvertime={false}
      />

      {/* 8. TOPLU ONAYLAMA POP-UP'I */}
      <ApprovalConfirmModal
        isOpen={isBatchApproveOpen}
        onClose={() => setIsBatchApproveOpen(false)}
        onConfirm={handleConfirmBatchApprove}
        title="Bekleyen Tüm İzinleri Onayla"
        subtitle="Onay bekleyen tüm izin taleplerini tek seferde onaylamak üzeresiniz."
        summaryItems={[
          { label: 'Toplam Talep', value: `${stats.pendingCount} Adet İzin` },
          { label: 'Toplam İzin Günü', value: `${stats.pendingDays} Gün` }
        ]}
        confirmButtonText="Tümünü Onayla ve Kaydet"
      />

      {/* 9. REVİZE ET VE TEKRAR ONAYA SUN POP-UP'I (ResubmitModal) */}
      <ResubmitModal
        isOpen={Boolean(requestToResubmit)}
        onClose={() => setRequestToResubmit(null)}
        onConfirm={handleConfirmResubmit}
        request={requestToResubmit}
      />

    </div>
  );
};

export default Approvals;
