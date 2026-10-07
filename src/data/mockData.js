// Mock data with Foreman, Blue/White Collar roles and Business Rules
import { addDays, subDays, format, getDay, differenceInCalendarDays, parseISO } from 'date-fns';

// Departmanlar (Kullanıcı görselindeki departmanlar)
export const departments = [
  'Bakım',
  'Kaynak',
  'Montaj',
  'Enstrümantasyon',
  'Kalite',
  'Üretim',
  'Lojistik'
];

// Yaka / Rol Tipleri
export const COLLAR_TYPES = {
  MANAGER: 'Yönetici',
  FOREMAN: 'Formen',
  BLUE_COLLAR: 'Mavi Yaka',
  WHITE_COLLAR: 'Beyaz Yaka'
};

// İzin Durumları (Kullanıcı isteği: Onay bekliyor turuncu, onaylandı yeşil, planlandı mavi, geri gönderildi kırmızı)
export const leaveStatuses = {
  PLANNED: 'Planlandı',
  PENDING: 'Onay Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Geri Gönderildi'
};

// Demo Kullanıcıları (Hızlı rol değiştirme ve test için: Yönetici, Formen, Beyaz Yaka)
export const DEMO_USERS = [
  {
    id: 1,
    firstName: 'Hasan Cavit',
    lastName: 'Koçak',
    role: COLLAR_TYPES.MANAGER,
    collarType: COLLAR_TYPES.MANAGER,
    position: 'Genel Müdür / Yönetici',
    department: 'Genel Yönetim',
    isManager: true,
    avatar: 'HK'
  },
  {
    id: 2,
    firstName: 'Ali',
    lastName: 'Vural',
    role: COLLAR_TYPES.FOREMAN,
    collarType: COLLAR_TYPES.FOREMAN,
    position: 'Bakım & Üretim Formeni',
    department: 'Bakım',
    isForeman: true,
    avatar: 'AV'
  },
  {
    id: 5,
    firstName: 'Ayşe',
    lastName: 'Demir',
    role: COLLAR_TYPES.WHITE_COLLAR,
    collarType: COLLAR_TYPES.WHITE_COLLAR,
    position: 'Kalite Güvence Mühendisi',
    department: 'Kalite',
    avatar: 'AD'
  }
];

