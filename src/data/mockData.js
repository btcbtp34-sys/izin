// Mock data for 1000 employees
import { addDays, subDays, addMonths, format } from 'date-fns';

// Departments
export const departments = [
  'İnsan Kaynakları',
  'Bilgi Teknolojileri',
  'Satış',
  'Pazarlama',
  'Finans',
  'Operasyon',
  'Müşteri Hizmetleri',
  'Ar-Ge',
  'Üretim',
  'Lojistik'
];

// Turkish names
const firstNames = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Süleyman', 'Ömer', 'Abdullah',
  'Fatma', 'Ayşe', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Sultan', 'Kübra', 'Rabia',
  'Emre', 'Can', 'Arda', 'Eren', 'Burak', 'Cem', 'Deniz', 'Baran', 'Kaan', 'Umut',
  'Selin', 'Defne', 'İrem', 'Azra', 'Nehir', 'Su', 'Lara', 'Ece', 'Derin', 'Ada'
];

const lastNames = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Aydın', 'Öztürk', 'Arslan', 'Doğan',
  'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özdemir', 'Şimşek', 'Erdoğan', 'Yıldırım',
  'Polat', 'Güneş', 'Ak', 'Aksoy', 'Aktaş', 'Acar', 'Güler', 'Uzun', 'Keskin', 'Kaplan'
];

// Generate random date
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate employees
const generateEmployees = () => {
  const employees = [];
  const managers = [];
  
  // First create THE manager - Hasan Cavit Koçak
  const mainManager = {
    id: 1,
    firstName: 'Hasan Cavit',
    lastName: 'Koçak',
    email: 'hasan.cavit.kocak@company.com',
    phone: '+90 532 100 0001',
    department: 'Genel Müdürlük',
    position: 'Genel Müdür',
    managerId: null,
    isManager: true,
    birthDate: '1975-06-18', // Birthday today for demo
    hireDate: '2010-01-15',
    annualLeave: {
      previousBalance: 10,
      currentYearAllocation: 28,
      used: 5,
      planned: 0,
      available: 0
    }
  };
  
  mainManager.annualLeave.available = 
    mainManager.annualLeave.previousBalance + 
    mainManager.annualLeave.currentYearAllocation - 
    mainManager.annualLeave.used;
  
  managers.push(mainManager);
  employees.push(mainManager);
  
  // Then create other managers
  for (let i = 1; i < 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const birthDate = getRandomDate(new Date(1975, 0, 1), new Date(1990, 11, 31));
    
    const manager = {
      id: i + 1,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      phone: `+90 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: 'Müdür',
      managerId: 1, // Everyone reports to main manager
      isManager: true,
      birthDate: format(birthDate, 'yyyy-MM-dd'),
      hireDate: format(getRandomDate(new Date(2010, 0, 1), new Date(2020, 11, 31)), 'yyyy-MM-dd'),
      annualLeave: {
        previousBalance: Math.floor(Math.random() * 15),
        currentYearAllocation: 20 + Math.floor(Math.random() * 10),
        used: Math.floor(Math.random() * 10),
        planned: 0,
        available: 0
      }
    };
    
    manager.annualLeave.available = 
      manager.annualLeave.previousBalance + 
      manager.annualLeave.currentYearAllocation - 
      manager.annualLeave.used;
    
    managers.push(manager);
    employees.push(manager);
  }
  
  // Then create regular employees
  for (let i = 100; i < 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const manager = managers[Math.floor(Math.random() * (managers.length - 1)) + 1]; // Not main manager
    const birthDate = getRandomDate(new Date(1980, 0, 1), new Date(2000, 11, 31));
    
    const employee = {
      id: i + 1,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
      phone: `+90 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
      department: manager.department,
      position: ['Uzman', 'Kıdemli Uzman', 'Şef', 'Koordinatör'][Math.floor(Math.random() * 4)],
      managerId: manager.id,
      isManager: false,
      birthDate: format(birthDate, 'yyyy-MM-dd'),
      hireDate: format(getRandomDate(new Date(2015, 0, 1), new Date(2023, 11, 31)), 'yyyy-MM-dd'),
      annualLeave: {
        previousBalance: Math.floor(Math.random() * 15),
        currentYearAllocation: 14 + Math.floor(Math.random() * 6),
        used: Math.floor(Math.random() * 8),
        planned: 0,
        available: 0
      }
    };
    
    employee.annualLeave.available = 
      employee.annualLeave.previousBalance + 
      employee.annualLeave.currentYearAllocation - 
      employee.annualLeave.used;
    
    employees.push(employee);
  }
  
  return employees;
};

