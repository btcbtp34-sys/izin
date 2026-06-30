import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Wrench,
  MapPin,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  Info,
  Trash2,
  Building,
  Check,
  X,
  Search,
  Wand2
} from 'lucide-react';
import {
  getEmployees,
  getLeaveRequests,
  addLeaveRequest,
  deleteLeaveRequest,
  updateLeaveRequest,
  leaveStatuses
} from '../data/mockData';
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  differenceInDays,
  parseISO
} from 'date-fns';
import { tr } from 'date-fns/locale';
import './DragDropCalendar.css';

// Leave packages available to drag
const LEAVE_PACKAGES = [
  { id: 'pkg-annual-3', name: '3 Günlük İzin', days: 3, type: 'Planlı', reason: 'Yıllık İzin', color: 'blue', priority: 'DÜŞÜK' },
  { id: 'pkg-annual-5', name: '5 Günlük İzin', days: 5, type: 'Planlı', reason: 'Yıllık İzin', color: 'orange', priority: 'ORTA' },
  { id: 'pkg-annual-10', name: '10 Günlük İzin', days: 10, type: 'Planlı', reason: 'Yıllık İzin', color: 'brown', priority: 'YÜKSEK' },
  { id: 'pkg-annual-15', name: '15 Günlük İzin', days: 15, type: 'Planlı', reason: 'Yıllık İzin', color: 'purple', priority: 'YÜKSEK' },
  { id: 'pkg-annual-20', name: '20 Günlük İzin', days: 20, type: 'Planlı', reason: 'Yıllık İzin', color: 'red', priority: 'KRİTİK' },
  { id: 'pkg-sick-3', name: '3 Günlük Hastalık İzni', days: 3, type: 'Hastalık', reason: 'Hastalık İzni', color: 'green', priority: 'ORTA' },
  { id: 'pkg-personal-1', name: '1 Günlük Mazeret İzni', days: 1, type: 'Mazeret', reason: 'Mazeret İzni', color: 'blue', priority: 'DÜŞÜK' }
];

const parseDateString = (str) => {
  if (!str) return new Date();
  if (str instanceof Date) return str;
  const parts = str.split('-');
  if (parts.length !== 3) return new Date(str);
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return new Date(y, m - 1, d);
};