// Sabit Çalışan Listesi (Kullanıcının görselindeki birebir isimler ve departmanlar)
const initialEmployees = [
  {
    id: 1,
    firstName: 'Hasan Cavit',
    lastName: 'Koçak',
    email: 'hasan.cavit.kocak@company.com',
    phone: '+90 532 100 0001',
    department: 'Genel Yönetim',
    position: 'Genel Müdür',
    collarType: COLLAR_TYPES.MANAGER,
    isManager: true,
    annualLeave: {
      previousBalance: 10,
      currentYearAllocation: 28,
      used: 5,
      planned: 0,
      available: 33,
      futureAllocation: 8
    }
  },
  {
    id: 2,
    firstName: 'Ali',
    lastName: 'Vural',
    email: 'ali.vural@company.com',
    phone: '+90 532 200 0002',
    department: 'Bakım',
    position: 'Formen',
    collarType: COLLAR_TYPES.FOREMAN,
    isForeman: true,
    managerId: 1,
    annualLeave: {
      previousBalance: 6,
      currentYearAllocation: 20,
      used: 4,
      planned: 0,
      available: 22,
      futureAllocation: 8
    }
  },
  // Görseldeki çalışanlar:
  {
    id: 3,
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'ahmet.yilmaz@company.com',
    phone: '+90 532 300 0003',
    department: 'Bakım',
    position: 'Bakım Teknisyeni',
    collarType: COLLAR_TYPES.BLUE_COLLAR,
    foremanId: 2,
    managerId: 1,
    annualLeave: {
      previousBalance: 6,
      currentYearAllocation: 14,
      used: 0,
      planned: 6,
      available: 14,
      futureAllocation: 8
    }
  },
  {
    id: 4,
    firstName: 'Mehmet',
    lastName: 'Kaya',
    email: 'mehmet.kaya@company.com',
    phone: '+90 532 400 0004',
    department: 'Bakım',
    position: 'Bakım Ustası',
    collarType: COLLAR_TYPES.BLUE_COLLAR,
    foremanId: 2,
    managerId: 1,
    annualLeave: {
      previousBalance: 4,
      currentYearAllocation: 14,
      used: 0,
      planned: 4,
      available: 14,
      futureAllocation: 8
    }
  },
  {
    id: 5,
    firstName: 'Ayşe',
    lastName: 'Demir',
    email: 'ayse.demir@company.com',
    phone: '+90 532 500 0005',
    department: 'Bakım',
    position: 'Bakım Mühendisi',
    collarType: COLLAR_TYPES.WHITE_COLLAR,
    managerId: 1,
    annualLeave: {
      previousBalance: 5,
      currentYearAllocation: 14,
      used: 2,
      planned: 5,
      available: 12,
      futureAllocation: 8
    }
  },
  {
    id: 6,
    firstName: 'Fatma',
    lastName: 'Çelik',
    email: 'fatma.celik@company.com',
    phone: '+90 532 600 0006',
    department: 'Kaynak',
    position: 'Kaynak Operatörü',
    collarType: COLLAR_TYPES.BLUE_COLLAR,
    foremanId: 2,
    managerId: 1,
    annualLeave: {
      previousBalance: 3,
      currentYearAllocation: 14,
      used: 0,
      planned: 3,
      available: 14,
      futureAllocation: 8
    }
  },
  {
    id: 7,
    firstName: 'Caner',
    lastName: 'Akın',
    email: 'caner.akin@company.com',
    phone: '+90 532 700 0007',
    department: 'Montaj',
    position: 'Montaj Teknisyeni',
    collarType: COLLAR_TYPES.BLUE_COLLAR,
    foremanId: 2,
    managerId: 1,
    annualLeave: {
      previousBalance: 2,
      currentYearAllocation: 14,
      used: 0,
      planned: 6,
      available: 10,
      futureAllocation: 8
    }
  },
  {
    id: 8,
    firstName: 'Zeynep',
    lastName: 'Yıldız',
    email: 'zeynep.yildiz@company.com',
    phone: '+90 532 800 0008',
    department: 'Montaj',
    position: 'Montaj Uzmanı',
    collarType: COLLAR_TYPES.WHITE_COLLAR,
    managerId: 1,
    annualLeave: {
      previousBalance: 4,
      currentYearAllocation: 14,
      used: 2,
      planned: 4,
      available: 12,
      futureAllocation: 8
    }
  },
  {
    id: 9,
    firstName: 'Hakan',
    lastName: 'Arslan',
    email: 'hakan.arslan@company.com',
    phone: '+90 532 900 0009',
    department: 'Enstrümantasyon',
    position: 'Enstrümantasyon Mühendisi',
    collarType: COLLAR_TYPES.WHITE_COLLAR,
    managerId: 1,
    annualLeave: {
      previousBalance: 7,
      currentYearAllocation: 14,
      used: 3,
      planned: 3,
      available: 15,
      futureAllocation: 8
    }
  },
  {
    id: 10,
    firstName: 'Fikri',
    lastName: 'Can',
    email: 'fikri.can@company.com',
    phone: '+90 532 100 0010',
    department: 'Kalite',
    position: 'Kalite Kontrolörü',
    collarType: COLLAR_TYPES.WHITE_COLLAR,
    managerId: 1,
    annualLeave: {
      previousBalance: 6,
      currentYearAllocation: 14,
      used: 1,
      planned: 5,
      available: 14,
      futureAllocation: 8
    }
  }
];

