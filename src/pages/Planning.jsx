import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Filter,
  CheckCircle, XCircle, Edit, Trash2, Sparkles, Clock,
  Users, Save, Send, Maximize2, Minimize2, User,
  CheckSquare, BarChart3, Settings as SettingsIcon, X,
  CalendarCheck, AlertCircle, Info, ChevronDown, RotateCcw,
  Shield, HardHat, Briefcase, UserCheck, ArrowRight
} from 'lucide-react';
import {
  getEmployees, getLeaveRequests, addLeaveRequest, updateLeaveRequest,
  deleteLeaveRequest, leaveStatuses, COLLAR_TYPES, DEMO_USERS,
  validateAndApplyRules
} from '../data/mockData';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, addDays, getDay,
  differenceInCalendarDays
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  WorkflowTimeline, ApprovalConfirmModal, RejectionReasonModal, ResubmitModal 
} from '../components/ApprovalModals';
import './Planning.css';

const Planning = ({ currentUser, activeTab = 'planning', onTabChange, onSwitchUser }) => {
  // Varsayılan ay: Görseldeki gibi Temmuz 2026 (Month index: 6)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isFullView, setIsFullView] = useState(false);
  
  // Modallar ve Seçimler
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRequestDetail, setShowRequestDetail] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [requestToReject, setRequestToReject] = useState(null);
  const [requestToResubmit, setRequestToResubmit] = useState(null);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'warning' | 'error', message: '' }
  const [ruleNotices, setRuleNotices] = useState([]);

  // Sürükle - Bırak (Drag & Drop) durumu
  const [draggedLeave, setDraggedLeave] = useState(null);

  // Tablo yatay kaydırma referansı
  const timelineScrollRef = useRef(null);

  // Form Verisi
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    type: 'Planlı',
    reason: '',
    status: leaveStatuses.PLANNED
  });

  const employees = getEmployees();
  const allRequests = getLeaveRequests();

  // Bildirim göster
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Yıl değiştiğinde tarihi güncelle
  const handleYearChange = (year) => {
    setSelectedYear(year);
    const newDate = new Date(parseInt(year), currentDate.getMonth(), 1);
    setCurrentDate(newDate);
  };

  // Departman listesi
  const departments = useMemo(() => {
    return [...new Set(employees.map(e => e.department))];
  }, [employees]);

  // Yönetilen ve filtrelenen çalışanlar
  const filteredEmployees = useMemo(() => {
    let list = employees;

    // Rol bazlı filtreleme:
    // Eğer Formen ise sadece kendi mavi yakalı ekibini ve kendini görür
    if (currentUser?.isForeman) {
      list = employees.filter(e => e.foremanId === currentUser.id || e.id === currentUser.id);
    } 
    // Eğer Mavi Yaka ise sadece kendini görür
    else if (currentUser?.collarType === COLLAR_TYPES.BLUE_COLLAR) {
      list = employees.filter(e => e.id === currentUser.id);
    }

    if (selectedDepartment) {
      list = list.filter(e => e.department === selectedDepartment);
    }
    return list;
  }, [employees, currentUser, selectedDepartment, refreshKey]);

  // Seçilen ayın günleri (01, 02, 03... 31)
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Ay ve filtreye göre izin talepleri
  const relevantRequests = useMemo(() => {
    return allRequests;
  }, [allRequests, refreshKey]);

  // Üst İstatistikler (Hak Edilen, Devreden, Gelecek, Planlanan, Onay Bekleyen)
  const stats = useMemo(() => {
    const totalEntitled = filteredEmployees.reduce((sum, e) => sum + (e.annualLeave?.currentYearAllocation || 14), 0);
    const totalPrevious = filteredEmployees.reduce((sum, e) => sum + (e.annualLeave?.previousBalance || 0), 0);
    const totalFuture = filteredEmployees.reduce((sum, e) => sum + (e.annualLeave?.futureAllocation || 8), 0);
    
    const plannedDays = relevantRequests
      .filter(r => r.status === leaveStatuses.PLANNED)
      .reduce((sum, r) => sum + (r.duration || 0), 0);

    const pendingDays = relevantRequests
      .filter(r => r.status === leaveStatuses.PENDING)
      .reduce((sum, r) => sum + (r.duration || 0), 0);

    const avgEntitled = filteredEmployees.length ? Math.round(totalEntitled / filteredEmployees.length) : 14;
    const avgPrevious = filteredEmployees.length ? Math.round(totalPrevious / filteredEmployees.length) : 6;
    const avgFuture = filteredEmployees.length ? Math.round(totalFuture / filteredEmployees.length) : 8;

    return {
      entitled: avgEntitled,
      previous: avgPrevious,
      future: avgFuture,
      planned: plannedDays || 12,
      pending: pendingDays || 4
    };
  }, [filteredEmployees, relevantRequests]);

  // Ay gezinme işlemleri
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Takvim sağ-sol kaydırma
  const handleScrollTimeline = (direction) => {
    if (timelineScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      timelineScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Yeni İzin Ekleme Modalını Aç
  const handleAddRequest = (employeeId = null, initialDate = null) => {
    setEditingRequest(null);
    setRuleNotices([]);
    
    // Eğer çalışan belirtilmemişse aktif kullanıcıyı varsayılan yap
    const targetEmpId = employeeId || (currentUser?.id);
    const emp = targetEmpId ? employees.find(e => e.id === targetEmpId) : null;
    const dateStr = initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(2026, 6, 1), 'yyyy-MM-dd');
    
    // Mavi Yaka veya Formen giriyorsa varsayılan durum Onay Bekliyor (PENDING) olur
    const defaultStatus = (currentUser?.isForeman || currentUser?.collarType === COLLAR_TYPES.BLUE_COLLAR) 
      ? leaveStatuses.PENDING 
      : leaveStatuses.PLANNED;

    setEmployeeSearch(emp ? `${emp.firstName} ${emp.lastName}` : '');
    setFormData({
      employeeId: targetEmpId ? targetEmpId.toString() : '',
      startDate: dateStr,
      endDate: dateStr,
      type: 'Planlı',
      reason: '',
      status: defaultStatus
    });
    setShowModal(true);
  };

  // İzin Düzenleme
  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setRuleNotices([]);
    const employee = employees.find(e => e.id === request.employeeId);
    setEmployeeSearch(employee ? `${employee.firstName} ${employee.lastName}` : '');
    setFormData({
      employeeId: request.employeeId.toString(),
      startDate: request.startDate,
      endDate: request.endDate,
      type: request.type,
      reason: request.reason || '',
      status: request.status
    });
    setShowModal(true);
  };

  // İzin Formu Kaydet (Kuralları Uygula)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      alert('Lütfen bir çalışan seçin');
      return;
    }

    const employee = employees.find(e => e.id === parseInt(formData.employeeId));
    if (!employee) return;

    // KURALLARI DENETLE VE UYGULA (Kural 4, 5, 6, 7 vb.)
    const validation = validateAndApplyRules(formData, relevantRequests, employee);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // Formen giriyorsa veya çalışan düzenliyorsa doğrudan Onay Bekliyor (PENDING) durumuna gidebilir
    let finalStatus = formData.status;
    if (editingRequest && editingRequest.status === leaveStatuses.REJECTED) {
      // Reddedilmiş / Geri gönderilmiş bir izin düzenlendiğinde tekrar Onay Bekliyor durumuna alınır
      finalStatus = leaveStatuses.PENDING;
    } else if (currentUser?.isForeman && finalStatus === leaveStatuses.PLANNED) {
      finalStatus = leaveStatuses.PENDING;
    }

    const requestData = {
      ...formData,
      employeeId: parseInt(formData.employeeId),
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      managerId: employee.managerId,
      startDate: validation.adjustedStartDate,
      endDate: validation.adjustedEndDate,
      duration: validation.adjustedDuration,
      status: finalStatus
    };

    if (editingRequest) {
      updateLeaveRequest(editingRequest.id, requestData);
      showToast('İzin planı güncellendi ve tekrar onaya sunuldu!');
    } else {
      addLeaveRequest(requestData);
      showToast('Yeni izin planı başarıyla oluşturuldu!');
    }

    if (validation.notices && validation.notices.length > 0) {
      alert(`Planlama Kuralları Uygulandı:\n• ${validation.notices.join('\n• ')}`);
    }

    setShowModal(false);
    setEmployeeSearch('');
    setRefreshKey(prev => prev + 1);
  };

  // İzin Onaylama Pop-up Tetikleme
  const handleApprove = (request) => {
    setRequestToApprove(request);
  };

  // İzin Geri Gönderme Pop-up Tetikleme
  const handleReject = (request) => {
    setRequestToReject(request);
  };

  // Onaylama Modalından Onaylama
  const handleConfirmApprove = (note) => {
    if (!requestToApprove) return;
    const currentWorkflow = requestToApprove.approvalWorkflow ? [...requestToApprove.approvalWorkflow] : [];
    currentWorkflow.push({
      step: currentWorkflow.length + 1,
      title: 'Yönetici Onayladı',
      user: `${currentUser?.name || 'Hasan Cavit Koçak'} (${currentUser?.title || 'Yönetici'})`,
      date: format(new Date(), 'dd.MM.yyyy HH:mm'),
      status: 'Onaylandı',
      note: note || 'İzin talebi yönetici tarafından onaylanmıştır.'
    });

    const updated = updateLeaveRequest(requestToApprove.id, { 
      status: leaveStatuses.APPROVED,
      approvalNote: note || '',
      approvalWorkflow: currentWorkflow
    });

    if (selectedRequest?.id === requestToApprove.id) {
      setSelectedRequest(updated);
    }
    setRequestToApprove(null);
    setShowRequestDetail(false);
    setRefreshKey(prev => prev + 1);
    showToast(`${requestToApprove.employeeName} için izin onaylandı!`, 'success');
  };

  // Geri Gönderme Modalından Reddetme
  const handleConfirmReject = (reason) => {
    if (!requestToReject) return;
    const currentWorkflow = requestToReject.approvalWorkflow ? [...requestToReject.approvalWorkflow] : [];
    currentWorkflow.push({
      step: currentWorkflow.length + 1,
      title: 'Geri Gönderildi',
      user: `${currentUser?.name || 'Hasan Cavit Koçak'} (${currentUser?.title || 'Yönetici'})`,
      date: format(new Date(), 'dd.MM.yyyy HH:mm'),
      status: 'Geri Gönderildi',
      note: reason
    });

    const updated = updateLeaveRequest(requestToReject.id, { 
      status: leaveStatuses.REJECTED,
      rejectionReason: reason,
      approvalWorkflow: currentWorkflow
    });

    if (selectedRequest?.id === requestToReject.id) {
      setSelectedRequest(updated);
    }
    setRequestToReject(null);
    setShowRequestDetail(false);
    setRefreshKey(prev => prev + 1);
    showToast(`${requestToReject.employeeName} için izin revize edilmek üzere geri gönderildi.`, 'warning');
  };

  // Revize Ederek Tekrar Onaya Sunma
  const handleConfirmResubmit = ({ startDate, endDate, duration, revisionNote }) => {
    if (!requestToResubmit) return;
    const currentWorkflow = requestToResubmit.approvalWorkflow ? [...requestToResubmit.approvalWorkflow] : [];
    currentWorkflow.push({
      step: currentWorkflow.length + 1,
      title: 'Revize Edilerek Tekrar Onaya Sunuldu',
      user: `${currentUser?.name || 'Ali Vural'} (Formen)`,
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

    if (selectedRequest?.id === requestToResubmit.id) {
      setSelectedRequest(updated);
    }
    setRequestToResubmit(null);
    setShowRequestDetail(false);
    setRefreshKey(prev => prev + 1);
    showToast(`${requestToResubmit.employeeName} için izin tarihleri güncellendi ve tekrar onaya sunuldu!`);
  };

  // İzin Silme
  const handleDelete = (request) => {
    if (window.confirm(`${request.employeeName} için izin planını silmek istediğinize emin misiniz?`)) {
      deleteLeaveRequest(request.id);
      setShowRequestDetail(false);
      setRefreshKey(prev => prev + 1);
      showToast('İzin planı silindi.');
    }
  };

  // Planı Kaydet Butonu
  const handleSavePlan = () => {
    showToast('Tüm izin planlamaları başarıyla kaydedildi!');
  };

  // Onaya Gönder Butonu (Kural 8: Planlama -> Onay Bekliyor turuncu akışı)
  const handleSendForApproval = () => {
    const plannedReqs = relevantRequests.filter(r => r.status === leaveStatuses.PLANNED);
    if (plannedReqs.length === 0) {
      alert('Onaya gönderilecek planlanan izin bulunamadı.');
      return;
    }
    if (window.confirm(`${plannedReqs.length} adet planlanan izin yönetici onayına gönderilecek. Onaylıyor musunuz?`)) {
      plannedReqs.forEach(req => {
        updateLeaveRequest(req.id, { status: leaveStatuses.PENDING });
      });
      setRefreshKey(prev => prev + 1);
      showToast(`${plannedReqs.length} izin talebi yönetici onayına gönderildi! Durum: Onay Bekliyor (Turuncu)`);
    }
  };

  // Sürükle & Bırak (Drag and Drop) İşleyicileri
  const handleDragStart = (e, leave) => {
    setDraggedLeave(leave);
    e.dataTransfer.setData('text/plain', leave.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnDay = (e, employee, targetDay) => {
    e.preventDefault();
    if (!draggedLeave) return;

    // Sadece aynı çalışana veya formenin yönettiği çalışana taşınabilir
    const newStartDate = targetDay;
    const newEndDate = addDays(newStartDate, draggedLeave.duration - 1);

    const updatedData = {
      ...draggedLeave,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      startDate: format(newStartDate, 'yyyy-MM-dd'),
      endDate: format(newEndDate, 'yyyy-MM-dd')
    };

    // Kuralları uygula
    const validation = validateAndApplyRules(updatedData, relevantRequests, employee);
    if (!validation.isValid) {
      alert(validation.error);
      setDraggedLeave(null);
      return;
    }

    updateLeaveRequest(draggedLeave.id, {
      ...updatedData,
      startDate: validation.adjustedStartDate,
      endDate: validation.adjustedEndDate,
      duration: validation.adjustedDuration
    });

    if (validation.notices && validation.notices.length > 0) {
      showToast(`Taşındı: ${validation.notices[0]}`, 'warning');
    } else {
      showToast(`İzin ${format(newStartDate, 'dd MMMM', { locale: tr })} tarihine taşındı!`);
    }

    setDraggedLeave(null);
    setRefreshKey(prev => prev + 1);
  };

  // Otomatik Planlama Algoritması
  const handleAutoPlanning = () => {
    const unplannedEmployees = filteredEmployees.filter(emp => {
      const empRequests = relevantRequests.filter(r => r.employeeId === emp.id);
      return empRequests.length === 0;
    });

    if (unplannedEmployees.length === 0) {
      alert('Seçili çalışanların tümü için zaten izin planlaması mevcuttur.');
      return;
    }

    const confirmMsg = `${unplannedEmployees.length} çalışan için ${format(currentDate, 'MMMM yyyy', { locale: tr })} ayında otomatik izin planlaması yapılacak.\n\nHer çalışan için:\n- Cuma/Cumartesi kuralları ve süre limitleri uygulanacak\n- Planlanan izinler Onay Bekliyor (Turuncu) durumunda oluşturulacak\n\nDevam edilsin mi?`;
    
    if (!window.confirm(confirmMsg)) return;

    const baseMonth = currentDate.getMonth();
    const baseYear = currentDate.getFullYear();
    let createdCount = 0;

    unplannedEmployees.forEach((emp, index) => {
      const daysToAllocate = Math.min(Math.max(Math.floor((emp.annualLeave?.available || 14) * 0.35), 3), 5);
      const startDayNum = Math.min(6 + (index * 4) % 18, 22);
      const startDate = new Date(baseYear, baseMonth, startDayNum);
      const endDate = addDays(startDate, daysToAllocate - 1);

      addLeaveRequest({
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        managerId: emp.managerId,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        duration: daysToAllocate,
        type: 'Planlı',
        reason: 'Otomatik Yıllık İzin Planı',
        status: leaveStatuses.PENDING // Turuncu onay bekliyor
      });
      createdCount++;
    });

    setRefreshKey(prev => prev + 1);
    showToast(`Otomatik planlama tamamlandı! ${createdCount} çalışan için izin planı eklendi.`);
  };

  // İzin Çubuğu Renkleri (Kullanıcı İsteği: Onay bekliyor turuncu, onaylandı yeşil, planlandı mavi, geri gönderildi kırmızı)
  const getLeaveBarStyle = (request) => {
    if (request.status === leaveStatuses.APPROVED) {
      return { bg: '#10b981', border: '#059669', color: '#ffffff' }; // Onaylandı: Yeşil
    }
    if (request.status === leaveStatuses.PENDING) {
      return { bg: '#f59e0b', border: '#d97706', color: '#ffffff' }; // Onay Bekliyor: Canlı Turuncu
    }
    if (request.status === leaveStatuses.REJECTED) {
      return { bg: '#ef4444', border: '#dc2626', color: '#ffffff' }; // Geri Gönderildi: Kırmızı
    }
    // Planlandı (PLANNED)
    return { bg: '#2563eb', border: '#1d4ed8', color: '#ffffff' }; // Planlandı: Mavi
  };

  // Çalışanın o aydaki izin barlarını hesapla
  const getEmployeeMonthLeaves = (employeeId) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    const empRequests = relevantRequests.filter(r => {
      if (r.employeeId !== employeeId) return false;
      const rStart = new Date(r.startDate);
      const rEnd = new Date(r.endDate);
      return rStart <= monthEnd && rEnd >= monthStart;
    });

    return empRequests.map(req => {
      const rStart = new Date(req.startDate);
      const rEnd = new Date(req.endDate);

      const clampedStart = rStart < monthStart ? monthStart : rStart;
      const clampedEnd = rEnd > monthEnd ? monthEnd : rEnd;

      const startDayIndex = clampedStart.getDate();
      const endDayIndex = clampedEnd.getDate();
      const spanDays = endDayIndex - startDayIndex + 1;

      return {
        ...req,
        startDayIndex,
        endDayIndex,
        spanDays
      };
    });
  };

  const getEmployeePlannedTotal = (employeeId) => {
    const leaves = getEmployeeMonthLeaves(employeeId);
    return leaves.reduce((sum, l) => sum + l.duration, 0);
  };

  const getEmployeeRemaining = (employee) => {
    return employee.annualLeave?.available ?? 14;
  };

  return (
    <div className={`yillik-izin-page ${isFullView ? 'full-view-mode' : ''} fade-in`}>
      
      {/* Toast Bildirimi */}
      {notification && (
        <div className={`toast-notification toast-${notification.type}`}>
          {notification.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ANA KONTROL BARI (Başlık, Filtreler, Rozetler, Butonlar) */}
      <section className="main-controls-card">
        <div className="controls-row-upper">
          
          {/* Başlık */}
          <div className="page-heading-area">
            <h1 className="page-main-title">Yıllık İzin Planlama</h1>
          </div>

          {/* Filtreler: Departman & Yıl */}
          <div className="dropdown-filters-group">
            <div className="custom-floating-select">
              <span className="floating-label">Departman</span>
              <select 
                value={selectedDepartment} 
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="control-select"
              >
                <option value="">Tümü</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="custom-floating-select">
              <span className="floating-label">Yıl</span>
              <select 
                value={selectedYear} 
                onChange={(e) => handleYearChange(e.target.value)}
                className="control-select year-select"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>

          {/* İstatistik Kartları (Apple UI Tarzı Şık Rozetler) */}
          <div className="leave-stats-badges-container">
            <div className="stat-badge-chip chip-entitled">
              <div className="chip-header">
                <span className="chip-dot dot-green"></span>
                <span className="chip-label">Hak Edilen</span>
              </div>
              <div className="chip-metric">
                <span className="chip-number">{stats.entitled}</span>
                <span className="chip-unit">gün</span>
              </div>
            </div>

            <div className="stat-badge-chip chip-previous">
              <div className="chip-header">
                <span className="chip-dot dot-blue"></span>
                <span className="chip-label">Devreden</span>
              </div>
              <div className="chip-metric">
                <span className="chip-number">{stats.previous}</span>
                <span className="chip-unit">gün</span>
              </div>
            </div>

            <div className="stat-badge-chip chip-future">
              <div className="chip-header">
                <span className="chip-dot dot-purple"></span>
                <span className="chip-label">Gelecek</span>
              </div>
              <div className="chip-metric">
                <span className="chip-number">{stats.future}</span>
                <span className="chip-unit">gün</span>
              </div>
            </div>

            <div className="stat-badge-chip chip-planned">
              <div className="chip-header">
                <span className="chip-dot dot-indigo"></span>
                <span className="chip-label">Planlanan</span>
              </div>
              <div className="chip-metric">
                <span className="chip-number">{stats.planned}</span>
                <span className="chip-unit">gün</span>
              </div>
            </div>

            <div className="stat-badge-chip chip-pending">
              <div className="chip-header">
                <span className="chip-dot dot-amber"></span>
                <span className="chip-label">Onay Bekleyen</span>
              </div>
              <div className="chip-metric">
                <span className="chip-number">{stats.pending}</span>
                <span className="chip-unit">gün</span>
              </div>
            </div>
          </div>

          {/* Eylem Butonları */}
          <div className="action-buttons-group">
            <button 
              className="btn-action-outline" 
              onClick={handleAutoPlanning}
              title="Kurallara uygun dengeli izin planı oluştur"
            >
              <Sparkles size={16} />
              <span>Otomatik Planlama</span>
            </button>

            <button 
              className="btn-action-primary" 
              onClick={handleSavePlan}
              title="Değişiklikleri kaydet"
            >
              <Save size={16} />
              <span>Planı Kaydet</span>
            </button>

            <button 
              className="btn-action-dark" 
              onClick={handleSendForApproval}
              title="Planlanan tüm izinleri onaya gönder"
            >
              <Send size={16} />
              <span>Onaya Gönder</span>
            </button>
          </div>

        </div>
      </section>

      {/* 3. TAKVİM NAVİGASYON BARI */}
      <div className="timeline-nav-bar">
        <div className="month-pagination-box">
          <button className="nav-arrow-btn" onClick={handlePrevMonth} title="Önceki Ay">
            <ChevronLeft size={20} />
          </button>
          <span className="active-month-text">
            {format(currentDate, 'MMMM yyyy', { locale: tr })}
          </span>
          <button className="nav-arrow-btn" onClick={handleNextMonth} title="Sonraki Ay">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="timeline-nav-controls">
          <div className="legend-indicator-group">
            <span className="legend-dot dot-planned"></span> <span className="legend-text">Planlandı</span>
            <span className="legend-dot dot-pending"></span> <span className="legend-text">Onay Bekliyor</span>
            <span className="legend-dot dot-approved"></span> <span className="legend-text">Onaylandı</span>
            <span className="legend-dot dot-rejected"></span> <span className="legend-text">Geri Gönderildi</span>
          </div>

          <div className="scroll-helper-group">
            <span className="scroll-label">Takvimi Kaydır:</span>
            <div className="scroll-arrow-buttons">
              <button 
                className="scroll-btn" 
                onClick={() => handleScrollTimeline('left')}
                title="Sola Kaydır"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="scroll-btn" 
                onClick={() => handleScrollTimeline('right')}
                title="Sağa Kaydır"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <button 
            className={`btn-toggle-view ${isFullView ? 'active' : ''}`}
            onClick={() => setIsFullView(!isFullView)}
            title={isFullView ? "Normal Görünüme Dön" : "Genişletilmiş Görünüm"}
          >
            {isFullView ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{isFullView ? 'Standart' : 'Tümünü Görüntüle'}</span>
          </button>

          <button 
            className="btn-new-plan-quick"
            onClick={() => handleAddRequest()}
            title="Yeni İzin Ekle"
          >
            <Plus size={16} />
            <span>Yeni İzin</span>
          </button>
        </div>
      </div>

      {/* 4. GANTT / MATRİS TABLOSU (Tam Oturan Genişlik & Sürükle-Bırak) */}
      <div className="timeline-table-wrapper" ref={timelineScrollRef}>
        <table className="timeline-gantt-table">
          <thead>
            <tr className="gantt-head-row">
              <th className="sticky-col col-dept">Departman</th>
              <th className="sticky-col col-emp">Çalışan</th>
              <th className="sticky-col col-planned">Planlanan</th>
              <th className="sticky-col col-remaining">Toplam Kalan</th>

              {monthDays.map((day) => {
                const dayNum = format(day, 'dd');
                const dayName = format(day, 'EEE', { locale: tr });
                const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                const isCurrent = isToday(day);

                return (
                  <th 
                    key={day.toISOString()} 
                    className={`day-column-header ${isWeekend ? 'weekend-day-header' : ''} ${isCurrent ? 'today-day-header' : ''}`}
                  >
                    <div className="day-header-number">{dayNum}</div>
                    <div className="day-header-name">{dayName}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={4 + monthDays.length} className="empty-table-cell">
                  Seçilen kriterlere uygun çalışan bulunamadı.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => {
                const leaves = getEmployeeMonthLeaves(employee.id);
                const plannedDaysCount = getEmployeePlannedTotal(employee.id);
                const remainingDaysCount = getEmployeeRemaining(employee);

                return (
                  <tr key={employee.id} className="gantt-employee-row">
                    <td className="sticky-col col-dept dept-cell">
                      {employee.department}
                    </td>

                    <td 
                      className="sticky-col col-emp emp-cell"
                      onClick={() => handleAddRequest(employee.id)}
                      title={`${employee.firstName} ${employee.lastName} (${employee.collarType || ''})\nYeni izin eklemek için tıklayın`}
                    >
                      <div className="emp-name-container">
                        <span className="emp-name-text">{employee.firstName} {employee.lastName}</span>
                      </div>
                    </td>

                    <td className="sticky-col col-planned planned-cell">
                      <strong className="text-blue-bold">{plannedDaysCount}</strong>
                    </td>

                    <td className="sticky-col col-remaining remaining-cell">
                      <strong className="text-green-bold">{remainingDaysCount}</strong>
                    </td>

                    {/* Gün Hücreleri ve Gantt Barları */}
                    {monthDays.map((day) => {
                      const dayNumber = day.getDate();
                      const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                      const isCurrent = isToday(day);

                      const startingLeave = leaves.find(l => l.startDayIndex === dayNumber);

                      return (
                        <td 
                          key={day.toISOString()} 
                          className={`day-cell-grid ${isWeekend ? 'weekend-cell' : ''} ${isCurrent ? 'today-cell' : ''}`}
                          onClick={() => handleAddRequest(employee.id, day)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnDay(e, employee, day)}
                          title={`${format(day, 'dd MMMM yyyy', { locale: tr })} - Tıklayarak izin ekleyin veya mevcut izni buraya sürükleyip bırakın`}
                        >
                          {startingLeave && (() => {
                            const barStyle = getLeaveBarStyle(startingLeave);
                            return (
                              <div 
                                className="gantt-leave-bar"
                                draggable
                                onDragStart={(e) => handleDragStart(e, startingLeave)}
                                style={{
                                  backgroundColor: barStyle.bg,
                                  borderColor: barStyle.border,
                                  color: barStyle.color,
                                  width: `calc(${startingLeave.spanDays * 100}% + ${(startingLeave.spanDays - 1) * 1}px - 6px)`
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequest(startingLeave);
                                  setShowRequestDetail(true);
                                }}
                                title={`${startingLeave.employeeName} (${startingLeave.startDate} - ${startingLeave.endDate})\nDurum: ${startingLeave.status}\nSürükleyip başka güne taşıyabilirsiniz!`}
                              >
                                <span className="bar-label-text">
                                  İzin ({startingLeave.duration} gün)
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                      );
                    })}

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. YENİ İZİN / DÜZENLEME MODALI */}
      {showModal && (
        <div className="plan-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="plan-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="plan-modal-header">
              <div className="plan-modal-header-left">
                <div className="plan-modal-icon-badge">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="plan-modal-title">
                    {editingRequest ? 'İzin Planını Düzenle' : 'Yeni İzin Planı'}
                  </h3>
                  <p className="plan-modal-subtitle">
                    {editingRequest ? 'İzin detaylarını güncelleyin ve kaydedin' : 'Tarih aralığı ve çalışan seçerek plan oluşturun'}
                  </p>
                </div>
              </div>
              <button className="plan-modal-close" onClick={() => setShowModal(false)} type="button">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="plan-modal-form">
              <div className="plan-modal-body">
                {/* Çalışan Seçimi */}
                <div className="form-group">
                  <label className="form-label required">Çalışan</label>
                  <div className="employee-search-container">
                    <input
                      type="text"
                      className="input"
                      placeholder="Çalışan ara ve seç..."
                      value={employeeSearch}
                      onChange={(e) => {
                        setEmployeeSearch(e.target.value);
                        setShowEmployeeDropdown(true);
                      }}
                      onFocus={() => setShowEmployeeDropdown(true)}
                    />
                    {showEmployeeDropdown && (
                      <div className="employee-dropdown-results">
                        {filteredEmployees
                          .filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase()))
                          .map(emp => (
                            <div
                              key={emp.id}
                              className="dropdown-item-emp"
                              onClick={() => {
                                setFormData({ ...formData, employeeId: emp.id.toString() });
                                setEmployeeSearch(`${emp.firstName} ${emp.lastName}`);
                                setShowEmployeeDropdown(false);
                              }}
                            >
                              <div className="emp-drop-name">
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="emp-drop-dept">{emp.department} • Kalan İzin: {emp.annualLeave?.available || 14} gün</div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tarih Aralığı */}
                <div className="form-row-dates">
                  <div className="form-group">
                    <label className="form-label required">Başlangıç Tarihi</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Bitiş Tarihi</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.endDate}
                      min={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Tür ve Durum */}
                <div className="form-row-dates">
                  <div className="form-group">
                    <label className="form-label">İzin Türü</label>
                    <select
                      className="select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Planlı">Yıllık İzin (Planlı)</option>
                      <option value="Mazeret">Mazeret İzni</option>
                      <option value="Hastalık">Hastalık / Rapor</option>
                      <option value="Ani">Ani İzin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Durum</label>
                    <select
                      className="select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value={leaveStatuses.PENDING}>Onay Bekliyor</option>
                      <option value={leaveStatuses.PLANNED}>Planlandı</option>
                      {currentUser?.isManager && (
                        <>
                          <option value={leaveStatuses.APPROVED}>Onaylandı</option>
                          <option value={leaveStatuses.REJECTED}>Geri Gönderildi</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Açıklama */}
                <div className="form-group">
                  <label className="form-label">Açıklama</label>
                  <textarea
                    className="textarea"
                    rows="3"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="İsteğe bağlı izin notu veya gerekçesi..."
                  />
                </div>
              </div>

              <div className="plan-modal-footer">
                <button type="button" className="btn btn-modal-cancel" onClick={() => setShowModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn btn-modal-submit">
                  {editingRequest ? 'Güncelle & Onaya Gönder' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. İZİN DETAY MODALI (Kural 10 & 11: Tek Ekranda İnceleme, Onaylama, Geri Gönderme) */}
      {showRequestDetail && selectedRequest && (
        <div className="plan-modal-overlay" onClick={() => setShowRequestDetail(false)}>
          <div className="plan-modal-dialog plan-detail-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="plan-modal-header">
              <div className="plan-modal-header-left">
                <div className="plan-modal-icon-badge">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <h3 className="plan-modal-title">İzin Talebi & Onay Yönetimi</h3>
                  <p className="plan-modal-subtitle">Talep detaylarını inceleyin, onaylayın veya düzenleyin</p>
                </div>
              </div>
              <button className="plan-modal-close" onClick={() => setShowRequestDetail(false)} type="button">
                <X size={18} />
              </button>
            </div>

            <div className="plan-modal-body">
              <div className="detail-profile-card">
                <div className="detail-avatar">
                  {selectedRequest.employeeName?.split(' ').map(n => n[0]).join('') || 'İ'}
                </div>
                <div>
                  <h4 className="detail-emp-name">{selectedRequest.employeeName}</h4>
                  <div className="detail-emp-dept">{selectedRequest.department}</div>
                </div>
                <div className="detail-status-badge">
                  <span className={`badge ${
                    selectedRequest.status === leaveStatuses.APPROVED ? 'badge-success' :
                    selectedRequest.status === leaveStatuses.PENDING ? 'badge-warning' :
                    selectedRequest.status === leaveStatuses.REJECTED ? 'badge-danger' :
                    'badge-info'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <span className="info-title">Başlangıç</span>
                  <span className="info-value">
                    {format(new Date(selectedRequest.startDate), 'dd MMMM yyyy', { locale: tr })}
                  </span>
                </div>
                <div className="detail-info-item">
                  <span className="info-title">Bitiş</span>
                  <span className="info-value">
                    {format(new Date(selectedRequest.endDate), 'dd MMMM yyyy', { locale: tr })}
                  </span>
                </div>
                <div className="detail-info-item">
                  <span className="info-title">Süre</span>
                  <span className="info-value bold-days">{selectedRequest.duration} Gün</span>
                </div>
                <div className="detail-info-item">
                  <span className="info-title">Tür</span>
                  <span className="info-value">{selectedRequest.type}</span>
                </div>
              </div>

              {selectedRequest.reason && (
                <div className="detail-reason-box">
                  <span className="info-title">Açıklama:</span>
                  <p>{selectedRequest.reason}</p>
                </div>
              )}

              {/* GÖRSEL ONAY AKIŞI TIMELINE'I */}
              <WorkflowTimeline 
                workflow={selectedRequest.approvalWorkflow}
                rejectionReason={selectedRequest.rejectionReason}
                approvalNote={selectedRequest.approvalNote}
                currentStatus={selectedRequest.status}
              />
            </div>

            <div className="plan-modal-footer plan-detail-footer">
              <div className="action-buttons-left">
                {/* Yönetici Onay ve Geri Gönderme Butonları */}
                {currentUser?.isManager && selectedRequest.status === leaveStatuses.PENDING && (
                  <>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprove(selectedRequest)}
                      title="İzni onayla (Onay Pop-up'ı açılır)"
                    >
                      <CheckCircle size={16} /> Onayla
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(selectedRequest)}
                      title="İzni düzenlenmesi için geri gönder (Gerekçe alanı açılır)"
                    >
                      <XCircle size={16} /> Geri Gönder
                    </button>
                  </>
                )}

                {/* Reddedilen izni tekrar onaya gönderme imkanı */}
                {selectedRequest.status === leaveStatuses.REJECTED && (
                  <button 
                    className="btn btn-warning btn-sm"
                    onClick={() => setRequestToResubmit(selectedRequest)}
                    title="Tarihleri Revize Et ve Tekrar Onaya Gönder"
                  >
                    <RotateCcw size={16} /> Revize Et & Tekrar Onaya Gönder
                  </button>
                )}

                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setShowRequestDetail(false);
                    handleEditRequest(selectedRequest);
                  }}
                  title="Düzenle"
                >
                  <Edit size={16} /> Düzenle
                </button>

                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(selectedRequest)}
                  title="Sil"
                >
                  <Trash2 size={16} /> Sil
                </button>
              </div>

              <button className="btn btn-secondary" onClick={() => setShowRequestDetail(false)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONAYLAMA POP-UP'I */}
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

      {/* GERİ GÖNDERME / REDDETME POP-UP'I */}
      <RejectionReasonModal
        isOpen={Boolean(requestToReject)}
        onClose={() => setRequestToReject(null)}
        onConfirm={handleConfirmReject}
        title="İzin Talebini Geri Gönder"
        subtitle="Çalışana ve formene revize gerekçesi iletilecektir. Lütfen nedeni yazınız."
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

      {/* REVİZE ET VE TEKRAR ONAYA SUN POP-UP'I */}
      <ResubmitModal
        isOpen={Boolean(requestToResubmit)}
        onClose={() => setRequestToResubmit(null)}
        onConfirm={handleConfirmResubmit}
        request={requestToResubmit}
      />

    </div>
  );
};

export default Planning;