// Leave request statuses
export const leaveStatuses = {
  PENDING: 'Beklemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  PLANNED: 'Planlandı',
  EXPIRED: 'Süresi Doldu'
};

// Generate leave requests - Focused on June 2026
const generateLeaveRequests = (employees) => {
  const requests = [];
  let id = 1;
  
  // June 2026 date range
  const juneStart = new Date(2026, 5, 1); // June 1, 2026
  const juneEnd = new Date(2026, 5, 30); // June 30, 2026
  
  // Add some requests from May for continuity
  const mayStart = new Date(2026, 4, 15); // May 15, 2026
  const mayEnd = new Date(2026, 4, 31); // May 31, 2026
  
  // Add some requests extending to July
  const julyStart = new Date(2026, 6, 1); // July 1, 2026
  const julyEnd = new Date(2026, 6, 15); // July 15, 2026
  
  employees.forEach(employee => {
    // Each employee gets 1-3 leave requests in or around June 2026
    const requestCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < requestCount; i++) {
      let startDate;
      const random = Math.random();
      
      // 70% in June, 15% in late May, 15% in early July
      if (random < 0.7) {
        startDate = getRandomDate(juneStart, juneEnd);
      } else if (random < 0.85) {
        startDate = getRandomDate(mayStart, mayEnd);
      } else {
        startDate = getRandomDate(julyStart, julyEnd);
      }
      
      const duration = Math.floor(Math.random() * 8) + 2; // 2-9 days
      const endDate = addDays(startDate, duration - 1);
      const isPlanned = Math.random() > 0.5;
      
      // Determine status based on date
      let status;
      const now = new Date(2026, 5, 18); // Current date: June 18, 2026
      
      if (startDate < now) {
        // Past dates are mostly approved
        status = Math.random() > 0.1 ? leaveStatuses.APPROVED : leaveStatuses.REJECTED;
      } else {
        // Future dates are planned or pending
        status = isPlanned ? leaveStatuses.PLANNED : 
                (Math.random() > 0.4 ? leaveStatuses.PENDING : leaveStatuses.APPROVED);
      }
      
      requests.push({
        id: id++,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        managerId: employee.managerId,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        duration,
        type: isPlanned ? 'Planlı' : 'Ani',
        reason: isPlanned ? 'Yıllık izin planlaması' : 'Kişisel nedenler',
        status,
        requestDate: format(subDays(startDate, Math.floor(Math.random() * 20) + 7), 'yyyy-MM-dd'),
        responseDate: status !== leaveStatuses.PENDING && status !== leaveStatuses.PLANNED ? 
                      format(subDays(startDate, Math.floor(Math.random() * 10) + 1), 'yyyy-MM-dd') : null,
        notes: ''
      });
    }
  });
  
  return requests;
};

// Initialize data from localStorage or generate new
const loadData = () => {
  const savedEmployees = localStorage.getItem('employees');
  const savedRequests = localStorage.getItem('leaveRequests');
  const dataVersion = localStorage.getItem('dataVersion');
  const CURRENT_VERSION = '2026-06-fix'; // June 2026 - Fixed Manager
  
  if (savedEmployees && savedRequests && dataVersion === CURRENT_VERSION) {
    return {
      employees: JSON.parse(savedEmployees),
      requests: JSON.parse(savedRequests)
    };
  }
  
  // Generate new data for June 2026
  console.log('📦 Generating June 2026 data with Hasan Cavit Koçak as manager...');
  const employees = generateEmployees();
  const requests = generateLeaveRequests(employees);
  
  // Calculate planned leave for employees
  requests.forEach(request => {
    if (request.status === leaveStatuses.PLANNED || request.status === leaveStatuses.APPROVED) {
      const employee = employees.find(e => e.id === request.employeeId);
      if (employee) {
        employee.annualLeave.planned += request.duration;
        employee.annualLeave.available = 
          employee.annualLeave.previousBalance + 
          employee.annualLeave.currentYearAllocation - 
          employee.annualLeave.used - 
          employee.annualLeave.planned;
      }
    }
  });
  
  // Save to localStorage
  localStorage.setItem('employees', JSON.stringify(employees));
  localStorage.setItem('leaveRequests', JSON.stringify(requests));
  localStorage.setItem('dataVersion', CURRENT_VERSION);
  
  console.log(`✅ Data generated! Manager: ${employees[0].firstName} ${employees[0].lastName}`);
  
  return { employees, requests };
};

