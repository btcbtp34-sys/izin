import React, { useState, useMemo } from 'react';
import {
  Clock, Check, X, Calendar, Download, RefreshCw, ChevronRight,
  Users, CheckCircle, XCircle, Coins, Search, Filter, AlertCircle,
  FileSpreadsheet, ArrowLeftRight, ChevronDown, CheckSquare, Square,
  Send, Eye
} from 'lucide-react';
import { departments } from '../data/mockData';
import { ApprovalConfirmModal, RejectionReasonModal } from '../components/ApprovalModals';
import './OvertimeApproval.css';

// Referans görseldeki 13 ana çalışan ve fazla mesai kayıtları
const INITIAL_OVERTIME_DATA = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    regNo: '100245',
    department: 'Bakım',
    date: '01.10.2026',
    entryTime: '08:02',
    exitTime: '20:15',
    normalHours: '08:00',
    overtimeHours: '4:15',
    overtimeMinutes: 255,
    status: 'Hak Kazandı', // Hak Kazandı | Kısmi Hak | Hak Kazanmadı
    approvalStatus: 'Bekliyor', // Bekliyor | Onaylandı | Reddedildi
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '45 dk'
  },
  {
    id: 2,
    name: 'Mehmet Kaya',
    regNo: '100246',
    department: 'Bakım',
    date: '01.10.2026',
    entryTime: '08:10',
    exitTime: '19:45',
    normalHours: '08:00',
    overtimeHours: '3:45',
    overtimeMinutes: 225,
    status: 'Hak Kazandı',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '45 dk'
  },
  {
    id: 3,
    name: 'Ayşe Demir',
    regNo: '100247',
    department: 'Bakım',
    date: '01.10.2026',
    entryTime: '07:55',
    exitTime: '18:50',
    normalHours: '08:00',
    overtimeHours: '2:50',
    overtimeMinutes: 170,
    status: 'Hak Kazandı',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '30 dk'
  },
  {
    id: 4,
    name: 'Fatma Çelik',
    regNo: '100248',
    department: 'Kaynak',
    date: '01.10.2026',
    entryTime: '08:20',
    exitTime: '20:10',
    normalHours: '08:00',
    overtimeHours: '4:10',
    overtimeMinutes: 250,
    status: 'Hak Kazandı',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '45 dk'
  },
  {
    id: 5,
    name: 'Caner Akın',
    regNo: '100249',
    department: 'Montaj',
    date: '01.10.2026',
    entryTime: '08:05',
    exitTime: '17:55',
    normalHours: '08:00',
    overtimeHours: '1:55',
    overtimeMinutes: 115,
    status: 'Kısmi Hak',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '30 dk'
  },
  {
    id: 6,
    name: 'Zeynep Yıldız',
    regNo: '100250',
    department: 'Montaj',
    date: '01.10.2026',
    entryTime: '08:15',
    exitTime: '18:45',
    normalHours: '08:00',
    overtimeHours: '2:45',
    overtimeMinutes: 165,
    status: 'Hak Kazandı',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '30 dk'
  },
  {
    id: 7,
    name: 'Hakan Arslan',
    regNo: '100251',
    department: 'Enstrümantasyon',
    date: '01.10.2026',
    entryTime: '08:00',
    exitTime: '19:30',
    normalHours: '08:00',
    overtimeHours: '3:30',
    overtimeMinutes: 210,
    status: 'Hak Kazandı',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '45 dk'
  },
  {
    id: 8,
    name: 'Fikri Can',
    regNo: '100252',
    department: 'Kalite',
    date: '01.10.2026',
    entryTime: '08:12',
    exitTime: '18:20',
    normalHours: '08:00',
    overtimeHours: '2:20',
    overtimeMinutes: 140,
    status: 'Hak Kazandı',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '30 dk'
  },
  {
    id: 9,
    name: 'Elif Demir',
    regNo: '100253',
    department: 'Bakım',
    date: '01.10.2026',
    entryTime: '08:06',
    exitTime: '16:45',
    normalHours: '08:00',
    overtimeHours: '0:45',
    overtimeMinutes: 45,
    status: 'Hak Kazanmadı',
    approvalStatus: 'Bekliyor',
    rateMultiplier: 'Asgari mesai altı',
    mealBreakDeduction: '0 dk'
  },
  {
    id: 10,
    name: 'Burak Şahin',
    regNo: '100254',
    department: 'Montaj',
    date: '01.10.2026',
    entryTime: '08:08',
    exitTime: '17:30',
    normalHours: '08:00',
    overtimeHours: '1:30',
    overtimeMinutes: 90,
    status: 'Kısmi Hak',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '30 dk'
  },
  {
    id: 11,
    name: 'Merve Özkan',
    regNo: '100255',
    department: 'Kaynak',
    date: '01.10.2026',
    entryTime: '08:14',
    exitTime: '18:55',
    normalHours: '08:00',
    overtimeHours: '2:55',
    overtimeMinutes: 175,
    status: 'Hak Kazandı',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '30 dk'
  },
  {
    id: 12,
    name: 'Salih Topal',
    regNo: '100256',
    department: 'Kalite',
    date: '01.10.2026',
    entryTime: '08:03',
    exitTime: '17:20',
    normalHours: '08:00',
    overtimeHours: '1:20',
    overtimeMinutes: 80,
    status: 'Kısmi Hak',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '30 dk'
  },
  {
    id: 13,
    name: 'Deniz Kılıç',
    regNo: '100257',
    department: 'Enstrümantasyon',
    date: '01.10.2026',
    entryTime: '08:11',
    exitTime: '17:55',
    normalHours: '08:00',
    overtimeHours: '1:55',
    overtimeMinutes: 115,
    status: 'Hak Kazandı',
    approvalStatus: 'Bekliyor',
    rateMultiplier: '%50 Hafta İçi',
    mealBreakDeduction: '30 dk'
  }
];

