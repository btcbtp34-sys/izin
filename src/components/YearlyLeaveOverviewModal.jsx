import React, { useState, useMemo } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, X, ArrowRight, 
  Sparkles, Users, Clock, Check, BarChart3
} from 'lucide-react';
import { endOfMonth } from 'date-fns';
import { calculateLeaveDays, leaveStatuses, COLLAR_TYPES } from '../data/mockData';
import './YearlyLeaveOverviewModal.css';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

/**
 * Kullanıcının ilettiği 12 Kutucuklu Yıllık İzin Dağılım Modalı:
 * - Takvimdeki aylara göre toplam izin günlerini ve talep sayılarını gösterir.
 * - Her kutucukta ay adı ve büyük izin sayısı yer alır.
 * - Kutucuğa tıklandığında doğrudan o ayın takvimine giriş yapılır.
 */
export const YearlyLeaveOverviewModal = ({
  isOpen,
  onClose,
  currentDate,
  selectedYear,
  onYearChange,
  onSelectMonth,
  allRequests = [],
  employees = [],
  currentUser,
  selectedDepartment
}) => {
  if (!isOpen) return null;

  const [activeYear, setActiveYear] = useState(() => parseInt(selectedYear) || 2026);
  const [metricType, setMetricType] = useState('days'); // 'days' | 'requests'

  const handlePrevYear = () => {
    const newY = activeYear - 1;
    setActiveYear(newY);
    if (onYearChange) onYearChange(newY.toString());
  };

  const handleNextYear = () => {
    const newY = activeYear + 1;
    setActiveYear(newY);
    if (onYearChange) onYearChange(newY.toString());
  };

  // 12 Ayın İstatistiklerini Hesapla
  const monthsData = useMemo(() => {
    return MONTH_NAMES.map((name, monthIndex) => {
      const monthStart = new Date(activeYear, monthIndex, 1);
      const monthEnd = endOfMonth(monthStart);

      // Ay içindeki izin taleplerini filtrele
      const leavesInMonth = allRequests.filter(r => {
        if (selectedDepartment && r.department !== selectedDepartment) return false;
        if (currentUser?.isForeman) {
          const teamIds = employees.filter(e => e.foremanId === currentUser.id || e.id === currentUser.id).map(e => e.id);
          if (!teamIds.includes(Number(r.employeeId))) return false;
        } else if (currentUser?.collarType === COLLAR_TYPES.BLUE_COLLAR && !currentUser?.isManager) {
          if (Number(r.employeeId) !== Number(currentUser.id)) return false;
        }
        if (r.status === leaveStatuses.REJECTED || r.status === 'Reddedildi') return false;

        const rStart = new Date(r.startDate);
        const rEnd = new Date(r.endDate);
        return rStart <= monthEnd && rEnd >= monthStart;
      });

      // İzin günleri toplamı (Pazar günleri hariç iş günleri)
      let totalDays = 0;
      leavesInMonth.forEach(req => {
        const rStart = new Date(req.startDate);
        const rEnd = new Date(req.endDate);
        const oStart = rStart > monthStart ? rStart : monthStart;
        const oEnd = rEnd < monthEnd ? rEnd : monthEnd;
        totalDays += calculateLeaveDays(oStart, oEnd);
      });

      const requestCount = leavesInMonth.length;
      const uniqueEmployeeCount = new Set(leavesInMonth.map(r => r.employeeId)).size;
      const isCurrentActive = currentDate.getFullYear() === activeYear && currentDate.getMonth() === monthIndex;

      return {
        monthIndex,
        name,
        totalDays,
        requestCount,
        uniqueEmployeeCount,
        isCurrentActive
      };
    });
  }, [activeYear, allRequests, employees, currentUser, selectedDepartment, currentDate]);

  // Yıllık Genel Toplamlar
  const yearlyTotals = useMemo(() => {
    const totalDays = monthsData.reduce((acc, m) => acc + m.totalDays, 0);
    const totalRequests = monthsData.reduce((acc, m) => acc + m.requestCount, 0);
    const peakMonth = [...monthsData].sort((a, b) => b.totalDays - a.totalDays)[0];

    return { totalDays, totalRequests, peakMonth };
  }, [monthsData]);

  return (
    <div className="rule-modal-backdrop yearly-overview-backdrop" onClick={onClose}>
      <div 
        className="yearly-overview-modal-card animate-scale" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL BAŞLIĞI */}
        <div className="yearly-overview-header">
          <div className="header-left">
            <div className="header-icon-box">
              <Calendar size={22} />
            </div>
            <div>
              <div className="header-badge-pill">
                <Sparkles size={13} />
                <span>Yıllık İzin Genel Bakışı</span>
              </div>
              <h2 className="header-title">12 Aylık İzin Planı & Takvim Dağılımı</h2>
              <p className="header-subtitle">
                Aylara göre izin yoğunluğunu inceleyin, kutucuklara tıklayarak o ayın takvimine geçiş yapın.
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="btn-modal-close" 
            onClick={onClose}
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* YIL SEÇİCİ & METRİK ÇUBUĞU */}
        <div className="yearly-overview-toolbar">
          {/* Yıl Navigasyonu */}
          <div className="year-selector-group">
            <button 
              type="button" 
              className="btn-year-arrow" 
              onClick={handlePrevYear}
              title="Önceki Yıl"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="active-year-display">{activeYear} Yılı</span>
            <button 
              type="button" 
              className="btn-year-arrow" 
              onClick={handleNextYear}
              title="Sonraki Yıl"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Metrik Gösterim Tercihi */}
          <div className="metric-toggle-group">
            <button
              type="button"
              className={`metric-toggle-btn ${metricType === 'days' ? 'active' : ''}`}
              onClick={() => setMetricType('days')}
              title="Kutucuklarda toplam izin gün sayısını göster"
            >
              <Clock size={14} />
              <span>İzin Gün Sayısı (Gün)</span>
            </button>
            <button
              type="button"
              className={`metric-toggle-btn ${metricType === 'requests' ? 'active' : ''}`}
              onClick={() => setMetricType('requests')}
              title="Kutucuklarda talep sayısını göster"
            >
              <BarChart3 size={14} />
              <span>İzin Talebi (Adet)</span>
            </button>
          </div>

          {/* Özet İstatistik Çipleri */}
          <div className="yearly-stats-chips">
            <div className="stat-chip-pill chip-blue">
              <span className="stat-chip-label">Toplam İzin:</span>
              <strong className="stat-chip-val">{yearlyTotals.totalDays} Gün</strong>
            </div>
            <div className="stat-chip-pill chip-amber">
              <span className="stat-chip-label">Talep Sayısı:</span>
              <strong className="stat-chip-val">{yearlyTotals.totalRequests} Talep</strong>
            </div>
          </div>
        </div>

        {/* 12 KUTUCUKLU AYLIK GRID (KULLANICI ÇİZİMİ BİREBİR) */}
        <div className="yearly-months-grid">
          {monthsData.map((item) => {
            const displayValue = metricType === 'days' ? item.totalDays : item.requestCount;
            const hasLeaves = displayValue > 0;

            return (
              <div
                key={item.monthIndex}
                className={`month-box-card ${item.isCurrentActive ? 'card-current-active' : ''} ${hasLeaves ? 'card-has-leaves' : 'card-empty'}`}
                onClick={() => {
                  onSelectMonth(item.monthIndex, activeYear);
                  onClose();
                }}
                title={`${item.name} ${activeYear} takvimine girmek için tıklayın`}
              >
                {/* Ay Adı */}
                <div className="month-box-header">
                  <span className="month-name-text">{item.name}</span>
                  {item.isCurrentActive && (
                    <span className="badge-current-month" title="Şu an açık olan ay">
                      <Check size={11} /> Aktif Ay
                    </span>
                  )}
                </div>

                {/* Büyük Sayı (Kullanıcının Çizimindeki Merkezi Rakam) */}
                <div className="month-box-body">
                  <span className="month-big-number">{displayValue}</span>
                  <span className="month-number-unit">
                    {metricType === 'days' ? 'Gün İzin' : 'İzin Talebi'}
                  </span>
                </div>

                {/* Alt Bilgi & Tıklama Yönlendirmesi */}
                <div className="month-box-footer">
                  {hasLeaves ? (
                    <span className="month-detail-tag">
                      <Users size={12} /> {item.uniqueEmployeeCount} Çalışan ({metricType === 'days' ? `${item.requestCount} Talep` : `${item.totalDays} Gün`})
                    </span>
                  ) : (
                    <span className="month-empty-tag">Planlama Yok</span>
                  )}
                  <span className="month-go-action">
                    Takvime Git <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL ALTI BİLGİLENDİRME & BUTONLAR */}
        <div className="yearly-overview-footer">
          <div className="footer-hint-text">
            <span>💡 <strong>İpucu:</strong> Herhangi bir ay kutucuğuna tıkladığınızda sistem doğrudan o ayın detaylı personel gantt takvimine giriş yapar.</span>
          </div>
          <button 
            type="button" 
            className="btn btn-close-overview"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