const data = loadData();
const employees = data.employees;
const leaveRequests = data.requests;

// Calculate planned leave for employees
leaveRequests.forEach(request => {
  if (request.status === leaveStatuses.PLANNED || request.status === leaveStatuses.APPROVED) {
    const employee = employees.find(e => e.id === request.employeeId);
    if (employee) {
      employee.annualLeave.planned += request.duration;
      employee.annualLeave.available = 
        employee.annualLeave.previousBalance + 
        employee.annualLeave.currentYearAllocation - 
        employee.annualLeave.used - 
        employee.annualLeave.planned;
    }
  }
});

// Export data
export let employeesData = employees;
export let leaveRequestsData = leaveRequests;

// Clear localStorage function for development
export const clearAllData = () => {
  localStorage.clear(); // Clear all including dataVersion
  console.log('All data cleared! Reloading...');
  window.location.reload();
};

// CRUD operations for employees
export const getEmployees = () => employeesData;

export const getEmployee = (id) => employeesData.find(e => e.id === id);

export const getEmployeesByManager = (managerId) => 
  employeesData.filter(e => e.managerId === managerId);

export const addEmployee = (employee) => {
  const newEmployee = {
    ...employee,
    id: Math.max(...employeesData.map(e => e.id)) + 1
  };
  employeesData.push(newEmployee);
  localStorage.setItem('employees', JSON.stringify(employeesData));
  return newEmployee;
};

export const updateEmployee = (id, updates) => {
  const index = employeesData.findIndex(e => e.id === id);
  if (index !== -1) {
    employeesData[index] = { ...employeesData[index], ...updates };
    localStorage.setItem('employees', JSON.stringify(employeesData));
    return employeesData[index];
  }
  return null;
};

export const deleteEmployee = (id) => {
  const index = employeesData.findIndex(e => e.id === id);
  if (index !== -1) {
    employeesData.splice(index, 1);
    // Also remove leave requests
    leaveRequestsData = leaveRequestsData.filter(r => r.employeeId !== id);
    localStorage.setItem('employees', JSON.stringify(employeesData));
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequestsData));
    return true;
  }
  return false;
};

// CRUD operations for leave requests
export const getLeaveRequests = () => leaveRequestsData;

export const getLeaveRequest = (id) => leaveRequestsData.find(r => r.id === id);

export const getLeaveRequestsByEmployee = (employeeId) => 
  leaveRequestsData.filter(r => r.employeeId === employeeId);

export const getLeaveRequestsByManager = (managerId) => 
  leaveRequestsData.filter(r => r.managerId === managerId);

export const addLeaveRequest = (request) => {
  const newRequest = {
    ...request,
    id: Math.max(...leaveRequestsData.map(r => r.id), 0) + 1,
    requestDate: format(new Date(), 'yyyy-MM-dd'),
    responseDate: null
  };
  leaveRequestsData.push(newRequest);
  
  // Update employee's planned leave
  if (newRequest.status === leaveStatuses.PLANNED || newRequest.status === leaveStatuses.APPROVED) {
    const employee = employeesData.find(e => e.id === newRequest.employeeId);
    if (employee) {
      employee.annualLeave.planned += newRequest.duration;
      employee.annualLeave.available -= newRequest.duration;
    }
  }
  
  localStorage.setItem('leaveRequests', JSON.stringify(leaveRequestsData));
  localStorage.setItem('employees', JSON.stringify(employeesData));
  
  return newRequest;
};

export const updateLeaveRequest = (id, updates) => {
  const index = leaveRequestsData.findIndex(r => r.id === id);
  if (index !== -1) {
    const oldRequest = leaveRequestsData[index];
    leaveRequestsData[index] = { ...oldRequest, ...updates };
    
    // Update employee's planned leave if status changed
    if (oldRequest.status !== updates.status) {
      const employee = employeesData.find(e => e.id === oldRequest.employeeId);
      if (employee) {
        // Revert old status
        if (oldRequest.status === leaveStatuses.PLANNED || oldRequest.status === leaveStatuses.APPROVED) {
          employee.annualLeave.planned -= oldRequest.duration;
          employee.annualLeave.available += oldRequest.duration;
        }
        
        // Apply new status
        if (updates.status === leaveStatuses.PLANNED || updates.status === leaveStatuses.APPROVED) {
          employee.annualLeave.planned += oldRequest.duration;
          employee.annualLeave.available -= oldRequest.duration;
        } else if (updates.status === leaveStatuses.APPROVED) {
          employee.annualLeave.used += oldRequest.duration;
          employee.annualLeave.available -= oldRequest.duration;
        }
      }
      
      // Set response date
      if (updates.status !== leaveStatuses.PENDING && updates.status !== leaveStatuses.PLANNED) {
        leaveRequestsData[index].responseDate = format(new Date(), 'yyyy-MM-dd');
      }
    }
    
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequestsData));
    localStorage.setItem('employees', JSON.stringify(employeesData));
    
    return leaveRequestsData[index];
  }
  return null;
};