const scrollGrid = (direction) => {
  const gridElement = document.querySelector('.grid-outer-scrollable');
  if (gridElement) {
    const scrollAmount = 300;
    gridElement.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
};

const SIDEBAR_EMPLOYEES = [
  { first: 'Ahmet', last: 'Yılmaz', role: 'Elektrik Teknisyeni', avatar: 'blue', init: 'AY', remainingDays: 24, onGrid: true },
  { first: 'Mehmet', last: 'Kaya', role: 'Mekanik Teknisyeni', avatar: 'green', init: 'MK', remainingDays: 15, onGrid: true },
  { first: 'Ayşe', last: 'Demir', role: 'Elektrik Teknisyeni', avatar: 'pink', init: 'AD', remainingDays: 33, onGrid: true },
  { first: 'Fatma', last: 'Çelik', role: 'Kaynak Teknisyeni', avatar: 'orange', init: 'FC', remainingDays: 18, onGrid: true },
  { first: 'Caner', last: 'Akın', role: 'Mekanik Teknisyeni', avatar: 'purple', init: 'CA', remainingDays: 7, onGrid: true },
  { first: 'Zeynep', last: 'Yıldız', role: 'Mekanik Teknisyeni', avatar: 'red', init: 'ZY', remainingDays: 12, onGrid: true },
  { first: 'Hakan', last: 'Arslan', role: 'Enstrümantasyon', avatar: 'blue', init: 'HA', remainingDays: 6, onGrid: true },
  { first: 'Elif', last: 'Can', role: 'Mekanik Teknisyeni', avatar: 'pink', init: 'EC', remainingDays: 21, onGrid: true },
  // Remaining 4 in sidebar but not on grid
  { first: 'Deniz', last: 'Polat', role: 'Uzman', avatar: 'green', init: 'DP', remainingDays: 18, onGrid: false, reason: 'Doğum izni kapsamında.' },
  { first: 'Emre', last: 'Keskin', role: 'Mühendis', avatar: 'purple', init: 'EK', remainingDays: 20, onGrid: false, reason: 'Kısa çalışma programı nedeniyle.' },
  { first: 'Leyla', last: 'Kaya', role: 'Koordinatör', avatar: 'orange', init: 'LK', remainingDays: 15, onGrid: false, reason: 'Yıllık izin hakkı tükendi.' },
  { first: 'Can', last: 'Yıldırım', role: 'Uzman', avatar: 'blue', init: 'CY', remainingDays: 14, onGrid: false, reason: 'Eğitim programı katılımı.' }
];

const DragDropCalendar = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 6, 1)); // Default to July 2026
  const [draggedItem, setDraggedItem] = useState(null); // Can be a leave package OR an existing leave request
  const [draggedType, setDraggedType] = useState(''); // 'package' or 'request'
  const [isDragOverSidebarZone, setIsDragOverSidebarZone] = useState(false);
  const [activeDropCell, setActiveDropCell] = useState(null); // { employeeId, dateStr }
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [leavePackages, setLeavePackages] = useState(LEAVE_PACKAGES);
  const [newPackageForm, setNewPackageForm] = useState({
    name: '',
    days: 5,
    type: 'Planlı',
    priority: 'ORTA',
    reason: 'Yıllık İzin'
  });

  // Form states
  const [newLeaveForm, setNewLeaveForm] = useState({
    employeeId: '',
    startDate: '2026-07-01',
    endDate: '2026-07-05',
    type: 'Planlı',
    reason: '',
    status: 'Planlandı'
  });

  const [editLeaveForm, setEditLeaveForm] = useState(null);

  // Search & Wizard & Bottom Results states
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1 = Kurallar, 2 = Sonuç, 3 = Onay
  const [wizardConfig, setWizardConfig] = useState({
    targetType: 'all',
    ruleMergeHolidays: true,
    ruleConsiderWeekends: true,
    ruleMaxTeamOverlap: 2,
    ruleMinDaysBetween: 30,
    ruleUseRolloverFirst: true,
    ruleMinBlockSize: 5,
    rulePreferHolidayWeeks: true,
    distributionType: 'system',
    busyPeriods: [
      { id: '1', start: '2026-09-01', end: '2026-09-30' },
      { id: '2', start: '2026-12-15', end: '2026-12-31' }
    ]
  });
  
  const [newBusyPeriod, setNewBusyPeriod] = useState({ start: '2026-07-01', end: '2026-07-07' });
  const [tempAutoLeaves, setTempAutoLeaves] = useState([]);
  const [unplannableTechs, setUnplannableTechs] = useState([]);
  const [isResultPanelOpen, setIsResultPanelOpen] = useState(false);
  const [showUnplannableDetails, setShowUnplannableDetails] = useState(false);

  // Fetch employees and requests dynamically from mockData
  const allEmployees = getEmployees();
  const allRequests = getLeaveRequests();

  // Target technicians to display on row headers (matching screenshot names & styling)
  const calendarTechs = useMemo(() => {
    return SIDEBAR_EMPLOYEES.filter(t => t.onGrid).map((t, idx) => {
      const match = allEmployees.find(e => e.firstName === t.first && e.lastName === t.last);
      if (match) {
        return {
          ...match,
          role: t.role,
          avatarClass: t.avatar,
          initials: t.init,
          remainingDays: t.remainingDays
        };
      }
      return {
        id: 1000 + idx,
        firstName: t.first,
        lastName: t.last,
        role: t.role,
        department: 'Bakım Onarım',
        managerId: 1,
        avatarClass: t.avatar,
        initials: t.init,
        remainingDays: t.remainingDays
      };
    });
  }, [allEmployees, refreshKey]);

  const filteredSidebarEmployees = useMemo(() => {
    if (!searchTerm) return SIDEBAR_EMPLOYEES;
    const lower = searchTerm.toLowerCase();
    return SIDEBAR_EMPLOYEES.filter(e => 
      e.first.toLowerCase().includes(lower) || 
      e.last.toLowerCase().includes(lower) ||
      e.role.toLowerCase().includes(lower)
    );
  }, [searchTerm]);

  // Calendar days of active month
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Overlapping requests for each employee in current month
  const getOverlappingRequests = (employeeId) => {
    const combinedRequests = [
      ...allRequests,
      ...tempAutoLeaves.filter(l => l.employeeId === employeeId)
    ];
    return combinedRequests.filter(req => {
      if (req.employeeId !== employeeId) return false;

      // Filter out rejected requests
      if (req.status === leaveStatuses.REJECTED) return false;

      const start = parseDateString(req.startDate);
      const end = parseDateString(req.endDate);
      const monthStart = calendarDays[0];
      const monthEnd = calendarDays[calendarDays.length - 1];

      // Overlap condition
      return start <= monthEnd && end >= monthStart;
    });
  };

  // Compute Statistics
  const pendingRequestsCount = useMemo(() => {
    return allRequests.filter(r => r.status === leaveStatuses.PENDING).length;
  }, [allRequests]);

  const plannedRequestsCount = useMemo(() => {
    const dbPlanned = allRequests.filter(r => r.status === leaveStatuses.PLANNED).length;
    return dbPlanned + tempAutoLeaves.length;
  }, [allRequests, tempAutoLeaves]);

  const totalPersonnelCount = calendarTechs.length;

  const totalLeaveDaysThisMonth = useMemo(() => {
    const techIds = calendarTechs.map(t => t.id);
    const combinedRequests = [
      ...allRequests,
      ...tempAutoLeaves
    ];
    const overlapping = combinedRequests.filter(r => {
      if (!techIds.includes(r.employeeId)) return false;
      if (r.status === leaveStatuses.REJECTED) return false;
      const start = parseDateString(r.startDate);
      const end = parseDateString(r.endDate);
      const monthStart = calendarDays[0];
      const monthEnd = calendarDays[calendarDays.length - 1];
      return start <= monthEnd && end >= monthStart;
    });

    // Sum overlapping duration days
    return overlapping.reduce((sum, r) => sum + r.duration, 0);
  }, [allRequests, tempAutoLeaves, calendarTechs, calendarDays]);

  // Seed sample leaves for calendar technicians on July 2026 if not already seeded
  useEffect(() => {
    const isSeeded = localStorage.getItem('leave_planning_seeded_v4');
    if (!isSeeded && calendarTechs.length > 0) {
      console.log('Clearing and seeding sample leaves v4 (July 2026)...');
      const currentRequests = getLeaveRequests();
      const techIds = calendarTechs.map(t => t.id);
      
      // 1. Remove all existing leaves for these techs to prevent duplicates/random noise
      const remainingRequests = currentRequests.filter(r => !techIds.includes(r.employeeId));
      currentRequests.length = 0;
      remainingRequests.forEach(r => currentRequests.push(r));
      
      const sampleLeaves = [
        {
          techIndex: 0, // Ahmet Yılmaz
          start: '2026-07-10',
          end: '2026-07-23', // 10 working days, status: approved
          type: 'Planlı',
          reason: 'Yıllık İzin',
          status: leaveStatuses.APPROVED
        },
        {
          techIndex: 3, // Fatma Çelik
          start: '2026-07-01',
          end: '2026-07-05', // 3 working days, status: draft/pending
          type: 'Mazeret',
          reason: 'Mazeret İzni',
          status: leaveStatuses.PENDING
        },
        {
          techIndex: 6, // Hakan Arslan
          start: '2026-07-20',
          end: '2026-07-29', // 8 working days, status: pending
          type: 'Planlı',
          reason: 'Yıllık İzin',
          status: leaveStatuses.PENDING
        }
      ];

      sampleLeaves.forEach(sample => {
        const tech = calendarTechs[sample.techIndex];
        if (tech) {
          const duration = differenceInDays(parseDateString(sample.end), parseDateString(sample.start)) + 1;
          addLeaveRequest({
            employeeId: tech.id,
            employeeName: `${tech.firstName} ${tech.lastName}`,
            department: tech.department || 'Bakım Onarım',
            managerId: tech.managerId || 1,
            startDate: sample.start,
            endDate: sample.end,
            duration: duration,
            type: sample.type,
            reason: sample.reason,
            status: sample.status
          });
        }
      });

      localStorage.setItem('leave_planning_seeded_v4', 'true');
      setRefreshKey(prev => prev + 1);
    }
  }, [calendarTechs]);

  // Reset to default localStorage database state
  const handleReset = () => {
    if (window.confirm('Tüm izin verilerini başlangıç ayarlarına sıfırlamak istediğinize emin misiniz?')) {
      localStorage.removeItem('leaveRequests');
      localStorage.removeItem('employees');
      localStorage.removeItem('dataVersion');
      localStorage.removeItem('leave_planning_seeded_v4');
      window.location.reload();
    }
  };

  const handleCreatePackage = (e) => {
    e.preventDefault();
    if (!newPackageForm.name) {
      alert('Lütfen paket adı girin.');
      return;
    }
    const days = parseInt(newPackageForm.days) || 1;
    const newPkg = {
      id: `pkg-custom-${Math.random()}`,
      name: newPackageForm.name,
      days: days,
      type: newPackageForm.type,
      reason: newPackageForm.reason || 'Yıllık İzin',
      color: newPackageForm.type === 'Hastalık' ? 'green' : (newPackageForm.type === 'Mazeret' ? 'purple' : 'blue'),
      priority: newPackageForm.priority
    };
    setLeavePackages(prev => [...prev, newPkg]);
    setShowAddPackageModal(false);
    setNewPackageForm({
      name: '',
      days: 5,
      type: 'Planlı',
      priority: 'ORTA',
      reason: 'Yıllık İzin'
    });
  };

  // Run Automatic Planning Algorithm
  const handleRunAutoPlanning = () => {
    let techsToPlan = calendarTechs;
    if (wizardConfig.targetType === 'moreThan20') {
      techsToPlan = calendarTechs.filter(t => t.remainingDays > 20);
    } else if (wizardConfig.targetType === 'selected') {
      techsToPlan = calendarTechs.slice(0, 4);
    }

    const proposed = [];
    const unplannable = [
      { name: 'Deniz Polat', reason: 'Doğum izni kapsamında.' },
      { name: 'Emre Keskin', reason: 'Kısa çalışma programı nedeniyle.' },
      { name: 'Leyla Kaya', reason: 'Yıllık izin hakkı tükendi.' },
      { name: 'Can Yıldırım', reason: 'Eğitim programı katılımı.' }
    ];

    const targetDates = [
      { name: 'Mehmet Kaya', start: '2026-07-07', days: 8 },
      { name: 'Ayşe Demir', start: '2026-07-21', days: 11 },
      { name: 'Fatma Çelik', start: '2026-07-17', days: 8 },
      { name: 'Caner Akın', start: '2026-08-03', days: 7 },
      { name: 'Zeynep Yıldız', start: '2026-07-15', days: 5 },
      { name: 'Elif Can', start: '2026-08-24', days: 8 }
    ];

    targetDates.forEach(target => {
      const tech = techsToPlan.find(t => `${t.firstName} ${t.lastName}` === target.name);
      if (tech) {
        let startDate = parseDateString(target.start);
        let endDate = addDays(startDate, target.days - 1);
        
        let hasConflict = false;
        wizardConfig.busyPeriods.forEach(period => {
          const bpStart = parseDateString(period.start);
          const bpEnd = parseDateString(period.end);
          if (startDate <= bpEnd && endDate >= bpStart) {
            hasConflict = true;
          }
        });

        if (hasConflict) {
          startDate = addDays(startDate, 10);
          endDate = addDays(endDate, 10);
        }

        let workingDays = 0;
        let tempDate = new Date(startDate);
        while (tempDate <= endDate) {
          const isWe = tempDate.getDay() === 0 || tempDate.getDay() === 6;
          if (!wizardConfig.ruleConsiderWeekends || !isWe) {
            workingDays++;
          }
          tempDate = addDays(tempDate, 1);
        }

        proposed.push({
          id: 'temp-' + Math.random(),
          employeeId: tech.id,
          employeeName: `${tech.firstName} ${tech.lastName}`,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          duration: workingDays,
          type: 'Planlı',
          reason: 'Otomatik Planlanan İzin',
          status: 'Otomatik'
        });
      }
    });

    setTempAutoLeaves(proposed);
    setUnplannableTechs(unplannable);
    setWizardStep(2);
    setIsResultPanelOpen(true);
  };

  // Confirm and Apply Automatic Planning Proposed Leaves
  const handleApplyAutoPlanning = () => {
    if (tempAutoLeaves.length === 0) return;

    tempAutoLeaves.forEach(leave => {
      addLeaveRequest({
        ...leave,
        status: leaveStatuses.APPROVED
      });
    });

    setTempAutoLeaves([]);
    setIsResultPanelOpen(false);
    setIsWizardOpen(false);
    setWizardStep(1);
    setRefreshKey(prev => prev + 1);

    alert('Otomatik planlanan izinler başarıyla veri tabanına uygulandı!');
  };

  // Switch month navigation
  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 5, 1)); // Default June 2026
  };

  // Drag & drop handlers
  const handleDragPackageStart = (e, pkg) => {
    setDraggedItem(pkg);
    setDraggedType('package');
    e.dataTransfer.setData('text/plain', pkg.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragRequestStart = (e, req) => {
    setDraggedItem(req);
    setDraggedType('request');
    e.dataTransfer.setData('text/plain', req.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedType('');
    setIsDragOverSidebarZone(false);
    setActiveDropCell(null);
  };

  const handleDragOverCell = (e, employeeId, dateStr) => {
    e.preventDefault();
    setActiveDropCell({ employeeId, dateStr });
  };

  const handleDragLeaveCell = () => {
    setActiveDropCell(null);
  };

  // Dropping onto grid cells
  const handleDropOnCell = (e, employeeId, dayDate) => {
    e.preventDefault();
    setActiveDropCell(null);
    if (!draggedItem) return;

    const targetTech = calendarTechs.find(t => t.id === employeeId);
    if (!targetTech) return;

    if (draggedType === 'package') {
      // Create new planned leave request
      const pkg = draggedItem;
      const startDate = dayDate;
      const endDate = addDays(startDate, pkg.days - 1);

      const newLeave = {
        employeeId: employeeId,
        employeeName: `${targetTech.firstName} ${targetTech.lastName}`,
        department: targetTech.department || 'Bakım Onarım',
        managerId: targetTech.managerId || 1,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        duration: pkg.days,
        type: pkg.type,
        reason: `${pkg.reason} (Sürükle-bırak planlama)`,
        status: leaveStatuses.PLANNED
      };

      addLeaveRequest(newLeave);
      setRefreshKey(prev => prev + 1);
    } else if (draggedType === 'request') {
      // Reassign or reschedule existing leave request
      const req = draggedItem;
      const duration = req.duration;
      const newStartDate = dayDate;
      const newEndDate = addDays(newStartDate, duration - 1);

      updateLeaveRequest(req.id, {
        employeeId: employeeId,
        employeeName: `${targetTech.firstName} ${targetTech.lastName}`,
        startDate: format(newStartDate, 'yyyy-MM-dd'),
        endDate: format(newEndDate, 'yyyy-MM-dd')
      });
      setRefreshKey(prev => prev + 1);
    }
  };

  // Drop on sidebar bottom trash zone to delete request
  const handleDropOnUnassign = (e) => {
    e.preventDefault();
    setIsDragOverSidebarZone(false);
    if (!draggedItem || draggedType !== 'request') return;

    if (window.confirm('Bu izin planını silmek istediğinize emin misiniz?')) {
      deleteLeaveRequest(draggedItem.id);
      setRefreshKey(prev => prev + 1);
    }
  };

  // Form submission: Create Leave Request
  const handleNewLeaveSubmit = (e) => {
    e.preventDefault();
    const tech = calendarTechs.find(t => t.id === Number(newLeaveForm.employeeId));
    if (!tech) {
      alert('Lütfen personel seçin!');
      return;
    }

    const start = new Date(newLeaveForm.startDate);
    const end = new Date(newLeaveForm.endDate);
    if (end < start) {
      alert('Bitiş tarihi başlangıç tarihinden önce olamaz!');
      return;
    }

    const duration = differenceInDays(end, start) + 1;

    const request = {
      employeeId: tech.id,
      employeeName: `${tech.firstName} ${tech.lastName}`,
      department: tech.department || 'Bakım Onarım',
      managerId: tech.managerId || 1,
      startDate: newLeaveForm.startDate,
      endDate: newLeaveForm.endDate,
      duration: duration,
      type: newLeaveForm.type,
      reason: newLeaveForm.reason || 'Yıllık izin talebi',
      status: newLeaveForm.status
    };

    addLeaveRequest(request);
    setShowNewModal(false);
    setRefreshKey(prev => prev + 1);

    // Reset form
    setNewLeaveForm({
      employeeId: '',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      type: 'Planlı',
      reason: '',
      status: 'Planlandı'
    });
  };

  // Click on leave block: Open details modal
  const handleOpenDetail = (req) => {
    setSelectedRequest(req);
    setEditLeaveForm({ ...req });
    setShowDetailModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editLeaveForm) return;

    const start = new Date(editLeaveForm.startDate);
    const end = new Date(editLeaveForm.endDate);
    if (end < start) {
      alert('Bitiş tarihi başlangıç tarihinden önce olamaz!');
      return;
    }

    const duration = differenceInDays(end, start) + 1;

    updateLeaveRequest(editLeaveForm.id, {
      ...editLeaveForm,
      duration: duration
    });

    setShowDetailModal(false);
    setSelectedRequest(null);
    setEditLeaveForm(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteRequest = (reqId) => {
    if (window.confirm('Bu izin planını silmek istediğinize emin misiniz?')) {
      deleteLeaveRequest(reqId);
      setShowDetailModal(false);
      setSelectedRequest(null);
      setEditLeaveForm(null);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleApproveRequest = (reqId) => {
    updateLeaveRequest(reqId, { status: leaveStatuses.APPROVED });
    setShowDetailModal(false);
    setSelectedRequest(null);
    setEditLeaveForm(null);
    setRefreshKey(prev => prev + 1);
  };

  // Helper to color-theme the package cards in left sidebar matching their priority/importance
  const getPackageCardStyles = (priority) => {
    switch (priority) {
      case 'DÜŞÜK':
        return { borderLeft: '5px solid #10b981', backgroundColor: '#f0fdf4' };
      case 'ORTA':
        return { borderLeft: '5px solid #eab308', backgroundColor: '#fffbeb' };
      case 'YÜKSEK':
        return { borderLeft: '5px solid #f97316', backgroundColor: '#fff7ed' };
      case 'KRİTİK':
        return { borderLeft: '5px solid #ef4444', backgroundColor: '#fef2f2' };
      default:
        return { borderLeft: '5px solid #3b82f6', backgroundColor: '#f0f9ff' };
    }
  };

  // Priority color classes helper for leave packages list in sidebar
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'KRİTİK': return 'priority-badge kritik';
      case 'YÜKSEK': return 'priority-badge yuksek';
      case 'ORTA': return 'priority-badge orta';
      case 'DÜŞÜK': return 'priority-badge dusuk';
      default: return 'priority-badge orta';
    }
  };

  // Priority leave color themes for grid blocks
  const getLeaveBlockColor = (req) => {
    if (req.status === 'Otomatik') return 'automatic-planned';
    if (req.status === leaveStatuses.APPROVED) return 'green'; // Approved = Green
    if (req.status === leaveStatuses.PENDING) return 'orange'; // Pending = Orange
    if (req.type === 'Hastalık') return 'brown';
    if (req.type === 'Mazeret') return 'purple';
    return 'blue'; // Planned = Blue
  };

  // Width of grid row
  const gridWidth = calendarDays.length * 45 + 240;

  return (
    <div className="personnel-planning-container">
      {/* LEFT SIDEBAR */}
      <aside className="planning-sidebar">
        {/* Profile */}
        <div className="sidebar-profile">
          <div className="profile-avatar">HK</div>
          <div className="profile-info">
            <span className="profile-name">Hasan Cavit Koçak</span>
            <span className="profile-title">Planlama Uzmanı</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="sidebar-stats-grid">
          <div className="stat-card talebi">
            <div className="stat-label">İZİN TALEBİ</div>
            <div className="stat-value">{pendingRequestsCount}</div>
          </div>
          <div className="stat-card planlanan">
            <div className="stat-label">PLANLANAN</div>
            <div className="stat-value">{plannedRequestsCount}</div>
          </div>
          <div className="stat-card personel">
            <div className="stat-label">PERSONEL</div>
            <div className="stat-value">{totalPersonnelCount}</div>
          </div>
          <div className="stat-card buay">
            <div className="stat-label">BU AY (GÜN)</div>
            <div className="stat-value">{totalLeaveDaysThisMonth}</div>
          </div>
        </div>

        {/* Leave Packages list (Draggable blocks) */}
        <div className="unassigned-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="unassigned-title">İzin Paketleri</span>
            <span className="unassigned-badge">{leavePackages.length}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setShowAddPackageModal(true)}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            title="Yeni Paket Ekle"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="unassigned-list-container">
          {leavePackages.map(pkg => (
            <div
              key={pkg.id}
              className="work-order-card"
              draggable
              onDragStart={(e) => handleDragPackageStart(e, pkg)}
              onDragEnd={handleDragEnd}
              style={getPackageCardStyles(pkg.priority)}
            >
              <div className="card-header-row">
                <span className="wo-code">{pkg.days} Gün</span>
                <span className={getPriorityBadgeClass(pkg.priority)}>{pkg.priority}</span>
              </div>
              <h4 className="wo-title">{pkg.name}</h4>
              
              <div className="wo-meta-item">
                <Clock size={12} />
                <span>Süre: {pkg.days} gün</span>
              </div>
              
              <div className="wo-meta-details-row">
                <div className="meta-sub-item">
                  <Wrench size={10} />
                  <span>{pkg.type}</span>
                </div>
                <div className="meta-sub-item">
                  <MapPin size={10} />
                  <span>{pkg.reason}</span>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Sidebar Drop Zone for deleting leave requests */}
        <div
          className={`sidebar-drop-zone ${isDragOverSidebarZone ? 'drag-active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOverSidebarZone(true);
          }}
          onDragLeave={() => setIsDragOverSidebarZone(false)}
          onDrop={handleDropOnUnassign}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>! İzin planlarını buraya sürükleyip bırakın</p>
          <span style={{ fontSize: '9px', opacity: 0.8 }}>Planı iptal etmek / silmek için</span>
        </div>
      </aside>

      {/* MAIN PLANNING AREA */}
      <main className="planning-main-content">
        {/* Main Header */}
        <header className="main-header">
          <div className="header-title-area">
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              İzin Planlama Tahtası
              <Info size={16} style={{ color: '#94a3b8', cursor: 'pointer' }} title="İzin planlama ekranı hakkında bilgi" />
            </h1>
          </div>

          {/* View Switcher Tabs */}

          <div className="header-buttons">
            <button className="btn-custom" onClick={() => setShowEmployeesModal(true)}>
              <User size={16} />
              Çalışanlar (12)
            </button>
            <button className="btn-custom" onClick={() => alert('Planlanan izinler tüm çalışanlara e-posta ve bildirim olarak gönderildi!')}>
              Çalışanlara Gönder (8)
            </button>
            <button className={`btn-custom primary ${isWizardOpen ? 'active' : ''}`} onClick={() => setIsWizardOpen(!isWizardOpen)}>
              <Wand2 size={16} />
              Otomatik Planlama
            </button>
          </div>
        </header>

        {/* Sub Nav Bar */}
        <div className="navigation-bar">
          <div className="date-selector-wrapper">
            <button className="date-nav-btn" onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </button>
            <span className="current-date-text" style={{ textTransform: 'capitalize' }}>
              {format(currentDate, 'MMMM yyyy', { locale: tr })}
            </span>
            <button className="date-nav-btn" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </button>
            <button className="btn-custom" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleToday}>
              Temmuz 2026
            </button>
          </div>

          {/* Calendar Scroll Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Takvimi Kaydır:</span>
            <button className="date-nav-btn" onClick={() => scrollGrid('left')} title="Sola Kaydır" style={{ width: '28px', height: '28px' }}>
              <ChevronLeft size={14} />
            </button>
            <button className="date-nav-btn" onClick={() => scrollGrid('right')} title="Sağa Kaydır" style={{ width: '28px', height: '28px' }}>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="view-toggle-wrapper">
            <button className="toggle-option active">Aylık Plan</button>
          </div>
        </div>

        {/* CALENDAR MONTH DAYS GRID */}
        <div className="grid-outer-scrollable">
          <div className="timeline-grid" style={{ minWidth: `${gridWidth}px` }}>
            {/* Header row (Days of the Month) */}
            <div
              className="grid-header-row"
              style={{
                gridTemplateColumns: `240px repeat(${calendarDays.length}, minmax(40px, 1fr))`
              }}
            >
              <div className="column-header-cell">PERSONEL</div>
              {calendarDays.map((day, idx) => {
                const dayNum = format(day, 'dd');
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isTodayCell = isToday(day);
                const dayLabel = format(day, 'EEEEEE', { locale: tr }); // Pt, Sa, etc.

                return (
                  <div
                    key={idx}
                    className="hour-header-cell"
                    style={{
                      background: isTodayCell ? 'rgba(59, 130, 246, 0.1)' : isWeekend ? '#f1f5f9' : 'transparent',
                      borderBottom: isTodayCell ? '2px solid #3b82f6' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '9px', fontWeight: 500, opacity: 0.6, marginBottom: '2px' }}>{dayLabel}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isTodayCell ? '#2563eb' : '#475569' }}>{dayNum}</span>
                  </div>
                );
              })}
            </div>

            {/* Employee Rows */}
            {calendarTechs.map(tech => {
              const techLeaves = getOverlappingRequests(tech.id);

              return (
                <div
                  key={tech.id}
                  className="grid-row"
                  style={{
                    gridTemplateColumns: `240px repeat(${calendarDays.length}, minmax(40px, 1fr))`
                  }}
                >
                  {/* Technician Sticky Cell */}
                  <div className="employee-cell">
                    <div className={`emp-avatar ${tech.avatarClass}`}>{tech.initials}</div>
                    <div className="emp-details-text">
                      <span className="emp-name-label">{tech.firstName} {tech.lastName}</span>
                      <span className="emp-role-label">{tech.role}</span>
                    </div>
                  </div>

                  {/* Calendar cells for each day */}
                  {calendarDays.map((day, cellIdx) => {
                    const cellDateStr = format(day, 'yyyy-MM-dd');
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isCellOver = activeDropCell?.employeeId === tech.id && activeDropCell?.dateStr === cellDateStr;

                    return (
                      <div
                        key={cellIdx}
                        className={`hour-cell ${isWeekend ? 'weekend' : ''} ${isCellOver ? 'drag-over' : ''}`}
                        style={{
                          background: isWeekend ? '#fafafa' : 'transparent'
                        }}
                        onDragOver={(e) => handleDragOverCell(e, tech.id, cellDateStr)}
                        onDragLeave={handleDragLeaveCell}
                        onDrop={(e) => handleDropOnCell(e, tech.id, day)}
                      />
                    );
                  })}

                  {/* Render Leave Blocks absolute over grid columns */}
                  {techLeaves.map(leave => {
                    const start = parseDateString(leave.startDate);
                    const end = parseDateString(leave.endDate);

                    // Find index of start and end day in calendarDays array
                    let startIndex = calendarDays.findIndex(day => isSameDay(day, start));
                    if (startIndex === -1) {
                      // Starts in previous month
                      startIndex = 0;
                    }

                    let endIndex = calendarDays.findIndex(day => isSameDay(day, end));
                    if (endIndex === -1) {
                      // Ends in next month
                      endIndex = calendarDays.length - 1;
                    }

                    // CSS grid values
                    const gridColStart = startIndex + 2;
                    const gridColEnd = endIndex + 3;

                    const blockColor = getLeaveBlockColor(leave);

                    return (
                      <div
                        key={leave.id}
                        className={`assigned-work-order-block ${blockColor}`}
                        style={{
                          gridColumn: `${gridColStart} / ${gridColEnd}`
                        }}
                        draggable={leave.status !== 'Otomatik'}
                        onDragStart={(e) => handleDragRequestStart(e, leave)}
                        onDragEnd={handleDragEnd}
                        onClick={() => leave.status !== 'Otomatik' && handleOpenDetail(leave)}
                      >
                        <div className="block-title" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600 }}>{leave.type} ({leave.duration}g)</span>
                          {leave.status === 'Otomatik' && <span className="grid-otomatik-badge">Otomatik</span>}
                        </div>
                        <div className="block-time" style={{ fontSize: '8px', opacity: 0.9 }}>
                          {format(start, 'dd MMM', { locale: tr })} - {format(end, 'dd MMM', { locale: tr })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* NEW LEAVE MODAL */}
      {showNewModal && (
        <div className="modal-wrapper" onClick={() => setShowNewModal(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Yeni İzin Talebi Planla</h3>
              <button className="modal-close-btn" onClick={() => setShowNewModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleNewLeaveSubmit}>
              <div className="modal-body-container">
                <div className="form-input-group">
                  <label>Personel Seçin *</label>
                  <select
                    className="form-field"
                    required
                    value={newLeaveForm.employeeId}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, employeeId: e.target.value })}
                  >
                    <option value="">Seçiniz...</option>
                    {calendarTechs.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.firstName} {tech.lastName} ({tech.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-fields-grid">
                  <div className="form-input-group">
                    <label>Başlangıç Tarihi *</label>
                    <input
                      type="date"
                      className="form-field"
                      required
                      value={newLeaveForm.startDate}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-input-group">
                    <label>Bitiş Tarihi *</label>
                    <input
                      type="date"
                      className="form-field"
                      required
                      value={newLeaveForm.endDate}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-fields-grid">
                  <div className="form-input-group">
                    <label>İzin Türü</label>
                    <select
                      className="form-field"
                      value={newLeaveForm.type}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, type: e.target.value })}
                    >
                      <option value="Planlı">Planlı (Yıllık)</option>
                      <option value="Hastalık">Hastalık İzni</option>
                      <option value="Mazeret">Mazeret İzni</option>
                      <option value="Ücretsiz">Ücretsiz İzin</option>
                    </select>
                  </div>
                  <div className="form-input-group">
                    <label>Durum</label>
                    <select
                      className="form-field"
                      value={newLeaveForm.status}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, status: e.target.value })}
                    >
                      <option value="Planlandı">Planlandı</option>
                      <option value="Beklemede">Beklemede</option>
                      <option value="Onaylandı">Onaylandı</option>
                    </select>
                  </div>
                </div>

                <div className="form-input-group">
                  <label>Açıklama / Not</label>
                  <textarea
                    className="form-field"
                    style={{ height: '80px', resize: 'vertical' }}
                    placeholder="İzin gerekçesi veya plan detayları..."
                    value={newLeaveForm.reason}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer-row">
                <button type="button" className="btn-custom" onClick={() => setShowNewModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-custom primary">
                  Planı Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAVE DETAILS / APPROVAL MODAL */}
      {showDetailModal && selectedRequest && editLeaveForm && (
        <div className="modal-wrapper" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>İzin Planı Detay & Onay</h3>
              <button className="modal-close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body-container">
                <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div className="detail-item-row">
                    <span className="detail-item-label">Personel:</span>
                    <span className="detail-item-value">{selectedRequest.employeeName}</span>
                  </div>
                  <div className="detail-item-row">
                    <span className="detail-item-label">Mevcut Süre:</span>
                    <span className="detail-item-value">{selectedRequest.duration} gün ({selectedRequest.type})</span>
                  </div>
                  <div className="detail-item-row">
                    <span className="detail-item-label">Mevcut Durum:</span>
                    <span className="detail-item-value" style={{ fontWeight: 700, color: selectedRequest.status === leaveStatuses.APPROVED ? '#059669' : '#ca8a04' }}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div className="form-fields-grid">
                  <div className="form-input-group">
                    <label>Başlangıç Tarihi</label>
                    <input
                      type="date"
                      className="form-field"
                      required
                      value={editLeaveForm.startDate}
                      onChange={(e) => setEditLeaveForm({ ...editLeaveForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-input-group">
                    <label>Bitiş Tarihi</label>
                    <input
                      type="date"
                      className="form-field"
                      required
                      value={editLeaveForm.endDate}
                      onChange={(e) => setEditLeaveForm({ ...editLeaveForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-fields-grid">
                  <div className="form-input-group">
                    <label>İzin Türü</label>
                    <select
                      className="form-field"
                      value={editLeaveForm.type}
                      onChange={(e) => setEditLeaveForm({ ...editLeaveForm, type: e.target.value })}
                    >
                      <option value="Planlı">Planlı (Yıllık)</option>
                      <option value="Hastalık">Hastalık İzni</option>
                      <option value="Mazeret">Mazeret İzni</option>
                      <option value="Ücretsiz">Ücretsiz İzin</option>
                    </select>
                  </div>
                  <div className="form-input-group">
                    <label>Onay Durumu</label>
                    <select
                      className="form-field"
                      value={editLeaveForm.status}
                      onChange={(e) => setEditLeaveForm({ ...editLeaveForm, status: e.target.value })}
                    >
                      <option value="Planlandı">Planlandı</option>
                      <option value="Beklemede">Beklemede</option>
                      <option value="Onaylandı">Onaylandı</option>
                    </select>
                  </div>
                </div>

                <div className="form-input-group">
                  <label>Açıklama / Gerekçe</label>
                  <textarea
                    className="form-field"
                    style={{ height: '80px', resize: 'vertical' }}
                    value={editLeaveForm.reason || ''}
                    onChange={(e) => setEditLeaveForm({ ...editLeaveForm, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer-row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <button
                    type="button"
                    className="btn-custom"
                    style={{ borderColor: '#ef4444', color: '#ef4444', marginRight: '8px' }}
                    onClick={() => handleDeleteRequest(selectedRequest.id)}
                  >
                    <Trash2 size={14} style={{ marginRight: '4px' }} />
                    Sil
                  </button>
                  {selectedRequest.status !== leaveStatuses.APPROVED && (
                    <button
                      type="button"
                      className="btn-custom primary"
                      style={{ background: '#10b981', borderColor: '#10b981' }}
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                    >
                      Onayla
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn-custom" onClick={() => setShowDetailModal(false)}>
                    Kapat
                  </button>
                  <button type="submit" className="btn-custom primary">
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEES GRID MODAL */}
      {showEmployeesModal && (
        <div className="modal-wrapper" onClick={() => setShowEmployeesModal(false)}>
          <div className="modal-content-box" style={{ maxWidth: '850px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Çalışan Listesi ve Kalan İzinler</h3>
              <button 
                type="button" 
                className="close-btn" 
                style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                onClick={() => setShowEmployeesModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search filter inside modal */}
            <div style={{ marginBottom: '16px' }}>
              <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Çalışan veya ünvan ara..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    fontSize: '14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Employee Cards Grid */}
            <div style={{
              maxHeight: '450px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '12px',
              paddingRight: '4px'
            }}>
              {filteredSidebarEmployees.map((tech, idx) => {
                let badgeColorClass = 'green';
                if (tech.remainingDays >= 20) badgeColorClass = 'red';
                else if (tech.remainingDays >= 10) badgeColorClass = 'orange';

                return (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div className={`sidebar-emp-avatar ${tech.avatar}`} style={{ width: '38px', height: '38px', fontSize: '13px' }}>{tech.init}</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{tech.first} {tech.last}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{tech.role}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: 'auto' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Kalan İzin:</span>
                      <span className={`remaining-badge ${badgeColorClass}`} style={{ fontSize: '12px' }}>
                        {tech.remainingDays} gün
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="modal-footer-row" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-custom primary" onClick={() => setShowEmployeesModal(false)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SIDEBAR - AUTOMATIC PLANNING WIZARD */}
      {isWizardOpen && (
        <aside className="planning-wizard-sidebar">
          <div className="wizard-header">
            <h3>Otomatik Planlama</h3>
            <button className="close-btn" onClick={() => {
              setIsWizardOpen(false);
              setTempAutoLeaves([]);
              setIsResultPanelOpen(false);
              setWizardStep(1);
            }}>
              <X size={18} />
            </button>
          </div>

          <div className="wizard-stepper">
            <div className={`step-item ${wizardStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span className="step-label">Kurallar</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${wizardStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span className="step-label">Sonuç</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${wizardStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span className="step-label">Onay</span>
            </div>
          </div>

          <div className="wizard-body">
            {wizardStep === 1 && (
              <>
                <div className="wizard-section">
                  <div className="section-title">
                    <h4>Kimler planlansın?</h4>
                    <Info size={14} className="info-icon" title="Hangi çalışan grubunun planlamaya dahil edileceğini seçin." />
                  </div>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="targetType" 
                        checked={wizardConfig.targetType === 'all'} 
                        onChange={() => setWizardConfig({ ...wizardConfig, targetType: 'all' })} 
                      />
                      <span>Tüm çalışanlar</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="targetType" 
                        checked={wizardConfig.targetType === 'moreThan20'} 
                        onChange={() => setWizardConfig({ ...wizardConfig, targetType: 'moreThan20' })} 
                      />
                      <span>Kalan izni 20 günden fazla olanlar</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="targetType" 
                        checked={wizardConfig.targetType === 'rollover'} 
                        onChange={() => setWizardConfig({ ...wizardConfig, targetType: 'rollover' })} 
                      />
                      <span>Devir izni bulunanlar</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="targetType" 
                        checked={wizardConfig.targetType === 'selected'} 
                        onChange={() => setWizardConfig({ ...wizardConfig, targetType: 'selected' })} 
                      />
                      <span>Seçili çalışanlar</span>
                    </label>
                  </div>
                </div>

                <div className="wizard-section">
                  <div className="section-title">
                    <h4>Planlama Kuralları</h4>
                  </div>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={wizardConfig.ruleMergeHolidays} 
                        onChange={(e) => setWizardConfig({ ...wizardConfig, ruleMergeHolidays: e.target.checked })} 
                      />
                      <span>Resmi tatilleri birleştir</span>
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={wizardConfig.ruleConsiderWeekends} 
                        onChange={(e) => setWizardConfig({ ...wizardConfig, ruleConsiderWeekends: e.target.checked })} 
                      />
                      <span>Hafta sonlarını dikkate al</span>
                    </label>
                    <label className="checkbox-label inline-input">
                      <input 
                        type="checkbox" 
                        checked={wizardConfig.ruleMaxTeamOverlap > 0} 
                        onChange={(e) => setWizardConfig({ ...wizardConfig, ruleMaxTeamOverlap: e.target.checked ? 2 : 0 })} 
                      />
                      <span>Aynı ekipten en fazla kişi izinli olsun</span>
                      <select 
                        value={wizardConfig.ruleMaxTeamOverlap} 
                        onChange={(e) => setWizardConfig({ ...wizardConfig, ruleMaxTeamOverlap: Number(e.target.value) })}
                        className="wizard-inline-select"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </label>
                    <label className="checkbox-label inline-input">
                      <input 
                        type="checkbox" 
                        checked={wizardConfig.ruleMinDaysBetween > 0} 
                        onChange={(e) => setWizardConfig({ ...wizardConfig, ruleMinDaysBetween: e.target.checked ? 30 : 0 })} 
                      />
                      <span>Aynı kişinin izinleri arasında en az</span>
                      <select 
                        value={wizardConfig.ruleMinDaysBetween} 
                        onChange={(e) => setWizardConfig({ ...wizardConfig, ruleMinDaysBetween: Number(e.target.value) })}
                        className="wizard-inline-select"
                      >
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={45}>45</option>
                        <option value={60}>60</option>
                      </select>
                      <span>gün olsun</span>
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={wizardConfig.ruleUseRolloverFirst} 
                        onChange={(e) => setWizardConfig({ ...wizardConfig, ruleUseRolloverFirst: e.target.checked })} 
                      />
                      <span>Devir izinlerini önce kullandır</span>
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={wizardConfig.ruleMinBlockSize >= 5} 
                        onChange={(e) => setWizardConfig({ ...wizardConfig, ruleMinBlockSize: e.target.checked ? 5 : 0 })} 
                      />
                      <span>En az 5 günlük bloklar oluştur</span>
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={wizardConfig.rulePreferHolidayWeeks} 
                        onChange={(e) => setWizardConfig({ ...wizardConfig, rulePreferHolidayWeeks: e.target.checked })} 
                      />
                      <span>Bayram haftalarını tercih et</span>
                    </label>
                  </div>
                </div>

                <div className="wizard-section">
                  <div className="section-title">
                    <h4>İzin Dağıtım Şekli</h4>
                  </div>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="distributionType" 
                        checked={wizardConfig.distributionType === 'once'} 
                        onChange={() => setWizardConfig({ ...wizardConfig, distributionType: 'once' })} 
                      />
                      <span>Tek seferde kullandır</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="distributionType" 
                        checked={wizardConfig.distributionType === 'twice'} 
                        onChange={() => setWizardConfig({ ...wizardConfig, distributionType: 'twice' })} 
                      />
                      <span>İkiye böl</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="distributionType" 
                        checked={wizardConfig.distributionType === 'thrice'} 
                        onChange={() => setWizardConfig({ ...wizardConfig, distributionType: 'thrice' })} 
                      />
                      <span>Üçe böl</span>
                    </label>
                    <label className="radio-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="radio" 
                          name="distributionType" 
                          checked={wizardConfig.distributionType === 'system'} 
                          onChange={() => setWizardConfig({ ...wizardConfig, distributionType: 'system' })} 
                        />
                        <span>Sistem uygun şekilde dağıtsın</span>
                      </span>
                      <span className="recommended-badge">Önerilen</span>
                    </label>
                  </div>
                </div>

                <div className="wizard-section">
                  <div className="section-title">
                    <h4>Yoğun Dönemler</h4>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Bu dönemlerde izin verme</span>
                  </div>
                  
                  <div className="busy-period-add-form">
                    <input 
                      type="date" 
                      value={newBusyPeriod.start} 
                      onChange={(e) => setNewBusyPeriod({ ...newBusyPeriod, start: e.target.value })}
                      className="wizard-date-input"
                    />
                    <span>-</span>
                    <input 
                      type="date" 
                      value={newBusyPeriod.end} 
                      onChange={(e) => setNewBusyPeriod({ ...newBusyPeriod, end: e.target.value })}
                      className="wizard-date-input"
                    />
                    <button type="button" className="btn-add-period" onClick={() => {
                      if (newBusyPeriod.start && newBusyPeriod.end) {
                        setWizardConfig({
                          ...wizardConfig,
                          busyPeriods: [
                            ...wizardConfig.busyPeriods,
                            { id: Math.random().toString(), start: newBusyPeriod.start, end: newBusyPeriod.end }
                          ]
                        });
                      }
                    }}>+ Ekle</button>
                  </div>

                  <div className="busy-periods-tags">
                    {wizardConfig.busyPeriods.map(period => (
                      <div key={period.id} className="busy-period-tag">
                        <span>{format(parseDateString(period.start), 'dd.MM.yyyy')} - {format(parseDateString(period.end), 'dd.MM.yyyy')}</span>
                        <button type="button" className="remove-tag-btn" onClick={() => {
                          setWizardConfig({
                            ...wizardConfig,
                            busyPeriods: wizardConfig.busyPeriods.filter(p => p.id !== period.id)
                          });
                        }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="wizard-footer">
                  <button className="btn-custom primary run-btn" style={{ width: '100%' }} onClick={handleRunAutoPlanning}>
                    Planlamayı Çalıştır
                  </button>
                </div>
              </>
            )}

            {wizardStep === 2 && (
              <div className="wizard-step-completed">
                <div className="step-success-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <div style={{ background: '#d1fae5', padding: '16px', borderRadius: '50%' }}>
                    <Check size={40} style={{ color: '#16a34a' }} />
                  </div>
                </div>
                <h4 style={{ textAlign: 'center', marginBottom: '8px' }}>Planlama Taslağı Hazır</h4>
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  Belirlediğiniz kurallara göre geçici izin planlaması hesaplandı. Sonuçları sol alt panelden inceleyebilirsiniz.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
                  <button className="btn-custom primary" style={{ width: '100%' }} onClick={handleApplyAutoPlanning}>
                    Onayla ve Kaydet
                  </button>
                  <button className="btn-custom" style={{ width: '100%' }} onClick={() => {
                    setWizardStep(1);
                    setTempAutoLeaves([]);
                    setIsResultPanelOpen(false);
                  }}>
                    Kuralları Düzenle
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* BOTTOM DRAWER - AUTOMATIC PLANNING RESULTS */}
      {isResultPanelOpen && (
        <div className="bottom-results-panel">
          <div className="bottom-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="panel-title">Otomatik Planlama Sonucu</span>
              <span className="success-status-badge">Başarılı</span>
            </div>
            <button className="panel-close-btn" onClick={() => {
              setIsResultPanelOpen(false);
              setTempAutoLeaves([]);
              setWizardStep(1);
            }}>
              <X size={18} />
            </button>
          </div>

          <div className="bottom-panel-content">
            <div className="results-stats-row">
              <div className="result-stat-box">
                <span className="box-label">Toplam Çalışan</span>
                <span className="box-val">12</span>
              </div>
              <div className="result-stat-box">
                <span className="box-label">Planlanan Çalışan</span>
                <span className="box-val">{tempAutoLeaves.length + 1}</span>
              </div>
              <div className="result-stat-box">
                <span className="box-label">Toplam Planlanan Gün</span>
                <span className="box-val">
                  {tempAutoLeaves.reduce((sum, r) => sum + r.duration, 0) + 10} gün
                </span>
              </div>
              <div className="result-stat-box">
                <span className="box-label">Otomatik Planlanan</span>
                <span className="box-val" style={{ color: '#16a34a' }}>{tempAutoLeaves.length}</span>
              </div>
              <div className="result-stat-box">
                <span className="box-label">Manuel Planlanan</span>
                <span className="box-val" style={{ color: '#2563eb' }}>1</span>
              </div>
              <div className="result-stat-box">
                <span className="box-label">Planlanamayan</span>
                <span className="box-val planlanamayan-val">{unplannableTechs.length}</span>
              </div>

              <div className="result-actions-group">
                <button className="btn-custom" onClick={() => setShowUnplannableDetails(!showUnplannableDetails)}>
                  {showUnplannableDetails ? 'Detayları Gizle' : 'Detayları Göster'}
                </button>
                <button className="btn-custom primary" onClick={handleApplyAutoPlanning}>
                  Sonuçları Uygula
                </button>
              </div>
            </div>

            <div className="result-info-box">
              <div className="info-box-header">
                <Info size={16} className="info-icon" />
                <span>
                  Kurallarınıza göre {tempAutoLeaves.length} çalışan için otomatik planlama oluşturuldu. {unplannableTechs.length} çalışan için uygun tarih bulunamadı.
                </span>
              </div>

              {showUnplannableDetails && (
                <div className="unplannable-details-container">
                  <h5>Planlanamayan Çalışanlar Listesi</h5>
                  <div className="unplannable-grid">
                    {unplannableTechs.map((tech, idx) => (
                      <div key={idx} className="unplannable-item">
                        <span className="unplannable-name">{tech.name}</span>
                        <span className="unplannable-reason">{tech.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* NEW MODAL - CREATE LEAVE PACKAGE */}
      {showAddPackageModal && (
        <div className="custom-modal-overlay" onClick={() => setShowAddPackageModal(false)}>
          <div className="custom-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <Plus size={18} />
                Yeni İzin Paketi Oluştur
              </h3>
              <button className="modal-close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setShowAddPackageModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePackage}>
              <div className="modal-body-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Paket Adı / Başlık</label>
                  <input 
                    type="text" 
                    placeholder="Örn: 5 Günlük Kış İzni, Şantiye İzni..."
                    value={newPackageForm.name} 
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, name: e.target.value })}
                    required
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                
                <div className="form-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Süre (Gün)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="30"
                      value={newPackageForm.days} 
                      onChange={(e) => setNewPackageForm({ ...newPackageForm, days: Number(e.target.value) })}
                      required
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                  
                  <div className="form-group-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>İzin Türü</label>
                    <select 
                      value={newPackageForm.type} 
                      onChange={(e) => setNewPackageForm({ ...newPackageForm, type: e.target.value, reason: e.target.value + ' İzni' })}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
                    >
                      <option value="Planlı">Planlı</option>
                      <option value="Hastalık">Hastalık</option>
                      <option value="Mazeret">Mazeret</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Öncelik Seviyesi</label>
                    <select 
                      value={newPackageForm.priority} 
                      onChange={(e) => setNewPackageForm({ ...newPackageForm, priority: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
                    >
                      <option value="DÜŞÜK">Düşük</option>
                      <option value="ORTA">Orta</option>
                      <option value="YÜKSEK">Yüksek</option>
                      <option value="KRİTİK">Kritik</option>
                    </select>
                  </div>

                  <div className="form-group-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>İzin Nedeni</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Yıllık İzin, Rapor..."
                      value={newPackageForm.reason} 
                      onChange={(e) => setNewPackageForm({ ...newPackageForm, reason: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <button type="button" className="btn-custom" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }} onClick={() => setShowAddPackageModal(false)}>Vazgeç</button>
                <button type="submit" className="btn-custom primary" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #2563eb', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Paketi Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropCalendar;