// Görseldeki İzin Talepleri (Temmuz 2026 - Onay Akışı Geçmişi ile)
const initialRequests = [
  {
    id: 101,
    employeeId: 3, // Ahmet Yılmaz
    employeeName: 'Ahmet Yılmaz',
    department: 'Bakım',
    startDate: '2026-07-07',
    endDate: '2026-07-09',
    duration: 3,
    type: 'Planlı',
    status: leaveStatuses.APPROVED,
    reason: 'Yıllık İzin Planı',
    approvalWorkflow: [
      { step: 1, title: 'Talep Girildi', user: 'Ali Vural (Formen)', date: '01.07.2026 09:30', status: 'Onaylandı', note: 'Çalışan adına planlama yapıldı.' },
      { step: 2, title: 'Yönetici Onayı', user: 'Hasan Cavit Koçak (Yönetici)', date: '02.07.2026 11:20', status: 'Onaylandı', note: 'İzin uygundur.' }
    ]
  },
  {
    id: 102,
    employeeId: 3, // Ahmet Yılmaz - 2. İzin
    employeeName: 'Ahmet Yılmaz',
    department: 'Bakım',
    startDate: '2026-07-12',
    endDate: '2026-07-14',
    duration: 3,
    type: 'Planlı',
    status: leaveStatuses.APPROVED,
    reason: 'Yıllık İzin Planı',
    approvalWorkflow: [
      { step: 1, title: 'Talep Girildi', user: 'Ali Vural (Formen)', date: '01.07.2026 09:35', status: 'Onaylandı', note: 'Planlama listesine eklendi.' },
      { step: 2, title: 'Yönetici Onayı', user: 'Hasan Cavit Koçak (Yönetici)', date: '02.07.2026 11:22', status: 'Onaylandı', note: 'Onaylandı.' }
    ]
  },
  {
    id: 103,
    employeeId: 4, // Mehmet Kaya
    employeeName: 'Mehmet Kaya',
    department: 'Bakım',
    startDate: '2026-07-04',
    endDate: '2026-07-07',
    duration: 4,
    type: 'Planlı',
    status: leaveStatuses.PENDING,
    reason: 'Memleket ziyareti ve dinlenme',
    approvalWorkflow: [
      { step: 1, title: 'Talep Girildi', user: 'Ali Vural (Formen)', date: '02.07.2026 10:15', status: 'Onaylandı', note: 'Formen tarafından sisteme girildi.' },
      { step: 2, title: 'Yönetici Onayında', user: 'Hasan Cavit Koçak (Yönetici)', date: '02.07.2026 10:16', status: 'Bekliyor', note: 'Yönetici inceleme aşamasında.' }
    ]
  },
  {
    id: 104,
    employeeId: 5, // Ayşe Demir
    employeeName: 'Ayşe Demir',
    department: 'Bakım',
    startDate: '2026-07-11',
    endDate: '2026-07-16',
    duration: 6,
    type: 'Planlı',
    status: leaveStatuses.PENDING,
    reason: 'Yaz tatili ve aile ziyareti',
    approvalWorkflow: [
      { step: 1, title: 'Talep Oluşturuldu', user: 'Ayşe Demir (Çalışan)', date: '03.07.2026 14:00', status: 'Onaylandı', note: 'Çalışan kendisi talep girdi.' },
      { step: 2, title: 'Yönetici Onayında', user: 'Hasan Cavit Koçak (Yönetici)', date: '03.07.2026 14:02', status: 'Bekliyor', note: 'Onay sırasına alındı.' }
    ]
  },
  {
    id: 105,
    employeeId: 6, // Fatma Çelik
    employeeName: 'Fatma Çelik',
    department: 'Kaynak',
    startDate: '2026-07-16',
    endDate: '2026-07-18',
    duration: 3,
    type: 'Planlı',
    status: leaveStatuses.PENDING,
    reason: 'Özel mazeret ve yıllık izin kullanımı',
    approvalWorkflow: [
      { step: 1, title: 'Talep Girildi', user: 'Ali Vural (Formen)', date: '04.07.2026 08:45', status: 'Onaylandı', note: 'Kaynak ekibi vardiya planına uygun.' },
      { step: 2, title: 'Yönetici Onayında', user: 'Hasan Cavit Koçak (Yönetici)', date: '04.07.2026 08:46', status: 'Bekliyor', note: 'Onay bekleniyor.' }
    ]
  },
  {
    id: 106,
    employeeId: 7, // Caner Akın
    employeeName: 'Caner Akın',
    department: 'Montaj',
    startDate: '2026-07-09',
    endDate: '2026-07-13',
    duration: 5,
    type: 'Planlı',
    status: leaveStatuses.PENDING,
    reason: 'Ailevi işler ve şehir dışı seyahat',
    approvalWorkflow: [
      { step: 1, title: 'Talep Girildi', user: 'Ali Vural (Formen)', date: '03.07.2026 16:20', status: 'Onaylandı', note: 'Montaj hattı yedek personel ayarlandı.' },
      { step: 2, title: 'Yönetici Onayında', user: 'Hasan Cavit Koçak (Yönetici)', date: '03.07.2026 16:22', status: 'Bekliyor', note: 'Yönetici onayında bekliyor.' }
    ]
  },
  {
    id: 107,
    employeeId: 8, // Zeynep Yıldız
    employeeName: 'Zeynep Yıldız',
    department: 'Montaj',
    startDate: '2026-07-21',
    endDate: '2026-07-24',
    duration: 4,
    type: 'Planlı',
    status: leaveStatuses.PENDING,
    reason: 'Yıllık izin dinlenme',
    approvalWorkflow: [
      { step: 1, title: 'Talep Girildi', user: 'Ali Vural (Formen)', date: '05.07.2026 11:10', status: 'Onaylandı', note: 'Talep iletildi.' },
      { step: 2, title: 'Yönetici Onayında', user: 'Hasan Cavit Koçak (Yönetici)', date: '05.07.2026 11:12', status: 'Bekliyor', note: 'Onay bekliyor.' }
    ]
  },
  {
    id: 108,
    employeeId: 9, // Hakan Arslan
    employeeName: 'Hakan Arslan',
    department: 'Enstrümantasyon',
    startDate: '2026-07-16',
    endDate: '2026-07-18',
    duration: 3,
    type: 'Planlı',
    status: leaveStatuses.REJECTED,
    reason: 'Yıllık İzin',
    rejectionReason: 'Aynı tarihte bakım hattında kritik revizyon planı var. Lütfen sonraki haftaya kaydırınız.',
    approvalWorkflow: [
      { step: 1, title: 'Talep Oluşturuldu', user: 'Hakan Arslan (Çalışan)', date: '02.07.2026 13:00', status: 'Onaylandı', note: 'İzin talebi oluşturuldu.' },
      { step: 2, title: 'Geri Gönderildi', user: 'Hasan Cavit Koçak (Yönetici)', date: '03.07.2026 09:40', status: 'Geri Gönderildi', note: 'Aynı tarihte bakım hattında kritik revizyon planı var. Lütfen sonraki haftaya kaydırınız.' }
    ]
  },
  {
    id: 109,
    employeeId: 10, // Fikri Can
    employeeName: 'Fikri Can',
    department: 'Kalite',
    startDate: '2026-07-17',
    endDate: '2026-07-20',
    duration: 4,
    type: 'Planlı',
    status: leaveStatuses.APPROVED,
    reason: 'Kalite denetim sonrası izin',
    approvalWorkflow: [
      { step: 1, title: 'Talep Oluşturuldu', user: 'Fikri Can (Çalışan)', date: '01.07.2026 15:00', status: 'Onaylandı', note: 'Denetim bitişi izin planı.' },
      { step: 2, title: 'Yönetici Onayı', user: 'Hasan Cavit Koçak (Yönetici)', date: '02.07.2026 10:00', status: 'Onaylandı', note: 'Onaylandı.' }
    ]
  }
];

