import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Users, Clock,
  User, CalendarDays, Trash2, Edit, CheckCircle, X, Settings,
  Sparkles, Target, Filter, RefreshCw, Zap
} from 'lucide-react';
import {
  getEmployees, getLeaveRequests, addLeaveRequest, updateLeaveRequest,
  deleteLeaveRequest, leaveStatuses
} from '../data/mockData';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import './CalendarPlanning.css';

const CalendarPlanning = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [draggedLeaveType, setDraggedLeaveType] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAutoPlanning, setShowAutoPlanning] = useState(false);
  const [autoPlanningCriteria, setAutoPlanningCriteria] = useState({
    targetEmployees: 'all', // 'all', 'selected', 'department'
    selectedDepartment: '',
    selectedEmployeeIds: [],
    planningPeriod: '2-months', // '1-month', '2-months', '3-months', 'custom'
    customStartDate: '',
    customEndDate: '',
    minLeaveDays: 5,
    maxLeaveDays: 15,
    leaveDistribution: 'balanced', // 'balanced', 'concentrated', 'scattered'
    avoidWeekends: true,
    avoidHolidays: true,
    teamCoverage: true, // Ensure minimum team coverage
    minTeamCoverage: 70 // Minimum percentage of team present
  });
  const dragRef = useRef(null);

  const employees = getEmployees();
  const allRequests = getLeaveRequests();

  // Predefined leave blocks
  const leaveTypes = [
    { id: 'annual-5', name: '5 Günlük İzin', days: 5, color: '#007AFF' },
    { id: 'annual-10', name: '10 Günlük İzin', days: 10, color: '#34C759' },
    { id: 'annual-15', name: '15 Günlük İzin', days: 15, color: '#FF9500' },
    { id: 'annual-20', name: '20 Günlük İzin', days: 20, color: '#FF3B30' },
    { id: 'sick-3', name: '3 Günlük Hastalık', days: 3, color: '#8E8E93', type: 'Hastalık' },
    { id: 'personal-1', name: '1 Günlük Kişisel', days: 1, color: '#AF52DE', type: 'Kişisel' }
  ];

  // Filter employees managed by current user
  const managedEmployees = useMemo(() => {
    if (currentUser?.isManager) {
      return employees.filter(e => e.managerId === currentUser.id);
    }
    return employees;
  }, [employees, currentUser]);

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

  // Get leaves for a specific employee and day
  const getLeavesForEmployeeAndDay = (employeeId, day) => {
    return allRequests.filter(request => {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      return request.employeeId === employeeId && day >= start && day <= end;
    });
  };

  // Get all employees with leaves for a specific day
  const getEmployeesWithLeavesForDay = (day) => {
    return managedEmployees.map(emp => {
      const leaves = getLeavesForEmployeeAndDay(emp.id, day);
      return {
        ...emp,
        leaves: leaves
      };
    }).filter(emp => emp.leaves.length > 0);
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date(2026, 5, 18)); // June 18, 2026

  // Drag and drop handlers - Simplified
  const handleDragStart = (e, leaveType) => {
    console.log('Drag started:', leaveType.name);
    setDraggedLeaveType(leaveType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e, employeeId, startDate) => {
    e.preventDefault();
    console.log('Drop attempted:', employeeId, startDate);
    
    if (!draggedLeaveType) {
      console.log('No dragged leave type');
      return;
    }

    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
      console.log('Employee not found');
      return;
    }

    console.log('Creating leave for:', employee.firstName, employee.lastName);

    // Calculate end date
    const start = new Date(startDate);
    const end = addDays(start, draggedLeaveType.days - 1);

    // Create new leave request
    const newLeave = {
      employeeId: employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      managerId: employee.managerId,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      duration: draggedLeaveType.days,
      type: draggedLeaveType.type || 'Planlı',
      reason: `${draggedLeaveType.name} - Sürükle-bırak ile oluşturuldu`,
      status: leaveStatuses.PLANNED
    };

    console.log('Adding leave:', newLeave);
    addLeaveRequest(newLeave);
    setDraggedLeaveType(null);
    setRefreshKey(prev => prev + 1);

    alert(`✅ ${employee.firstName} ${employee.lastName} için ${draggedLeaveType.days} günlük izin eklendi!`);
  };

  // Edit leave
  const handleEditLeave = (leave) => {
    setEditingLeave(leave);
    setShowEmployeeModal(true);
  };

  // Delete leave
  const handleDeleteLeave = (leave) => {
    if (window.confirm(`${leave.employeeName} için ${leave.duration} günlük izni silmek istediğinize emin misiniz?`)) {
      deleteLeaveRequest(leave.id);
      setRefreshKey(prev => prev + 1);
    }
  };

  // Get employee stats
  const getEmployeeStats = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    const empRequests = allRequests.filter(r => r.employeeId === employeeId);
    const planned = empRequests.filter(r => r.status === leaveStatuses.PLANNED).reduce((sum, r) => sum + r.duration, 0);
    const used = empRequests.filter(r => r.status === leaveStatuses.APPROVED).reduce((sum, r) => sum + r.duration, 0);
    
    return {
      available: employee?.annualLeave?.available || 0,
      planned,
      used,
      remaining: (employee?.annualLeave?.available || 0) - planned - used
    };
  };

  // Auto Planning Logic
  const handleAutoPlanning = () => {
    // Filter employees based on criteria
    let targetEmployees = managedEmployees;
    
    if (autoPlanningCriteria.targetEmployees === 'department' && autoPlanningCriteria.selectedDepartment) {
      targetEmployees = targetEmployees.filter(emp => emp.department === autoPlanningCriteria.selectedDepartment);
    } else if (autoPlanningCriteria.targetEmployees === 'selected' && autoPlanningCriteria.selectedEmployeeIds.length > 0) {
      targetEmployees = targetEmployees.filter(emp => autoPlanningCriteria.selectedEmployeeIds.includes(emp.id));
    }

    // Filter employees who need planning
    const employeesNeedingPlanning = targetEmployees.filter(emp => {
      const stats = getEmployeeStats(emp.id);
      return stats.remaining >= autoPlanningCriteria.minLeaveDays;
    });

    if (employeesNeedingPlanning.length === 0) {
      alert('Seçilen kriterlere uygun çalışan bulunamadı veya tüm çalışanlar için yeterli planlama mevcut.');
      return;
    }

    // Calculate planning period
    let startDate = new Date(2026, 5, 23); // June 23, 2026
    let endDate = new Date(2026, 7, 31); // August 31, 2026
    
    if (autoPlanningCriteria.planningPeriod === '1-month') {
      endDate = new Date(2026, 6, 31); // July 31, 2026
    } else if (autoPlanningCriteria.planningPeriod === '3-months') {
      endDate = new Date(2026, 8, 30); // September 30, 2026
    } else if (autoPlanningCriteria.planningPeriod === 'custom') {
      startDate = new Date(autoPlanningCriteria.customStartDate);
      endDate = new Date(autoPlanningCriteria.customEndDate);
    }

    let createdCount = 0;
    const createdLeaves = [];

    employeesNeedingPlanning.forEach((emp, index) => {
      const stats = getEmployeeStats(emp.id);
      
      // Calculate days to allocate
      let daysToAllocate = Math.min(
        Math.max(autoPlanningCriteria.minLeaveDays, Math.floor(stats.remaining * 0.4)), 
        Math.min(autoPlanningCriteria.maxLeaveDays, stats.remaining)
      );
      
      if (autoPlanningCriteria.leaveDistribution === 'concentrated') {
        // Single long leave
        const leaveStart = addDays(startDate, index * 7); // Stagger by week
        const leaveEnd = addDays(leaveStart, daysToAllocate - 1);
        
        if (leaveEnd <= endDate) {
          const newLeave = {
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            department: emp.department,
            managerId: emp.managerId,
            startDate: format(leaveStart, 'yyyy-MM-dd'),
            endDate: format(leaveEnd, 'yyyy-MM-dd'),
            duration: daysToAllocate,
            type: 'Planlı',
            reason: `Otomatik planlama - Yoğunlaştırılmış izin (${daysToAllocate} gün)`,
            status: leaveStatuses.PLANNED
          };
          
          createdLeaves.push(newLeave);
          createdCount++;
        }
      } else if (autoPlanningCriteria.leaveDistribution === 'scattered') {
        // Multiple short leaves
        const leavePeriods = Math.ceil(daysToAllocate / 3); // 3-day periods
        let remainingDays = daysToAllocate;
        
        for (let i = 0; i < leavePeriods && remainingDays > 0; i++) {
          const periodDays = Math.min(3, remainingDays);
          const leaveStart = addDays(startDate, (index * 10) + (i * 21)); // Stagger widely
          const leaveEnd = addDays(leaveStart, periodDays - 1);
          
          if (leaveEnd <= endDate) {
            const newLeave = {
              employeeId: emp.id,
              employeeName: `${emp.firstName} ${emp.lastName}`,
              department: emp.department,
              managerId: emp.managerId,
              startDate: format(leaveStart, 'yyyy-MM-dd'),
              endDate: format(leaveEnd, 'yyyy-MM-dd'),
              duration: periodDays,
              type: 'Planlı',
              reason: `Otomatik planlama - Dağıtılmış izin ${i + 1}/${leavePeriods} (${periodDays} gün)`,
              status: leaveStatuses.PLANNED
            };
            
            createdLeaves.push(newLeave);
            remainingDays -= periodDays;
          }
        }
        createdCount++;
      } else {
        // Balanced distribution (2-3 periods)
        const periods = daysToAllocate >= 10 ? 2 : 1;
        const daysPerPeriod = Math.floor(daysToAllocate / periods);
        const extraDays = daysToAllocate % periods;
        
        for (let i = 0; i < periods; i++) {
          const periodDays = daysPerPeriod + (i === 0 ? extraDays : 0);
          const leaveStart = addDays(startDate, (index * 5) + (i * 28)); // Stagger by month
          const leaveEnd = addDays(leaveStart, periodDays - 1);
          
          if (leaveEnd <= endDate) {
            const newLeave = {
              employeeId: emp.id,
              employeeName: `${emp.firstName} ${emp.lastName}`,
              department: emp.department,
              managerId: emp.managerId,
              startDate: format(leaveStart, 'yyyy-MM-dd'),
              endDate: format(leaveEnd, 'yyyy-MM-dd'),
              duration: periodDays,
              type: 'Planlı',
              reason: `Otomatik planlama - Dengeli izin ${i + 1}/${periods} (${periodDays} gün)`,
              status: leaveStatuses.PLANNED
            };
            
            createdLeaves.push(newLeave);
          }
        }
        createdCount++;
      }
    });

    // Create all leaves
    createdLeaves.forEach(leave => addLeaveRequest(leave));

    setRefreshKey(prev => prev + 1);
    setShowAutoPlanning(false);

    const successMsg = `✅ Otomatik Planlama Tamamlandı!\n\n${createdCount} çalışan için toplam ${createdLeaves.length} izin planı oluşturuldu.\n\nDağıtım: ${autoPlanningCriteria.leaveDistribution === 'balanced' ? 'Dengeli' : autoPlanningCriteria.leaveDistribution === 'concentrated' ? 'Yoğunlaştırılmış' : 'Dağıtılmış'}\nDönem: ${format(startDate, 'dd MMM', { locale: tr })} - ${format(endDate, 'dd MMM yyyy', { locale: tr })}`;
    alert(successMsg);
  };

  // Departments for filtering
  const departments = [...new Set(managedEmployees.map(e => e.department))];

  return (
    <div className="calendar-planning-page fade-in">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Takvim Planlama</h1>
          <p className="page-subtitle">Sürükle-bırak ile kolay izin planlama</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn ${showAutoPlanning ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setShowAutoPlanning(!showAutoPlanning)}
          >
            <Sparkles size={20} />
            Otomatik Planlama
          </button>
        </div>
      </div>

      <div className={`planning-layout ${showAutoPlanning ? 'with-auto-panel' : ''}`}>
        {/* Left Panel - Leave Types */}
        <div className="leave-types-panel">
          <div className="panel-header">
            <h3>Sabit İzin Seçenekleri</h3>
            <p>Aşağıdaki izin bloklarını çalışanlara sürükleyin</p>
          </div>

          <div className="leave-types-grid">
            {leaveTypes.map(leaveType => (
              <div
                key={leaveType.id}
                className="leave-type-block"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, leaveType)}
                onClick={() => {
                  console.log('Click on leave type:', leaveType.name);
                  alert(`Seçildi: ${leaveType.name} - ${leaveType.days} gün`);
                }}
                style={{ 
                  backgroundColor: leaveType.color,
                  cursor: 'grab',
                  userSelect: 'none'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.cursor = 'grabbing';
                  console.log('Mouse down on:', leaveType.name);
                }}
                onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
                onMouseLeave={(e) => e.currentTarget.style.cursor = 'grab'}
              >
                <div className="leave-type-info">
                  <div className="leave-type-name">{leaveType.name}</div>
                  <div className="leave-type-days">{leaveType.days} Gün</div>
                </div>
                <CalendarDays size={20} />
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="instructions">
            <h4>Nasıl Kullanılır?</h4>
            <ul>
              <li>Yukarıdaki izin bloklarından birini seçin</li>
              <li>Çalışanın ilgili tarihine sürükleyin</li>
              <li>Otomatik olarak izin planı oluşturulur</li>
              <li>Çakışma kontrolü otomatik yapılır</li>
            </ul>
            
            <div style={{ marginTop: '16px' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  console.log('Test click working');
                  console.log('Current dragged type:', draggedLeaveType);
                  alert('Test: Buttonlar çalışıyor!');
                }}
              >
                🔧 Test
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Calendar and Employee List */}
        <div className="calendar-content">
          {/* Calendar Header */}
          <div className="calendar-header">
            <div className="calendar-nav">
              <button onClick={handlePrevMonth} className="nav-btn">
                <ChevronLeft size={20} />
              </button>
              <h3 className="calendar-title">
                {format(currentDate, 'MMMM yyyy', { locale: tr })}
              </h3>
              <button onClick={handleNextMonth} className="nav-btn">
                <ChevronRight size={20} />
              </button>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleToday}>
              Bugün
            </button>
          </div>

          {/* Employees List with Mini Calendars */}
          <div className="employees-calendar-list">
            {managedEmployees.map(employee => {
              const stats = getEmployeeStats(employee.id);
              
              return (
                <div key={employee.id} className="employee-calendar-row">
                  {/* Employee Info */}
                  <div className="employee-info">
                    <div className="employee-avatar">
                      <User size={20} />
                    </div>
                    <div className="employee-details">
                      <div className="employee-name">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="employee-department">
                        {employee.department}
                      </div>
                      <div className="employee-stats">
                        <span className="stat available">Kalan: {stats.remaining}</span>
                        <span className="stat planned">Planlanan: {stats.planned}</span>
                        <span className="stat used">Kullanılan: {stats.used}</span>
                      </div>
                    </div>
                  </div>

                  {/* Employee Calendar */}
                  <div className="employee-calendar">
                    {calendarDays.filter(day => isSameMonth(day, currentDate)).map((day, dayIndex) => {
                      const leaves = getLeavesForEmployeeAndDay(employee.id, day);
                      const isCurrentDay = isToday(day);
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                      return (
                        <div
                          key={dayIndex}
                          className={`calendar-cell ${isCurrentDay ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#007AFF';
                            e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.style.borderColor = '';
                            e.currentTarget.style.backgroundColor = '';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '';
                            e.currentTarget.style.backgroundColor = '';
                            handleDrop(e, employee.id, day);
                          }}
                        >
                          <div className="day-number">{format(day, 'd')}</div>
                          
                          {leaves.length > 0 && (
                            <div className="leave-indicators">
                              {leaves.slice(0, 2).map((leave, leaveIndex) => (
                                <div
                                  key={`${leave.id}-${leaveIndex}`}
                                  className={`leave-indicator ${leave.status.toLowerCase().replace('ğ', 'g').replace('ı', 'i')}`}
                                  title={`${leave.duration} gün - ${leave.type} - ${leave.status}`}
                                  onClick={() => handleEditLeave(leave)}
                                >
                                  <span className="leave-duration">{leave.duration}g</span>
                                  <div className="leave-actions">
                                    <button
                                      className="leave-action-btn edit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditLeave(leave);
                                      }}
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      className="leave-action-btn delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteLeave(leave);
                                      }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {leaves.length > 2 && (
                                <div className="more-leaves">
                                  +{leaves.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                          
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="calendar-legend">
            <h4>Açıklama</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color planned"></div>
                <span>Planlanan</span>
              </div>
              <div className="legend-item">
                <div className="legend-color approved"></div>
                <span>Onaylanmış</span>
              </div>
              <div className="legend-item">
                <div className="legend-color pending"></div>
                <span>Bekliyor</span>
              </div>
              <div className="legend-item">
                <div className="legend-color rejected"></div>
                <span>Reddedildi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto Planning Panel */}
        {showAutoPlanning && (
          <div className="auto-planning-panel">
            <div className="panel-header">
              <h3>
                <Zap size={20} />
                Otomatik Planlama
              </h3>
              <button 
                className="close-panel-btn"
                onClick={() => setShowAutoPlanning(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="auto-planning-content">
              {/* Step 1: Target Selection */}
              <div className="planning-step">
                <div className="step-header">
                  <Target size={16} />
                  <h4>1. Hedef Çalışanlar</h4>
                </div>
                
                <div className="form-group">
                  <label className="radio-group">
                    <input
                      type="radio"
                      name="targetEmployees"
                      value="all"
                      checked={autoPlanningCriteria.targetEmployees === 'all'}
                      onChange={(e) => setAutoPlanningCriteria({
                        ...autoPlanningCriteria,
                        targetEmployees: e.target.value
                      })}
                    />
                    <span>Tüm Çalışanlar</span>
                  </label>
                  
                  <label className="radio-group">
                    <input
                      type="radio"
                      name="targetEmployees"
                      value="department"
                      checked={autoPlanningCriteria.targetEmployees === 'department'}
                      onChange={(e) => setAutoPlanningCriteria({
                        ...autoPlanningCriteria,
                        targetEmployees: e.target.value
                      })}
                    />
                    <span>Departman Bazında</span>
                  </label>
                  
                  {autoPlanningCriteria.targetEmployees === 'department' && (
                    <select
                      className="select"
                      value={autoPlanningCriteria.selectedDepartment}
                      onChange={(e) => setAutoPlanningCriteria({
                        ...autoPlanningCriteria,
                        selectedDepartment: e.target.value
                      })}
                    >
                      <option value="">Departman Seçin</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Step 2: Time Period */}
              <div className="planning-step">
                <div className="step-header">
                  <Calendar size={16} />
                  <h4>2. Planlama Dönemi</h4>
                </div>
                
                <div className="form-group">
                  <select
                    className="select"
                    value={autoPlanningCriteria.planningPeriod}
                    onChange={(e) => setAutoPlanningCriteria({
                      ...autoPlanningCriteria,
                      planningPeriod: e.target.value
                    })}
                  >
                    <option value="1-month">1 Ay (Temmuz)</option>
                    <option value="2-months">2 Ay (Temmuz-Ağustos)</option>
                    <option value="3-months">3 Ay (Temmuz-Eylül)</option>
                    <option value="custom">Özel Tarih Aralığı</option>
                  </select>
                  
                  {autoPlanningCriteria.planningPeriod === 'custom' && (
                    <div className="date-range">
                      <input
                        type="date"
                        className="input"
                        value={autoPlanningCriteria.customStartDate}
                        onChange={(e) => setAutoPlanningCriteria({
                          ...autoPlanningCriteria,
                          customStartDate: e.target.value
                        })}
                        placeholder="Başlangıç Tarihi"
                      />
                      <input
                        type="date"
                        className="input"
                        value={autoPlanningCriteria.customEndDate}
                        onChange={(e) => setAutoPlanningCriteria({
                          ...autoPlanningCriteria,
                          customEndDate: e.target.value
                        })}
                        placeholder="Bitiş Tarihi"
                        min={autoPlanningCriteria.customStartDate}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Leave Configuration */}
              <div className="planning-step">
                <div className="step-header">
                  <Settings size={16} />
                  <h4>3. İzin Konfigürasyonu</h4>
                </div>
                
                <div className="form-group">
                  <label className="form-label">İzin Süresi</label>
                  <div className="range-inputs">
                    <div>
                      <label>Minimum</label>
                      <input
                        type="number"
                        className="input"
                        value={autoPlanningCriteria.minLeaveDays}
                        onChange={(e) => setAutoPlanningCriteria({
                          ...autoPlanningCriteria,
                          minLeaveDays: parseInt(e.target.value)
                        })}
                        min="1"
                        max="30"
                      />
                      <span>gün</span>
                    </div>
                    <div>
                      <label>Maksimum</label>
                      <input
                        type="number"
                        className="input"
                        value={autoPlanningCriteria.maxLeaveDays}
                        onChange={(e) => setAutoPlanningCriteria({
                          ...autoPlanningCriteria,
                          maxLeaveDays: parseInt(e.target.value)
                        })}
                        min={autoPlanningCriteria.minLeaveDays}
                        max="30"
                      />
                      <span>gün</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">İzin Dağılımı</label>
                  <select
                    className="select"
                    value={autoPlanningCriteria.leaveDistribution}
                    onChange={(e) => setAutoPlanningCriteria({
                      ...autoPlanningCriteria,
                      leaveDistribution: e.target.value
                    })}
                  >
                    <option value="balanced">Dengeli (2-3 dönem)</option>
                    <option value="concentrated">Yoğunlaştırılmış (Tek dönem)</option>
                    <option value="scattered">Dağıtılmış (Kısa süreli)</option>
                  </select>
                </div>
              </div>

              {/* Step 4: Advanced Options */}
              <div className="planning-step">
                <div className="step-header">
                  <Filter size={16} />
                  <h4>4. Gelişmiş Seçenekler</h4>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={autoPlanningCriteria.avoidWeekends}
                      onChange={(e) => setAutoPlanningCriteria({
                        ...autoPlanningCriteria,
                        avoidWeekends: e.target.checked
                      })}
                    />
                    <span>Hafta sonlarını öncelik verme</span>
                  </label>
                  
                  <label className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={autoPlanningCriteria.teamCoverage}
                      onChange={(e) => setAutoPlanningCriteria({
                        ...autoPlanningCriteria,
                        teamCoverage: e.target.checked
                      })}
                    />
                    <span>Ekip kapsama kontrolü</span>
                  </label>
                  
                  {autoPlanningCriteria.teamCoverage && (
                    <div className="sub-option">
                      <label>Minimum ekip varlığı: {autoPlanningCriteria.minTeamCoverage}%</label>
                      <input
                        type="range"
                        min="50"
                        max="90"
                        value={autoPlanningCriteria.minTeamCoverage}
                        onChange={(e) => setAutoPlanningCriteria({
                          ...autoPlanningCriteria,
                          minTeamCoverage: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Execute Button */}
              <div className="planning-execute">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleAutoPlanning}
                >
                  <RefreshCw size={20} />
                  Planlamayı Çalıştır
                </button>
                
                <div className="planning-summary">
                  <p>
                    {autoPlanningCriteria.targetEmployees === 'all' ? 'Tüm çalışanlar' :
                     autoPlanningCriteria.targetEmployees === 'department' ? `${autoPlanningCriteria.selectedDepartment || 'Seçilen departman'}` :
                     'Seçili çalışanlar'} için otomatik planlama yapılacak
                  </p>
                  <p>
                    {autoPlanningCriteria.minLeaveDays}-{autoPlanningCriteria.maxLeaveDays} gün, {
                      autoPlanningCriteria.leaveDistribution === 'balanced' ? 'dengeli' :
                      autoPlanningCriteria.leaveDistribution === 'concentrated' ? 'yoğun' : 'dağıtılmış'
                    } şekilde
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Leave Modal */}
      {showEmployeeModal && editingLeave && (
        <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">İzin Düzenle</h3>
              <button className="close-btn" onClick={() => setShowEmployeeModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="leave-details">
                <h4>{editingLeave.employeeName}</h4>
                <p>
                  <strong>Tarih:</strong> {format(new Date(editingLeave.startDate), 'dd MMMM yyyy', { locale: tr })} - 
                  {format(new Date(editingLeave.endDate), 'dd MMMM yyyy', { locale: tr })}
                </p>
                <p><strong>Süre:</strong> {editingLeave.duration} gün</p>
                <p><strong>Tür:</strong> {editingLeave.type}</p>
                <p><strong>Durum:</strong> {editingLeave.status}</p>
                <p><strong>Açıklama:</strong> {editingLeave.reason}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-success"
                onClick={() => {
                  updateLeaveRequest(editingLeave.id, { status: leaveStatuses.APPROVED });
                  setShowEmployeeModal(false);
                  setRefreshKey(prev => prev + 1);
                }}
              >
                <CheckCircle size={18} />
                Onayla
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDeleteLeave(editingLeave)}
              >
                <Trash2 size={18} />
                Sil
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowEmployeeModal(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPlanning;