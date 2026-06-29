import React, { useState, useMemo } from 'react';
import {
  Users, Plus, Search, Filter, Grid, List, Mail, Phone,
  Briefcase, Edit, Trash2, UserCheck, Calendar, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import {
  getEmployees, addEmployee, updateEmployee, deleteEmployee
} from '../data/mockData';
import './Employees.css';

const ITEMS_PER_PAGE = 12; // 12 çalışan per page

const Employees = () => {
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list' - Default to list
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    isManager: false,
    managerId: null,
    birthDate: '',
    hireDate: ''
  });

  const employees = getEmployees();

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = (
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesDepartment = !selectedDepartment || emp.department === selectedDepartment;
      const matchesPosition = !selectedPosition || emp.position === selectedPosition;
      
      return matchesSearch && matchesDepartment && matchesPosition;
    });
  }, [employees, searchTerm, selectedDepartment, selectedPosition]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedPosition]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const departments = [...new Set(employees.map(e => e.department))];
  const positions = [...new Set(employees.map(e => e.position))];

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      isManager: false,
      managerId: null,
      birthDate: '',
      hireDate: '',
      annualLeave: {
        previousBalance: 0,
        currentYearAllocation: 14,
        used: 0,
        planned: 0,
        available: 14
      }
    });
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      isManager: employee.isManager,
      managerId: employee.managerId,
      birthDate: employee.birthDate,
      hireDate: employee.hireDate
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
    } else {
      addEmployee(formData);
    }

    setShowModal(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = (employee) => {
    if (window.confirm(`${employee.firstName} ${employee.lastName} adlı çalışanı silmek istediğinize emin misiniz?`)) {
      deleteEmployee(employee.id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const managers = employees.filter(e => e.isManager);

  return (
    <div className="employees-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Çalışanlar</h1>
          <p className="page-subtitle">
            {filteredEmployees.length} çalışan bulundu
            {filteredEmployees.length !== employees.length && ` (Toplam: ${employees.length})`}
            {totalPages > 1 && ` • Sayfa ${currentPage} / ${totalPages}`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddEmployee}>
          <Plus size={18} />
          Yeni Çalışan
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-top">
          <div className="search-bar">
            <input
              type="text"
              className="input"
              placeholder="Çalışan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="toolbar-actions">
            <div className="view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
                Kart
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
                Liste
              </button>
            </div>
          </div>
        </div>
        <div className="toolbar-bottom">
          <div className="filter-group">
            <label className="filter-label">Departman</label>
            <select
              className="select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">Tümü</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Pozisyon</label>
            <select
              className="select"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              <option value="">Tümü</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">&nbsp;</label>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('');
                setSelectedPosition('');
              }}
            >
              <Filter size={18} />
              Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Employee Grid/List */}
      {viewMode === 'grid' ? (
        <div className="employee-grid">
          {paginatedEmployees.map(employee => (
            <div key={employee.id} className="employee-card">
              <div className="employee-card-header">
                <div className="employee-avatar">
                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                </div>
                <div className="employee-info">
                  <h3 className="employee-name">
                    {employee.firstName} {employee.lastName}
                    {employee.isManager && (
                      <span className="manager-badge-inline">
                        <UserCheck size={12} />
                        Yönetici
                      </span>
                    )}
                  </h3>
                  <p className="employee-position">{employee.position}</p>
                  <p className="employee-department">{employee.department}</p>
                </div>
                <div className="employee-actions">
                  <button
                    className="icon-button primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEmployee(employee);
                    }}
                    title="Düzenle"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(employee);
                    }}
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="employee-card-body">
                <div className="employee-detail">
                  <Mail size={16} />
                  <span>{employee.email}</span>
                </div>
                <div className="employee-detail">
                  <Phone size={16} />
                  <span>{employee.phone}</span>
                </div>
              </div>
              <div className="employee-card-footer">
                <div className="leave-stat available">
                  <h4 className="leave-stat-value">{employee.annualLeave.available}</h4>
                  <p className="leave-stat-label">Mevcut</p>
                </div>
                <div className="leave-stat used">
                  <h4 className="leave-stat-value">{employee.annualLeave.used}</h4>
                  <p className="leave-stat-label">Kullanılan</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="employee-list">
          {paginatedEmployees.map(employee => (
            <div key={employee.id} className="list-item">
              <div className="list-item-left">
                <div className="list-item-avatar">
                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                </div>
                <div className="list-item-info">
                  <h4 className="list-item-name">
                    {employee.firstName} {employee.lastName}
                    {employee.isManager && <span className="badge badge-primary" style={{ marginLeft: '8px' }}>Yönetici</span>}
                  </h4>
                  <div className="list-item-meta">
                    <span>
                      <Briefcase size={14} />
                      {employee.position}
                    </span>
                    <span>
                      <Users size={14} />
                      {employee.department}
                    </span>
                    <span>
                      <Mail size={14} />
                      {employee.email}
                    </span>
                  </div>
                </div>
              </div>
              <div className="list-item-center">
                <div className="list-stat">
                  <div className="list-stat-value">{employee.annualLeave.currentYearAllocation}</div>
                  <div className="list-stat-label">Toplam İzin</div>
                </div>
                <div className="list-stat">
                  <div className="list-stat-value" style={{ color: 'var(--warning)' }}>
                    {employee.annualLeave.used}
                  </div>
                  <div className="list-stat-label">Kullanılan</div>
                </div>
                <div className="list-stat">
                  <div className="list-stat-value" style={{ color: 'var(--success)' }}>
                    {employee.annualLeave.available}
                  </div>
                  <div className="list-stat-label">Mevcut</div>
                </div>
              </div>
              <div className="list-item-right">
                <button
                  className="icon-button primary"
                  onClick={() => handleEditEmployee(employee)}
                  title="Düzenle"
                >
                  <Edit size={18} />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => handleDelete(employee)}
                  title="Sil"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            title="İlk sayfa"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            title="Önceki sayfa"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="pagination-numbers">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
              ) : (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Sonraki sayfa"
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="pagination-btn"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            title="Son sayfa"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      )}

      {filteredEmployees.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Users size={40} />
          </div>
          <h3 className="empty-title">Çalışan bulunamadı</h3>
          <p className="empty-description">Arama kriterlerinizi değiştirerek tekrar deneyin</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingEmployee ? 'Çalışanı Düzenle' : 'Yeni Çalışan Ekle'}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label required">Ad</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Soyad</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">E-posta</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Departman</label>
                  <select
                    className="select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  >
                    <option value="">Seçiniz</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Pozisyon</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Doğum Tarihi</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">İşe Başlama Tarihi</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isManager}
                      onChange={(e) => setFormData({ ...formData, isManager: e.target.checked })}
                    />
                    <span className="form-label" style={{ margin: 0 }}>Yönetici</span>
                  </label>
                </div>
                {!formData.isManager && (
                  <div className="form-group">
                    <label className="form-label">Bağlı Olduğu Yönetici</label>
                    <select
                      className="select"
                      value={formData.managerId || ''}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value ? parseInt(e.target.value) : null })}
                    >
                      <option value="">Seçiniz</option>
                      {managers.map(mgr => (
                        <option key={mgr.id} value={mgr.id}>
                          {mgr.firstName} {mgr.lastName} - {mgr.department}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