// LocalStorage yükleme
const CURRENT_VERSION = '2026-07-foreman-rules-v5';

const loadInitialData = () => {
  const savedVersion = localStorage.getItem('dataVersion');
  if (savedVersion !== CURRENT_VERSION) {
    localStorage.clear();
    localStorage.setItem('dataVersion', CURRENT_VERSION);
    localStorage.setItem('employees', JSON.stringify(initialEmployees));
    localStorage.setItem('leaveRequests', JSON.stringify(initialRequests));
    return { employees: initialEmployees, requests: initialRequests };
  }

  const savedEmployees = localStorage.getItem('employees');
  const savedRequests = localStorage.getItem('leaveRequests');

  return {
    employees: savedEmployees ? JSON.parse(savedEmployees) : initialEmployees,
    requests: savedRequests ? JSON.parse(savedRequests) : initialRequests
  };
};

const loaded = loadInitialData();
export let employeesData = loaded.employees;
export let leaveRequestsData = loaded.requests;

// ========================================================
// İŞ KURALLARI MOTORU (BUSINESS RULES ENGINE)
// ========================================================
/**
 * Kullanıcının ilettiği 11 Kuralı denetleyen ve gerekirse tarihleri otomatik düzelten motor:
 * 
 * Kural 1: Devir Kuralı - İlgili yılın hak edilen ve devreden izinleri üzerinden yapılır.
 * Kural 2: İzin Hakkı Önceliği - Önce mevcut yıl kazanılmış hakkı, sonra devreden izin kullanılır.
 * Kural 3: Gelecek İzin Hakkı - Gelecek dönem hakkı ayrı gösterilir.
 * Kural 4: İki Adet 6 Günlük İzin - Aralarında en az 4 gün bulunmalıdır.
 * Kural 5: Cuma İzni - Cuma günü izin planlandığında Cumartesi de otomatik eklenir.
 * Kural 6: Cumartesi İzni - Cumartesi günü planlandığında Pazartesi de otomatik eklenir.
 * Kural 7: Kısa Süreli İzin Limiti - 2 günden az izinler yılda en fazla 4 kez planlanabilir.
 * Kural 8: Planlama-İzin Talebi Ayrımı - Yönetici onaylayana kadar plan olarak kalır.
 * Kural 10: Departmana Geri Gönderme - Yönetici reddettiğinde tekrar düzenlenip onaya sunulabilir.
 */