const OvertimeApproval = ({ currentUser }) => {
  const [data, setData] = useState(INITIAL_OVERTIME_DATA);
  const [selectedIds, setSelectedIds] = useState([1, 2, 3, 4, 5, 6, 7, 8]); // Varsayılan görseldeki gibi seçili kayıtlar
  const [selectedDepartment, setSelectedDepartment] = useState('Tümü');
  const [selectedStatus, setSelectedStatus] = useState('Tümü');
  const [selectedEmployee, setSelectedEmployee] = useState('Tümü');
  const [dateRange, setDateRange] = useState('01.10.2026 - 31.10.2026');
  const [detailItem, setDetailItem] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtrelenmiş liste
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (selectedDepartment !== 'Tümü' && item.department !== selectedDepartment) return false;
      if (selectedStatus !== 'Tümü' && item.status !== selectedStatus) return false;
      if (selectedEmployee !== 'Tümü' && item.name !== selectedEmployee) return false;
      return true;
    });
  }, [data, selectedDepartment, selectedStatus, selectedEmployee]);

  // Tümünü Seç / Temizle
  const handleSelectAll = () => {
    setSelectedIds(filteredData.map(d => d.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isAllSelected = filteredData.length > 0 && filteredData.every(d => selectedIds.includes(d.id));

  // Onaylama ve Reddetme Pop-up durumları
  const [itemsToApprove, setItemsToApprove] = useState(null); // array of row IDs
  const [itemsToReject, setItemsToReject] = useState(null);   // array of row IDs

  // Onaylama Pop-up Aç
  const handleOpenApproveModal = (ids) => {
    if (!ids || ids.length === 0) {
      alert('Lütfen işlem yapmak için en az bir çalışan seçin.');
      return;
    }
    setItemsToApprove(ids);
  };

  // Reddetme Pop-up Aç
  const handleOpenRejectModal = (ids) => {
    if (!ids || ids.length === 0) {
      alert('Lütfen işlem yapmak için en az bir çalışan seçin.');
      return;
    }
    setItemsToReject(ids);
  };

  // Üst Başlık Toplu İşlemleri
  const handleBatchApprove = () => {
    handleOpenApproveModal(selectedIds);
  };

  const handleBatchReject = () => {
    handleOpenRejectModal(selectedIds);
  };

  // Onaylama İşlemini Onay Notu ile Tamamla
  const handleConfirmApprove = (note) => {
    if (!itemsToApprove) return;
    setData(prev => prev.map(item => 
      itemsToApprove.includes(item.id) 
        ? { ...item, approvalStatus: 'Onaylandı', approvalNote: note || '' } 
        : item
    ));
    if (detailItem && itemsToApprove.includes(detailItem.id)) {
      setDetailItem(prev => ({ ...prev, approvalStatus: 'Onaylandı', approvalNote: note || '' }));
    }
    showToast(`${itemsToApprove.length} personelin fazla mesaisi onaylandı!`);
    setItemsToApprove(null);
  };

  // Reddetme İşlemini Gerekçe ile Tamamla
  const handleConfirmReject = (reason) => {
    if (!itemsToReject) return;
    setData(prev => prev.map(item => 
      itemsToReject.includes(item.id) 
        ? { ...item, approvalStatus: 'Reddedildi', rejectionReason: reason } 
        : item
    ));
    if (detailItem && itemsToReject.includes(detailItem.id)) {
      setDetailItem(prev => ({ ...prev, approvalStatus: 'Reddedildi', rejectionReason: reason }));
    }
    showToast(`${itemsToReject.length} personelin fazla mesaisi reddedildi.`, 'warning');
    setItemsToReject(null);
  };

  // Özet Bilgileri Oluştur
  const getApproveSummary = () => {
    if (!itemsToApprove) return [];
    if (itemsToApprove.length === 1) {
      const item = data.find(d => d.id === itemsToApprove[0]);
      if (!item) return [];
      return [
        { label: 'Personel', value: item.name },
        { label: 'Departman', value: item.department },
        { label: 'Tarih', value: item.date },
        { label: 'Fazla Mesai', value: `${item.overtimeHours} Saat (${item.rateMultiplier})` }
      ];
    }
    return [
      { label: 'Seçili Personel', value: `${itemsToApprove.length} Çalışan` },
      { label: 'İşlem', value: 'Toplu Mesai Onayı' }
    ];
  };

  const getRejectSummary = () => {
    if (!itemsToReject) return [];
    if (itemsToReject.length === 1) {
      const item = data.find(d => d.id === itemsToReject[0]);
      if (!item) return [];
      return [
        { label: 'Personel', value: item.name },
        { label: 'Departman', value: item.department },
        { label: 'Tarih', value: item.date },
        { label: 'Fazla Mesai', value: `${item.overtimeHours} Saat` }
      ];
    }
    return [
      { label: 'Seçili Personel', value: `${itemsToReject.length} Çalışan` },
      { label: 'İşlem', value: 'Toplu Mesai Reddi' }
    ];
  };

  // SAP'e Aktar
  const handleExportSAP = () => {
    if (selectedIds.length === 0) {
      alert('SAP sistemine aktarılacak çalışanları seçin.');
      return;
    }
    const selectedCount = selectedIds.length;
    showToast(`${selectedCount} çalışanın fazla mesai verileri SAP BAPI_HR_OVERTIME servisine aktarıldı!`);
  };

  // Rapor İndir
  const handleDownloadReport = () => {
    showToast('Fazla mesai onay raporu Excel (.xlsx) formatında indiriliyor...');
  };

  // Seçili çalışanların toplam mesai saati hesabı
  const selectedTotalHours = useMemo(() => {
    const selectedRows = data.filter(d => selectedIds.includes(d.id));
    const totalMinutes = selectedRows.reduce((acc, curr) => acc + curr.overtimeMinutes, 0);
    const hrs = Math.floor(totalMinutes / 60);
    return hrs;
  }, [data, selectedIds]);

  return (
    <div className="overtime-approval-page">
      {/* Toast Bildirimi */}
      {toast && (
        <div className={`overtime-toast ${toast.type}`}>
          <CheckCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. ÜST BAŞLIK VE KONTROL BARI */}
      <div className="overtime-top-header">
        <div className="header-title-box">
          <div className="hk-brand-monogram">HK</div>
          <h1 className="header-page-title">Fazla Mesai Onay Ekranı</h1>
        </div>
      </div>

      {/* 2. FİLTRELER VE EYLEM BUTONLARI BARI */}
      <div className="overtime-controls-card">
        <div className="filters-row">
          
          {/* Tarih Aralığı */}
          <div className="filter-input-wrapper">
            <label className="filter-label">Tarih Aralığı</label>
            <div className="filter-box-field">
              <Calendar size={16} className="filter-field-icon" />
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="clean-select"
              >
                <option value="01.10.2026 - 31.10.2026">01.10.2026 - 31.10.2026</option>
                <option value="01.09.2026 - 30.09.2026">01.09.2026 - 30.09.2026</option>
                <option value="01.11.2026 - 30.11.2026">01.11.2026 - 30.11.2026</option>
              </select>
              <ChevronDown size={14} className="filter-arrow" />
            </div>
          </div>

          {/* Departman */}
          <div className="filter-input-wrapper">
            <label className="filter-label">Departman</label>
            <div className="filter-box-field">
              <Filter size={16} className="filter-field-icon" />
              <select 
                value={selectedDepartment} 
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="clean-select"
              >
                <option value="Tümü">Tümü</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown size={14} className="filter-arrow" />
            </div>
          </div>

          {/* Çalışan */}
          <div className="filter-input-wrapper">
            <label className="filter-label">Çalışan</label>
            <div className="filter-box-field">
              <Users size={16} className="filter-field-icon" />
              <select 
                value={selectedEmployee} 
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="clean-select"
              >
                <option value="Tümü">Tümü</option>
                {Array.from(new Set(INITIAL_OVERTIME_DATA.map(d => d.name))).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="filter-arrow" />
            </div>
          </div>

          {/* Fazla Mesai Durumu */}
          <div className="filter-input-wrapper">
            <label className="filter-label">Fazla Mesai Durumu</label>
            <div className="filter-box-field">
              <Clock size={16} className="filter-field-icon" />
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="clean-select"
              >
                <option value="Tümü">Tümü</option>
                <option value="Hak Kazandı">Hak Kazandı</option>
                <option value="Kısmi Hak">Kısmi Hak</option>
                <option value="Hak Kazanmadı">Hak Kazanmadı</option>
              </select>
              <ChevronDown size={14} className="filter-arrow" />
            </div>
          </div>

          {/* Sağ Aksiyon Butonları */}
          <div className="header-actions-group">
            <button className="btn-action-outline-white" onClick={handleDownloadReport} title="Excel Raporu İndir">
              <Download size={15} />
              <span>Rapor Al</span>
            </button>

            <button className="btn-action-sap" onClick={handleExportSAP} title="Seçilenleri SAP'e Aktar">
              <ArrowLeftRight size={15} />
              <span>SAP'e Toplu Aktar</span>
            </button>

            <button className="btn-action-approve" onClick={handleBatchApprove} title="Seçilenleri Onayla">
              <Check size={16} />
              <span>Onayla</span>
            </button>

            <button className="btn-action-reject" onClick={handleBatchReject} title="Seçilenleri Reddet">
              <X size={16} />
              <span>Reddet</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. ÖZET İSTATİSTİK KARTLARI (6 KPI KARTI) */}
      <div className="overtime-metrics-grid">
        
        {/* Kart 1: Toplam Çalışan */}
        <div className="kpi-metric-card">
          <div className="kpi-icon-wrap icon-blue">
            <Users size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Toplam Çalışan</span>
            <strong className="kpi-number">158</strong>
          </div>
        </div>

        {/* Kart 2: Fazla Mesai Hak Kazanan */}
        <div className="kpi-metric-card">
          <div className="kpi-icon-wrap icon-green">
            <CheckCircle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Fazla Mesai Hak Kazanan</span>
            <div className="kpi-value-with-ratio">
              <strong className="kpi-number text-green">102</strong>
              <span className="kpi-ratio">(%64,6)</span>
            </div>
          </div>
        </div>

        {/* Kart 3: Kısmi Hak Kazanan */}
        <div className="kpi-metric-card">
          <div className="kpi-icon-wrap icon-orange">
            <Clock size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Kısmi Hak Kazanan</span>
            <div className="kpi-value-with-ratio">
              <strong className="kpi-number text-orange">18</strong>
              <span className="kpi-ratio">(%11,4)</span>
            </div>
          </div>
        </div>

        {/* Kart 4: Hak Kazanmayan */}
        <div className="kpi-metric-card">
          <div className="kpi-icon-wrap icon-red">
            <XCircle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Hak Kazanmayan</span>
            <div className="kpi-value-with-ratio">
              <strong className="kpi-number text-red">28</strong>
              <span className="kpi-ratio">(%17,7)</span>
            </div>
          </div>
        </div>

        {/* Kart 5: Toplam Fazla Mesai */}
        <div className="kpi-metric-card">
          <div className="kpi-icon-wrap icon-purple">
            <Clock size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Toplam Fazla Mesai (saat)</span>
            <strong className="kpi-number text-dark">1.248</strong>
          </div>
        </div>

        {/* Kart 6: Tahmini SAP Aktarım Tutarı */}
        <div className="kpi-metric-card">
          <div className="kpi-icon-wrap icon-coins">
            <Coins size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Tahmini SAP Aktarım Tutarı</span>
            <strong className="kpi-number text-dark">₺ 312.000</strong>
          </div>
        </div>

      </div>

      {/* 4. TABLO ÜSTÜ SEÇİM ARAÇ BARI */}
      <div className="selection-toolbar-card">
        <div className="selection-left-group">
          <label className="checkbox-custom-label">
            <input 
              type="checkbox" 
              checked={isAllSelected}
              onChange={(e) => e.target.checked ? handleSelectAll() : handleClearSelection()}
              className="ui-checkbox"
            />
            <span className="selection-count-text">
              {selectedIds.length} çalışan seçili
            </span>
          </label>
          <button className="link-action-btn" onClick={handleSelectAll}>Tümünü Seç</button>
          <span className="dot-divider">•</span>
          <button className="link-action-btn" onClick={handleClearSelection}>Seçimi Temizle</button>
        </div>

        {selectedIds.length > 0 && (
          <div className="selection-right-actions">
            <button 
              className="btn-toolbar-approve" 
              onClick={() => handleOpenApproveModal(selectedIds)}
            >
              <Check size={14} />
              <span>Seçilenleri Onayla ({selectedIds.length})</span>
            </button>
            <button 
              className="btn-toolbar-reject" 
              onClick={() => handleOpenRejectModal(selectedIds)}
            >
              <X size={14} />
              <span>Seçilenleri Reddet ({selectedIds.length})</span>
            </button>
            <button 
              className="btn-toolbar-sap" 
              onClick={handleExportSAP}
            >
              <Send size={13} />
              <span>SAP'e Aktar</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. FAZLA MESAİ ONAY TABLOSU */}
      <div className="overtime-table-card">
        <table className="overtime-data-table">
          <thead>
            <tr>
              <th className="col-chk">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={(e) => e.target.checked ? handleSelectAll() : handleClearSelection()}
                  className="ui-checkbox"
                />
              </th>
              <th>Ad Soyad</th>
              <th>Sicil No</th>
              <th>Departman</th>
              <th>Tarih</th>
              <th>PDKS Giriş</th>
              <th>PDKS Çıkış</th>
              <th>Normal Çalışma</th>
              <th>Fazla Mesai</th>
              <th>Durum</th>
              <th>Onay Durumu</th>
              <th style={{ textAlign: 'right', paddingRight: '16px' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => {
              const isSelected = selectedIds.includes(row.id);

              return (
                <tr 
                  key={row.id} 
                  className={`overtime-table-row ${isSelected ? 'row-selected' : ''}`}
                  onClick={() => handleToggleRow(row.id)}
                >
                  <td className="col-chk" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleToggleRow(row.id)}
                      className="ui-checkbox"
                    />
                  </td>
                  <td className="cell-bold-name">{row.name}</td>
                  <td className="cell-regno">{row.regNo}</td>
                  <td className="cell-dept">{row.department}</td>
                  <td className="cell-date">{row.date}</td>
                  <td className="cell-time">{row.entryTime}</td>
                  <td className="cell-time">{row.exitTime}</td>
                  <td className="cell-normal-time">{row.normalHours}</td>
                  <td className="cell-bold-overtime">{row.overtimeHours}</td>
                  
                  {/* Durum Rozeti */}
                  <td>
                    <span className={`status-pill ${
                      row.status === 'Hak Kazandı' ? 'pill-green' :
                      row.status === 'Kısmi Hak' ? 'pill-orange' : 'pill-red'
                    }`}>
                      {row.status}
                    </span>
                  </td>

                  {/* Onay Durumu ve Varsa Red Gerekçesi İpucu */}
                  <td>
                    <div className="overtime-status-column">
                      <span className={`approval-pill ${
                        row.approvalStatus === 'Onaylandı' ? 'approved' :
                        row.approvalStatus === 'Reddedildi' ? 'rejected' : 'pending'
                      }`}>
                        {row.approvalStatus}
                      </span>
                      {row.rejectionReason && (
                        <div className="rejection-reason-chip" title={row.rejectionReason}>
                          <AlertCircle size={11} />
                          <span>Gerekçe belirtildi</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Hızlı İşlemler */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="overtime-row-actions">
                      {row.approvalStatus === 'Bekliyor' && (
                        <>
                          <button 
                            className="btn-row-action approve"
                            onClick={() => handleOpenApproveModal([row.id])}
                            title="Onayla (Onay Pop-up'ı)"
                          >
                            <Check size={14} />
                            <span>Onayla</span>
                          </button>
                          <button 
                            className="btn-row-action reject"
                            onClick={() => handleOpenRejectModal([row.id])}
                            title="Reddet (Açıklama alanı)"
                          >
                            <X size={14} />
                            <span>Reddet</span>
                          </button>
                        </>
                      )}

                      <button 
                        className="row-action-arrow" 
                        title="Detayları İncele"
                        onClick={() => setDetailItem(row)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. PDKS & FAZLA MESAİ DETAY MODALI */}
      {detailItem && (
        <div className="overtime-modal-overlay" onClick={() => setDetailItem(null)}>
          <div className="overtime-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="overtime-modal-header">
              <div className="header-left-col">
                <div className="modal-avatar-badge">
                  {detailItem.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="modal-emp-title">{detailItem.name}</h3>
                  <p className="modal-emp-sub">{detailItem.department} • Sicil No: {detailItem.regNo}</p>
                </div>
              </div>
              <button className="modal-close-cross" onClick={() => setDetailItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="overtime-modal-body">
              {/* Red Gerekçesi Varsa Uyarısı */}
              {detailItem.rejectionReason && (
                <div className="detail-rejection-callout">
                  <AlertCircle size={18} className="text-red-500" />
                  <div>
                    <strong className="callout-label">Reddedilme Gerekçesi / Açıklama:</strong>
                    <p className="callout-msg">{detailItem.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Onay Notu Varsa */}
              {detailItem.approvalNote && (
                <div className="detail-approval-callout">
                  <CheckCircle size={18} className="text-green-500" />
                  <div>
                    <strong className="callout-label">Yönetici Onay Notu:</strong>
                    <p className="callout-msg">{detailItem.approvalNote}</p>
                  </div>
                </div>
              )}

              <div className="pdks-logs-card">
                <h4 className="card-section-title">PDKS Günlük Hareket Detayı</h4>
                <div className="pdks-times-grid">
                  <div className="time-metric-box">
                    <span className="time-lbl">Giriş Zamanı</span>
                    <strong className="time-val green">{detailItem.entryTime}</strong>
                  </div>
                  <div className="time-metric-box">
                    <span className="time-lbl">Çıkış Zamanı</span>
                    <strong className="time-val blue">{detailItem.exitTime}</strong>
                  </div>
                  <div className="time-metric-box">
                    <span className="time-lbl">Normal Çalışma</span>
                    <strong className="time-val">{detailItem.normalHours}</strong>
                  </div>
                  <div className="time-metric-box">
                    <span className="time-lbl">Fazla Mesai</span>
                    <strong className="time-val bold-purple">{detailItem.overtimeHours} saat</strong>
                  </div>
                </div>
              </div>

              <div className="pdks-calculation-specs">
                <div className="spec-row">
                  <span>Mola ve Yemek Düşümü:</span>
                  <strong>{detailItem.mealBreakDeduction}</strong>
                </div>
                <div className="spec-row">
                  <span>Mesai Katsayısı:</span>
                  <strong>{detailItem.rateMultiplier}</strong>
                </div>
                <div className="spec-row">
                  <span>Durum:</span>
                  <span className={`status-pill ${
                    detailItem.status === 'Hak Kazandı' ? 'pill-green' :
                    detailItem.status === 'Kısmi Hak' ? 'pill-orange' : 'pill-red'
                  }`}>{detailItem.status}</span>
                </div>
                <div className="spec-row">
                  <span>Onay Durumu:</span>
                  <strong style={{ 
                    color: detailItem.approvalStatus === 'Onaylandı' ? '#10b981' : 
                           detailItem.approvalStatus === 'Reddedildi' ? '#ef4444' : '#f59e0b' 
                  }}>
                    {detailItem.approvalStatus}
                  </strong>
                </div>
              </div>
            </div>

            <div className="overtime-modal-footer">
              <button 
                className="btn-modal-action-reject"
                onClick={() => handleOpenRejectModal([detailItem.id])}
              >
                <X size={15} /> Reddet
              </button>
              
              <button 
                className="btn-modal-action-approve"
                onClick={() => handleOpenApproveModal([detailItem.id])}
              >
                <Check size={15} /> Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. FAZLA MESAİ ONAYLAMA POP-UP'I */}
      <ApprovalConfirmModal
        isOpen={Boolean(itemsToApprove)}
        onClose={() => setItemsToApprove(null)}
        onConfirm={handleConfirmApprove}
        title={itemsToApprove?.length > 1 ? "Toplu Fazla Mesai Onayı" : "Fazla Mesai Talebini Onayla"}
        subtitle="Mesai kayıtlarını onaylayıp SAP bordro aktarım listesine hazırlamak üzeresiniz."
        summaryItems={getApproveSummary()}
        confirmButtonText="Onayla ve SAP'e Hazırla"
      />

      {/* 8. FAZLA MESAİ REDDETME / AÇIKLAMA POP-UP'I */}
      <RejectionReasonModal
        isOpen={Boolean(itemsToReject)}
        onClose={() => setItemsToReject(null)}
        onConfirm={handleConfirmReject}
        title={itemsToReject?.length > 1 ? "Toplu Fazla Mesai Talebini Reddet" : "Fazla Mesai Talebini Reddet"}
        subtitle="Seçili personelin fazla mesai kaydını gerekçe belirterek reddedebilirsiniz."
        summaryItems={getRejectSummary()}
        confirmButtonText="Reddet ve Bildir"
        isOvertime={true}
      />

    </div>
  );
};

export default OvertimeApproval;