export const deleteLeaveRequest = (id) => {
  const index = leaveRequestsData.findIndex(r => r.id === id);
  if (index !== -1) {
    const request = leaveRequestsData[index];
    
    // Update employee's planned leave
    if (request.status === leaveStatuses.PLANNED || request.status === leaveStatuses.APPROVED) {
      const employee = employeesData.find(e => e.id === request.employeeId);
      if (employee) {
        employee.annualLeave.planned -= request.duration;
        employee.annualLeave.available += request.duration;
      }
    }
    
    leaveRequestsData.splice(index, 1);
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequestsData));
    localStorage.setItem('employees', JSON.stringify(employeesData));
    return true;
  }
  return false;
};

// Get today's birthdays
export const getTodaysBirthdays = () => {
  // Use June 18, 2026 as "today" for demo purposes
  const today = new Date(2026, 5, 18);
  const todayStr = format(today, 'MM-dd');
  
  return employeesData.filter(employee => {
    const birthDateStr = format(new Date(employee.birthDate), 'MM-dd');
    return birthDateStr === todayStr;
  });
};

// Statistics
export const getStatistics = () => {
  const totalEmployees = employeesData.length;
  const totalManagers = employeesData.filter(e => e.isManager).length;
  const pendingRequests = leaveRequestsData.filter(r => r.status === leaveStatuses.PENDING).length;
  const approvedRequests = leaveRequestsData.filter(r => r.status === leaveStatuses.APPROVED).length;
  const plannedRequests = leaveRequestsData.filter(r => r.status === leaveStatuses.PLANNED).length;
  
  const totalLeaveAllocation = employeesData.reduce((sum, e) => 
    sum + e.annualLeave.currentYearAllocation, 0);
  const totalLeaveUsed = employeesData.reduce((sum, e) => 
    sum + e.annualLeave.used, 0);
  const totalLeavePlanned = employeesData.reduce((sum, e) => 
    sum + e.annualLeave.planned, 0);
  const totalLeaveAvailable = employeesData.reduce((sum, e) => 
    sum + e.annualLeave.available, 0);
  
  // Department breakdown
  const departmentStats = departments.map(dept => {
    const deptEmployees = employeesData.filter(e => e.department === dept);
    return {
      name: dept,
      employees: deptEmployees.length,
      totalLeave: deptEmployees.reduce((sum, e) => sum + e.annualLeave.currentYearAllocation, 0),
      usedLeave: deptEmployees.reduce((sum, e) => sum + e.annualLeave.used, 0),
      plannedLeave: deptEmployees.reduce((sum, e) => sum + e.annualLeave.planned, 0),
      availableLeave: deptEmployees.reduce((sum, e) => sum + e.annualLeave.available, 0)
    };
  });
  
  // Monthly leave distribution - 2026
  const monthlyLeave = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const year = 2026;
    const requests = leaveRequestsData.filter(r => {
      const startDate = new Date(r.startDate);
      const startMonth = startDate.getMonth() + 1;
      const startYear = startDate.getFullYear();
      return startYear === year && startMonth === month && 
             (r.status === leaveStatuses.APPROVED || r.status === leaveStatuses.PLANNED);
    });
    
    return {
      month: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][i],
      count: requests.length,
      days: requests.reduce((sum, r) => sum + r.duration, 0)
    };
  });
  
  return {
    totalEmployees,
    totalManagers,
    pendingRequests,
    approvedRequests,
    plannedRequests,
    totalLeaveAllocation,
    totalLeaveUsed,
    totalLeavePlanned,
    totalLeaveAvailable,
    departmentStats,
    monthlyLeave,
    utilizationRate: ((totalLeaveUsed + totalLeavePlanned) / totalLeaveAllocation * 100).toFixed(1)
  };
};