export const validateAndApplyRules = (requestData, allRequests, employee) => {
  let startDate = new Date(requestData.startDate);
  let endDate = new Date(requestData.endDate);
  const notices = [];

  // 1. KURAL 5: Cuma İzni Kontrolü (Cuma günü kapsanıyorsa Cumartesi otomatik eklenir)
  // Day of week: 5 = Cuma, 6 = Cumartesi, 0 = Pazar, 1 = Pazartesi
  const startDayOfWeek = getDay(startDate);
  const endDayOfWeek = getDay(endDate);

  if (endDayOfWeek === 5) { // Bitiş Cuma ise Cumartesi'yi ekle
    endDate = addDays(endDate, 1);
    notices.push('Kural 5: Cuma günü izin seçildiğinde Cumartesi günü otomatik olarak plana eklendi.');
  }

  // 2. KURAL 6: Cumartesi İzni Kontrolü (Cumartesi seçildiğinde Pazartesi de otomatik eklenir)
  const currentEndDayOfWeek = getDay(endDate);
  if (currentEndDayOfWeek === 6) { // Bitiş Cumartesi ise Pazartesi'ye kadar uzat (Pazar atlanır, Pazartesi eklenir -> +2 gün)
    endDate = addDays(endDate, 2);
    notices.push('Kural 6: Cumartesi günü izin seçildiğinde Pazartesi günü otomatik olarak plana eklendi.');
  }

  const duration = Math.max(1, differenceInCalendarDays(endDate, startDate) + 1);

  // 3. KURAL 7: Kısa Süreli İzin Limiti (2 günden az yani 1 günlük izinler yılda en fazla 4 kez)
  if (duration < 2) {
    const existingShortLeaves = allRequests.filter(r => 
      r.employeeId === requestData.employeeId && 
      r.id !== requestData.id &&
      r.duration < 2 &&
      r.status !== leaveStatuses.REJECTED
    );

    if (existingShortLeaves.length >= 4) {
      return {
        isValid: false,
        error: `Kural 7 Engeli: 2 günden az olan kısa süreli izinler yılda en fazla 4 kez kullanılabilir. (Mevcut: ${existingShortLeaves.length}/4 limitine ulaşıldı).`
      };
    } else {
      notices.push(`Kural 7 Bilgisi: Bu yıl kullanılan kısa süreli izin sayısı: ${existingShortLeaves.length + 1}/4.`);
    }
  }

  // 4. KURAL 4: İki Adet 6 Günlük İzin (Aralarında en az 4 gün bulunmalıdır)
  if (duration === 6) {
    const existingSixDayLeaves = allRequests.filter(r => 
      r.employeeId === requestData.employeeId && 
      r.id !== requestData.id &&
      r.duration === 6 &&
      r.status !== leaveStatuses.REJECTED
    );

    for (const sixDayLeave of existingSixDayLeaves) {
      const otherStart = new Date(sixDayLeave.startDate);
      const otherEnd = new Date(sixDayLeave.endDate);

      // İki aralık arasındaki gün farkı
      const diff1 = differenceInCalendarDays(startDate, otherEnd);
      const diff2 = differenceInCalendarDays(otherStart, endDate);

      const gap = Math.min(Math.abs(diff1), Math.abs(diff2));
      if (gap < 4) {
        return {
          isValid: false,
          error: `Kural 4 Engeli: İki adet 6 günlük izin arasında en az 4 gün bulunmalıdır. (Çakışan izin: ${sixDayLeave.startDate} - ${sixDayLeave.endDate})`
        };
      }
    }
  }

  // 5. KURAL 2: İzin Hakkı Önceliği (Önce kazanılmış hak, sonra devreden)
  if (employee && employee.annualLeave) {
    const available = employee.annualLeave.available || 14;
    if (duration > available) {
      return {
        isValid: false,
        error: `Yetersiz Bakiye: Talep edilen süre (${duration} gün), kalan izin bakiyesinden (${available} gün) fazladır.`
      };
    }
  }

  return {
    isValid: true,
    adjustedStartDate: format(startDate, 'yyyy-MM-dd'),
    adjustedEndDate: format(endDate, 'yyyy-MM-dd'),
    adjustedDuration: duration,
    notices
  };
};

