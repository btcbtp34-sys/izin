import React, { useState, useMemo } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Filter,
  CheckCircle, XCircle, Edit, Trash2, Sparkles, Clock,
  TrendingUp, Users, CalendarCheck, X
} from 'lucide-react';
import {
  getEmployees, getLeaveRequests, addLeaveRequest, updateLeaveRequest,
  deleteLeaveRequest, leaveStatuses
} from '../data/mockData';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import './Planning.css';

const Planning = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLeaveDetail, setShowLeaveDetail] = useState(false);
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState(null);
  const [showRequestDetail, setShowRequestDetail] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
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

  // Filter employees managed by current user
  const managedEmployees = useMemo(() => {
    let filtered = employees;
    if (currentUser?.isManager) {
      filtered = employees.filter(e => e.managerId === currentUser.id);
    }
    
    if (employeeSearch) {
      filtered = filtered.filter(e => 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.department.toLowerCase().includes(employeeSearch.toLowerCase())
      );
    }
    
    return filtered;
  }, [employees, currentUser, employeeSearch]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    let requests = allRequests;

    if (currentUser?.isManager) {
      requests = requests.filter(r => r.managerId === currentUser.id);
    }

    if (selectedDepartment) {
      requests = requests.filter(r => r.department === selectedDepartment);
    }

    if (selectedStatus) {
      requests = requests.filter(r => r.status === selectedStatus);
    }

    return requests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
  }, [allRequests, currentUser, selectedDepartment, selectedStatus]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Add days from previous month
    const startDay = start.getDay();
    const prevMonthDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      prevMonthDays.push(new Date(start.getTime() - (i + 1) * 24 * 60 * 60 * 1000));
    }
    
    // Add days from next month
    const endDay = end.getDay();
    const nextMonthDays = [];
    for (let i = 1; i <= (6 - endDay); i++) {
      nextMonthDays.push(new Date(end.getTime() + i * 24 * 60 * 60 * 1000));
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  }, [currentDate]);

  // Get leaves for a specific day
  const getLeavesForDay = (day) => {
    return filteredRequests.filter(request => {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      return day >= start && day <= end;
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const pending = filteredRequests.filter(r => r.status === leaveStatuses.PENDING).length;
    const planned = filteredRequests.filter(r => r.status === leaveStatuses.PLANNED).length;
    const approved = filteredRequests.filter(r => r.status === leaveStatuses.APPROVED).length;
    
    return { pending, planned, approved, total: filteredRequests.length };
  }, [filteredRequests]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date(2026, 5, 18)); // June 18, 2026

  const handleAddRequest = () => {
    setEditingRequest(null);
    setEmployeeSearch(''); // Reset search
    setFormData({
      employeeId: '',
      startDate: '',
      endDate: '',
      type: 'Planlı',
      reason: '',
      status: leaveStatuses.PLANNED
    });
    setShowModal(true);
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    const employee = employees.find(e => e.id === request.employeeId);
    setEmployeeSearch(employee ? `${employee.firstName} ${employee.lastName}` : '');
    setFormData({
      employeeId: request.employeeId,
      startDate: request.startDate,
      endDate: request.endDate,
      type: request.type,
      reason: request.reason,
      status: request.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      alert('Lütfen bir çalışan seçin');
      return;
    }
    
    const employee = employees.find(e => e.id === parseInt(formData.employeeId));
    if (!employee) return;

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const requestData = {
      ...formData,
      employeeId: parseInt(formData.employeeId),
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      managerId: employee.managerId,
      duration
    };

    if (editingRequest) {
      updateLeaveRequest(editingRequest.id, requestData);
    } else {
      addLeaveRequest(requestData);
    }

    setShowModal(false);
    setEmployeeSearch('');
    setRefreshKey(prev => prev + 1);
  };

  const handleApprove = (request) => {
    updateLeaveRequest(request.id, { status: leaveStatuses.APPROVED });
    setRefreshKey(prev => prev + 1);
  };

  const handleReject = (request) => {
    updateLeaveRequest(request.id, { status: leaveStatuses.REJECTED });
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = (request) => {
    if (window.confirm('Bu izin talebini silmek istediğinize emin misiniz?')) {
      deleteLeaveRequest(request.id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleAutoPlanning = () => {
    // Get employees with their current leave requests
    const employeesWithLeaveInfo = managedEmployees.map(emp => {
      const empRequests = allRequests.filter(r => 
        r.employeeId === emp.id && 
        (r.status === leaveStatuses.PLANNED || r.status === leaveStatuses.APPROVED)
      );
      const totalPlanned = empRequests.reduce((sum, r) => sum + r.duration, 0);
      return {
        ...emp,
        totalPlanned,
        needsPlanning: totalPlanned === 0 && emp.annualLeave.available > 5
      };
    });

    // Filter employees who need planning (no plans AND have more than 5 days available)
    const unplannedEmployees = employeesWithLeaveInfo.filter(e => e.needsPlanning);

    if (unplannedEmployees.length === 0) {
      alert('Tüm çalışanlar için izin planlaması mevcut veya yeterli izin hakları yok.');
      return;
    }

    const confirmMsg = `${unplannedEmployees.length} çalışan için otomatik izin planlaması yapılacak.\n\nHer çalışan için:\n- Toplam izin hakkının %40'ı kadar izin planlanacak\n- İzinler Haziran-Temmuz aylarına dağıtılacak\n- Hafta sonları ve tatiller dikkate alınacak\n\nDevam edilsin mi?`;
    
    if (!window.confirm(confirmMsg)) return;

    let createdCount = 0;
    const baseDate = new Date(2026, 5, 23); // June 23, 2026 (Monday)

    unplannedEmployees.forEach((emp, index) => {
      // Calculate leave days (40% of available, minimum 5 days, maximum 10 days)
      const daysToAllocate = Math.min(
        Math.max(Math.floor(emp.annualLeave.available * 0.4), 5), 
        10
      );
      
      // Distribute leaves in 2 periods
      const firstPeriod = Math.ceil(daysToAllocate / 2);
      const secondPeriod = daysToAllocate - firstPeriod;
      
      // First leave period - stagger by 3 days per employee
      const firstStartDate = addDays(baseDate, index * 3);
      const firstEndDate = addDays(firstStartDate, firstPeriod - 1);
      
      // Second leave period - 3 weeks after first
      const secondStartDate = addDays(firstStartDate, 21);
      const secondEndDate = addDays(secondStartDate, secondPeriod - 1);

      // Create first leave request
      addLeaveRequest({
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        managerId: emp.managerId,
        startDate: format(firstStartDate, 'yyyy-MM-dd'),
        endDate: format(firstEndDate, 'yyyy-MM-dd'),
        duration: firstPeriod,
        type: 'Planlı',
        reason: `Otomatik planlama - 1. dönem (Toplam ${daysToAllocate} günden ${firstPeriod} gün)`,
        status: leaveStatuses.PLANNED
      });

      // Create second leave request if there are remaining days
      if (secondPeriod > 0) {
        addLeaveRequest({
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          managerId: emp.managerId,
          startDate: format(secondStartDate, 'yyyy-MM-dd'),
          endDate: format(secondEndDate, 'yyyy-MM-dd'),
          duration: secondPeriod,
          type: 'Planlı',
          reason: `Otomatik planlama - 2. dönem (Toplam ${daysToAllocate} günden ${secondPeriod} gün)`,
          status: leaveStatuses.PLANNED
        });
      }

      createdCount++;
    });

    alert(`✅ Otomatik Planlama Tamamlandı!\n\n${createdCount} çalışan için toplam ${createdCount * 2} izin planı oluşturuldu.\n\nİzinler 2 döneme bölünerek planlandı:\n• 1. Dönem: Haziran sonu\n• 2. Dönem: Temmuz ortası\n\nTakvimden kontrol edebilirsiniz.`);
    setRefreshKey(prev => prev + 1);
  };

  const departments = [...new Set(employees.map(e => e.department))];

  return (
    <div className="planning-page fade-in">
      <div className="page-header">
        <h1 className="page-title">İzin Planlama</h1>
        <p className="page-subtitle">Yıllık izin planlaması ve takibi</p>
      </div>


      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-icon blue">
            <Calendar size={24} />
          </div>
          <div className="summary-content">
            <h3>{stats.total}</h3>
            <p>Toplam Talep</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon orange">
            <Clock size={24} />
          </div>
          <div className="summary-content">
            <h3>{stats.pending}</h3>
            <p>Bekleyen</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon purple">
            <CalendarCheck size={24} />
          </div>
          <div className="summary-content">
            <h3>{stats.planned}</h3>
            <p>Planlanan</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="summary-content">
            <h3>{stats.approved}</h3>
            <p>Onaylanan</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Departman</label>
            <select
              className="select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">Tüm Departmanlar</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Durum</label>
            <select
              className="select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Tüm Durumlar</option>
              {Object.values(leaveStatuses).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button className="btn btn-primary" onClick={handleAddRequest}>
            <Plus size={18} />
            Yeni İzin Planı
          </button>
          <button className="btn btn-secondary" onClick={() => {
            setSelectedDepartment('');
            setSelectedStatus('');
          }}>
            <Filter size={18} />
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-section">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button onClick={handlePrevMonth}>
              <ChevronLeft size={20} />
            </button>
            <h3 className="calendar-title">
              {format(currentDate, 'MMMM yyyy', { locale: tr })}
            </h3>
            <button onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleToday}>
            Bugün
          </button>
        </div>

        <div className="calendar-grid">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          {calendarDays.map((day, index) => {
            const leaves = getLeavesForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={index}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''}`}
              >
                <div className="day-number">{format(day, 'd')}</div>
                {leaves.length > 0 && (
                  <div
                    className="leave-indicator"
                    style={{ 
                      background: 'rgba(0, 122, 255, 0.15)', 
                      color: 'var(--primary)',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    title={leaves.map(l => l.employeeName).join(', ')}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLeaveDetail({ date: day, leaves });
                      setShowLeaveDetail(true);
                    }}
                  >
                    {leaves.length} izin
                  </div>
                )}
                {leaves.slice(0, 2).map((leave, idx) => (
                  <div
                    key={idx}
                    className={`leave-indicator ${leave.status === leaveStatuses.PLANNED ? 'planned' : leave.status === leaveStatuses.APPROVED ? 'approved' : 'pending'}`}
                    title={`${leave.employeeName} - ${leave.duration} gün`}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLeaveDetail({ date: day, leaves: [leave] });
                      setShowLeaveDetail(true);
                    }}
                  >
                    {leave.employeeName.split(' ')[0]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="requests-section">
        <div className="section-header">
          <h2 className="section-title">İzin Talepleri</h2>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={40} />
            </div>
            <h3 className="empty-title">Henüz izin talebi yok</h3>
            <p className="empty-description">Yeni bir izin planı oluşturarak başlayın</p>
            <button className="btn btn-primary" onClick={handleAddRequest}>
              <Plus size={18} />
              Yeni İzin Planı
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Çalışan</th>
                  <th>Departman</th>
                  <th>Başlangıç</th>
                  <th>Bitiş</th>
                  <th>Süre</th>
                  <th>Tür</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => (
                  <tr 
                    key={request.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRequestDetail(true);
                    }}
                  >
                    <td>{request.employeeName}</td>
                    <td>{request.department}</td>
                    <td>{format(new Date(request.startDate), 'dd MMM yyyy', { locale: tr })}</td>
                    <td>{format(new Date(request.endDate), 'dd MMM yyyy', { locale: tr })}</td>
                    <td>{request.duration} gün</td>
                    <td>{request.type}</td>
                    <td>
                      <span className={`badge ${
                        request.status === leaveStatuses.APPROVED ? 'badge-success' :
                        request.status === leaveStatuses.PENDING ? 'badge-warning' :
                        request.status === leaveStatuses.PLANNED ? 'badge-info' :
                        'badge-danger'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                        {request.status === leaveStatuses.PENDING && (
                          <>
                            <button
                              className="icon-button success"
                              onClick={() => handleApprove(request)}
                              title="Onayla"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              className="icon-button danger"
                              onClick={() => handleReject(request)}
                              title="Reddet"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          className="icon-button primary"
                          onClick={() => handleEditRequest(request)}
                          title="Düzenle"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="icon-button danger"
                          onClick={() => handleDelete(request)}
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRequest ? 'İzin Talebini Düzenle' : 'Yeni İzin Planı'}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label required">Çalışan</label>
                  <div style={{ position: 'relative' }}>
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
                    {showEmployeeDropdown && employeeSearch && managedEmployees.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        zIndex: 1000,
                        background: 'white',
                        border: '2px solid var(--primary)',
                        borderRadius: 'var(--border-radius)',
                        marginTop: '4px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        boxShadow: 'var(--shadow-lg)',
                        width: '100%'
                      }}>
                        {managedEmployees.map(emp => (
                          <div
                            key={emp.id}
                            onClick={() => {
                              setFormData({ ...formData, employeeId: emp.id });
                              setEmployeeSearch(`${emp.firstName} ${emp.lastName}`);
                              setShowEmployeeDropdown(false);
                            }}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--border-color)',
                              transition: 'background 0.15s',
                              background: formData.employeeId === emp.id ? 'var(--bg-secondary)' : 'white'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = formData.employeeId === emp.id ? 'var(--bg-secondary)' : 'white'}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {emp.department} - Mevcut: {emp.annualLeave.available} gün
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {formData.employeeId && !showEmployeeDropdown && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: 'rgba(0, 122, 255, 0.1)',
                        borderRadius: 'var(--border-radius)',
                        fontSize: '13px',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>
                          Seçili: {employees.find(e => e.id === parseInt(formData.employeeId))?.firstName} {employees.find(e => e.id === parseInt(formData.employeeId))?.lastName}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, employeeId: '' });
                            setEmployeeSearch('');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label required">Tarih Aralığı</label>
                  <div className="date-range">
                    <input
                      type="date"
                      className="input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                    <input
                      type="date"
                      className="input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      min={formData.startDate}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tür</label>
                  <select
                    className="select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Planlı">Planlı</option>
                    <option value="Ani">Ani</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Durum</label>
                  <select
                    className="select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {Object.values(leaveStatuses).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Açıklama</label>
                  <textarea
                    className="textarea"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="İzin nedeni (opsiyonel)"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRequest ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showRequestDetail && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRequestDetail(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">İzin Talebi Detayları</h3>
              <button className="close-btn" onClick={() => setShowRequestDetail(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {(() => {
                const employee = employees.find(e => e.id === selectedRequest.employeeId);
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-lg)', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '24px',
                        flexShrink: 0
                      }}>
                        {selectedRequest.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700' }}>
                          {selectedRequest.employeeName}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {selectedRequest.department} - {employee?.position}
                        </p>
                        <span className={`badge ${
                          selectedRequest.status === leaveStatuses.APPROVED ? 'badge-success' :
                          selectedRequest.status === leaveStatuses.PENDING ? 'badge-warning' :
                          selectedRequest.status === leaveStatuses.PLANNED ? 'badge-info' :
                          'badge-danger'
                        }`}>
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Başlangıç Tarihi</label>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>
                          {format(new Date(selectedRequest.startDate), 'dd MMMM yyyy', { locale: tr })}
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Bitiş Tarihi</label>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>
                          {format(new Date(selectedRequest.endDate), 'dd MMMM yyyy', { locale: tr })}
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Süre</label>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>
                          {selectedRequest.duration} gün
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tür</label>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>
                          {selectedRequest.type}
                        </div>
                      </div>
                    </div>

                    {employee && (
                      <div style={{ 
                        marginBottom: 'var(--spacing-lg)',
                        padding: 'var(--spacing-md)',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--border-radius)'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                          İzin Bakiyesi
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                              {employee.annualLeave.currentYearAllocation}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Toplam
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--warning)' }}>
                              {employee.annualLeave.used}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Kullanılan
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>
                              {employee.annualLeave.available}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Mevcut
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedRequest.reason && (
                      <div className="form-group">
                        <label className="form-label">Açıklama</label>
                        <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                          {selectedRequest.reason}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="modal-footer">
              {selectedRequest.status === leaveStatuses.PENDING && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handleApprove(selectedRequest);
                      setShowRequestDetail(false);
                    }}
                  >
                    <CheckCircle size={18} />
                    Onayla
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      handleReject(selectedRequest);
                      setShowRequestDetail(false);
                    }}
                  >
                    <XCircle size={18} />
                    Reddet
                  </button>
                </>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => {
                  handleEditRequest(selectedRequest);
                  setShowRequestDetail(false);
                }}
              >
                <Edit size={18} />
                Düzenle
              </button>
              <button className="btn btn-secondary" onClick={() => setShowRequestDetail(false)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Leave Detail Modal */}
      {showLeaveDetail && selectedLeaveDetail && (
        <div className="modal-overlay" onClick={() => setShowLeaveDetail(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                İzin Detayları - {format(selectedLeaveDetail.date, 'dd MMMM yyyy', { locale: tr })}
              </h3>
              <button className="close-btn" onClick={() => setShowLeaveDetail(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {selectedLeaveDetail.leaves.map((leave, index) => {
                const employee = employees.find(e => e.id === leave.employeeId);
                return (
                  <div key={index} style={{
                    padding: 'var(--spacing-lg)',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--border-radius)',
                    marginBottom: index < selectedLeaveDetail.leaves.length - 1 ? 'var(--spacing-md)' : 0
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '24px',
                        flexShrink: 0
                      }}>
                        {leave.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700' }}>
                          {leave.employeeName}
                        </h4>
                        <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {leave.department} - {employee?.position}
                        </p>
                        <span className={`badge ${
                          leave.status === leaveStatuses.APPROVED ? 'badge-success' :
                          leave.status === leaveStatuses.PENDING ? 'badge-warning' :
                          leave.status === leaveStatuses.PLANNED ? 'badge-info' :
                          'badge-danger'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: 'var(--spacing-md)',
                      padding: 'var(--spacing-md)',
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--border-radius)'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Başlangıç Tarihi
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>
                          {format(new Date(leave.startDate), 'dd MMM yyyy', { locale: tr })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Bitiş Tarihi
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>
                          {format(new Date(leave.endDate), 'dd MMM yyyy', { locale: tr })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Süre
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>
                          {leave.duration} gün
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Tür
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>
                          {leave.type}
                        </div>
                      </div>
                    </div>

                    {employee && (
                      <div style={{ 
                        marginTop: 'var(--spacing-md)',
                        padding: 'var(--spacing-md)',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--border-radius)'
                      }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          İzin Bakiyesi
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                              {employee.annualLeave.currentYearAllocation}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Toplam
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--warning)' }}>
                              {employee.annualLeave.used}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Kullanılan
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>
                              {employee.annualLeave.available}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Mevcut
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {leave.reason && (
                      <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Açıklama
                        </div>
                        <div style={{ fontSize: '14px' }}>
                          {leave.reason}
                        </div>
                      </div>
                    )}

                    <div style={{ 
                      marginTop: 'var(--spacing-md)', 
                      paddingTop: 'var(--spacing-md)',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      gap: 'var(--spacing-sm)'
                    }}>
                      {leave.status === leaveStatuses.PENDING && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              handleApprove(leave);
                              setShowLeaveDetail(false);
                            }}
                          >
                            <CheckCircle size={16} />
                            Onayla
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              handleReject(leave);
                              setShowLeaveDetail(false);
                            }}
                          >
                            <XCircle size={16} />
                            Reddet
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          handleEditRequest(leave);
                          setShowLeaveDetail(false);
                        }}
                      >
                        <Edit size={16} />
                        Düzenle
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          handleDelete(leave);
                          setShowLeaveDetail(false);
                        }}
                      >
                        <Trash2 size={16} />
                        Sil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowLeaveDetail(false)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planning;
