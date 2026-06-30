import React, { useState, useMemo } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, User, CalendarDays
} from 'lucide-react';
import {
  getEmployees, getLeaveRequests, addLeaveRequest, leaveStatuses
} from '../data/mockData';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import './CalendarPlanning.css';

const SimpleCalendarPlanning = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const employees = getEmployees();
  const allRequests = getLeaveRequests();

  // Predefined leave blocks
  const leaveTypes = [
    { id: 'annual-5', name: '5 Günlük İzin', days: 5, color: '#007AFF' },
    { id: 'annual-10', name: '10 Günlük İzin', days: 10, color: '#34C759' },
    { id: 'annual-15', name: '15 Günlük İzin', days: 15, color: '#FF9500' }
  ];

  // Filter employees managed by current user
  const managedEmployees = useMemo(() => {
    if (currentUser?.isManager) {
      return employees.filter(e => e.managerId === currentUser.id).slice(0, 10); // Only 10 employees
    }
    return employees.slice(0, 10);
  }, [employees, currentUser]);

  // Calendar days - only current month
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get leaves for a specific employee and day
  const getLeavesForEmployeeAndDay = (employeeId, day) => {
    return allRequests.filter(request => {
      if (request.employeeId !== employeeId) return false;
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      return day >= start && day <= end;
    });
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date(2026, 5, 18));

  // Simple click to add leave
  const handleAddLeave = (employeeId, day) => {
    if (!selectedLeaveType) {
      alert('Önce sol panelden bir izin türü seçin!');
      return;
    }

    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const start = new Date(day);
    const end = addDays(start, selectedLeaveType.days - 1);

    const newLeave = {
      employeeId: employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      managerId: employee.managerId,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      duration: selectedLeaveType.days,
      type: 'Planlı',
      reason: `${selectedLeaveType.name} - Tıkla-ekle ile oluşturuldu`,
      status: leaveStatuses.PLANNED
    };

    addLeaveRequest(newLeave);
    setRefreshKey(prev => prev + 1);
    alert(`✅ ${employee.firstName} ${employee.lastName} için ${selectedLeaveType.days} günlük izin eklendi!`);
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

  return (
    <div className="calendar-planning-page fade-in">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Basit Takvim Planlama</h1>
          <p className="page-subtitle">Tıkla-ekle ile kolay izin planlama</p>
        </div>
      </div>

      <div className="planning-layout">
        {/* Left Panel - Leave Types */}
        <div className="leave-types-panel">
          <div className="panel-header">
            <h3>İzin Türlerini Seçin</h3>
            <p>Bir tür seçin, sonra takvimde ilgili güne tıklayın</p>
          </div>

          <div className="leave-types-grid">
            {leaveTypes.map(leaveType => (
              <div
                key={leaveType.id}
                className={`leave-type-block ${selectedLeaveType?.id === leaveType.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedLeaveType(leaveType);
                  console.log('Selected:', leaveType.name);
                }}
                style={{ 
                  backgroundColor: leaveType.color,
                  cursor: 'pointer',
                  opacity: selectedLeaveType?.id === leaveType.id ? 1 : 0.8,
                  transform: selectedLeaveType?.id === leaveType.id ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div className="leave-type-info">
                  <div className="leave-type-name">{leaveType.name}</div>
                  <div className="leave-type-days">{leaveType.days} Gün</div>
                </div>
                <CalendarDays size={20} />
                {selectedLeaveType?.id === leaveType.id && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>✓</div>
                )}
              </div>
            ))}
          </div>

          {selectedLeaveType && (
            <div className="selected-info" style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'rgba(0, 122, 255, 0.1)',
              borderRadius: '8px',
              border: '2px solid #007AFF'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#007AFF' }}>
                Seçili: {selectedLeaveType.name}
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                Takvimde bir güne tıklayarak {selectedLeaveType.days} günlük izin ekleyin
              </p>
            </div>
          )}

          <div className="instructions">
            <h4>Nasıl Kullanılır?</h4>
            <ul>
              <li>Yukarıdan bir izin türü seçin</li>
              <li>Çalışanın takviminde istediğiniz güne tıklayın</li>
              <li>İzin otomatik olarak eklenir</li>
            </ul>
          </div>
        </div>

        {/* Right Panel - Calendar */}
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

          {/* Employees List with Calendars */}
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
                      </div>
                    </div>
                  </div>

                  {/* Employee Calendar */}
                  <div className="employee-calendar">
                    {calendarDays.map((day, dayIndex) => {
                      const leaves = getLeavesForEmployeeAndDay(employee.id, day);
                      const isCurrentDay = isToday(day);
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                      return (
                        <div
                          key={dayIndex}
                          className={`calendar-cell ${isCurrentDay ? 'today' : ''} ${isWeekend ? 'weekend' : ''} ${selectedLeaveType ? 'clickable' : ''}`}
                          onClick={() => selectedLeaveType && handleAddLeave(employee.id, day)}
                          style={{
                            cursor: selectedLeaveType ? 'pointer' : 'default',
                            backgroundColor: selectedLeaveType && !leaves.length && !isWeekend ? 'rgba(0, 122, 255, 0.05)' : ''
                          }}
                          title={selectedLeaveType ? `${selectedLeaveType.name} eklemek için tıklayın` : ''}
                        >
                          <div className="day-number">{format(day, 'd')}</div>
                          
                          {leaves.length > 0 && (
                            <div className="leave-indicators">
                              {leaves.slice(0, 1).map((leave, leaveIndex) => (
                                <div
                                  key={leaveIndex}
                                  className="leave-indicator planned"
                                  title={`${leave.duration} gün - ${leave.type}`}
                                >
                                  <span className="leave-duration">{leave.duration}g</span>
                                </div>
                              ))}
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
        </div>
      </div>
    </div>
  );
};

export default SimpleCalendarPlanning;