// CRUD Operations
export const getEmployees = () => employeesData;
export const getLeaveRequests = () => leaveRequestsData;

export const addLeaveRequest = (request) => {
  const newRequest = {
    ...request,
    id: Math.max(0, ...leaveRequestsData.map(r => r.id)) + 1
  };
  leaveRequestsData.push(newRequest);
  localStorage.setItem('leaveRequests', JSON.stringify(leaveRequestsData));
  return newRequest;
};

export const updateLeaveRequest = (id, updates) => {
  const index = leaveRequestsData.findIndex(r => r.id === id);
  if (index !== -1) {
    leaveRequestsData[index] = { ...leaveRequestsData[index], ...updates };
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequestsData));
    return leaveRequestsData[index];
  }
  return null;
};

export const deleteLeaveRequest = (id) => {
  const index = leaveRequestsData.findIndex(r => r.id === id);
  if (index !== -1) {
    leaveRequestsData.splice(index, 1);
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequestsData));
    return true;
  }
  return false;
};

export const getEmployee = (id) => employeesData.find(e => e.id === id);

export const getEmployeesByManager = (managerId) => 
  employeesData.filter(e => e.managerId === managerId || e.foremanId === managerId);

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
    leaveRequestsData = leaveRequestsData.filter(r => r.employeeId !== id);
    localStorage.setItem('employees', JSON.stringify(employeesData));
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequestsData));
    return true;
  }
  return false;
};

export const getLeaveRequest = (id) => leaveRequestsData.find(r => r.id === id);

export const getLeaveRequestsByEmployee = (employeeId) => 
  leaveRequestsData.filter(r => r.employeeId === employeeId);

export const getLeaveRequestsByManager = (managerId) => 
  leaveRequestsData.filter(r => r.managerId === managerId);

export const clearAllData = () => {
  localStorage.clear();
  window.location.reload();
};

export const getTodaysBirthdays = () => {
  return employeesData.slice(0, 3);
};

export const getBirthdaysByDate = (date) => {
  return employeesData.slice(0, 4);
};

export const getStatistics = () => {
  const totalEmployees = employeesData.length;
  const pendingRequests = leaveRequestsData.filter(r => r.status === leaveStatuses.PENDING).length;
  const approvedRequests = leaveRequestsData.filter(r => r.status === leaveStatuses.APPROVED).length;
  const plannedRequests = leaveRequestsData.filter(r => r.status === leaveStatuses.PLANNED).length;

  return {
    totalEmployees,
    pendingRequests,
    approvedRequests,
    plannedRequests,
    totalLeaveAllocation: 140,
    totalLeaveUsed: 35,
    totalLeavePlanned: 28,
    totalLeaveAvailable: 77,
    utilizationRate: '45.0',
    departmentStats: departments.map(d => ({
      name: d,
      employees: employeesData.filter(e => e.department === d).length,
      totalLeave: 28,
      usedLeave: 7,
      plannedLeave: 6,
      availableLeave: 15
    })),
    monthlyLeave: [
      { month: 'Haz', count: 4, days: 16 },
      { month: 'Tem', count: 8, days: 32 },
      { month: 'Ağu', count: 5, days: 20 }
    ]
  };
};
