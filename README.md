# İzin Yönetim Sistemi

Modern, Apple tarzında premium tasarıma sahip, tam sayfa responsive İzin Yönetim Sistemi.

## Tamamlanan İzin Yönetim Sistemi

### Tasarım Özellikleri
- **Apple-inspired premium tasarım** - Minimalist, modern ve şık
- **Tam responsive** - Mobile, tablet ve desktop uyumlu
- **Smooth animasyonlar** - Profesyonel geçişler ve efektler
- **Lucide React icons** - Emoji yerine profesyonel icon library
- **Gradient ve glassmorphism** - Modern UI efektleri

### Sayfalar ve Özellikler

#### 1. **Dashboard** (`http://localhost:3000`)
- Bugün doğum günü olanlar için özel banner
- 4 istatistik kartı (Toplam çalışan, bekleyen talepler, onaylanan izinler, kullanım oranı)
- Aylık izin dağılımı bar chart
- Departman bazlı kullanım grafiği
- İzin durumu pie chart
- Son aktiviteler
- Hızlı erişim butonları

#### 2. **İzin Planlama** (`#/planning`)
- İnteraktif takvim görünümü
- Otomatik planlama önerisi banner
- Özet istatistik kartları
- Departman ve durum filtreleme
- Yeni izin planı modal (CRUD)
- Onay/Red işlemleri
- Detaylı talep tablosu

#### 3. **Çalışanlar** (`#/employees`)
- Kart görünümü
- Liste görünümü
- Gelişmiş arama ve filtreleme
- Yeni çalışan ekleme (CRUD)
- Çalışan düzenleme
- Çalışan silme
- Yönetici badge'i
- İzin bakiyesi gösterimi

#### 4. **Raporlar** (`#/reports`)
- 4 rapor kategorisi kartı
- ReactFlow ile izin onay süreci flowchart
- Departman istatistikleri tablosu
- Aylık trend line chart
- İzin dağılımı pie chart
- En çok izin kullanan departmanlar bar chart
- Export butonları (PDF/Excel mock)

#### 5. **Ayarlar** (`#/settings`)
- Profil bilgileri
- Bildirim tercihleri (toggle switch)
- Sistem ayarları (dil, tema, tarih formatı)
- İzin yönetimi kuralları
- Güvenlik ve şifre değiştirme

### Teknik Özellikler

### Gereksinimler
- Node.js 16+ 
- npm veya yarn

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda açın: `http://localhost:3000`

## Kullanılan Teknolojiler

- **React 18**: UI framework
- **Vite**: Build tool ve dev server
- **Lucide React**: Icon library
- **Recharts**: Grafik ve chart library
- **React Big Calendar**: Takvim bileşeni
- **ReactFlow**: Flowchart ve diagram
- **date-fns**: Tarih işlemleri
- **CSS3**: Modern styling (CSS Grid, Flexbox, Animations)

## Renk Paleti

```css
--primary: #007AFF (Apple Blue)
--secondary: #5856D6 (Purple)
--success: #34C759 (Green)
--warning: #FF9500 (Orange)
--danger: #FF3B30 (Red)
--info: #5AC8FA (Light Blue)
```

## Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## Proje Yapısı

```
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Ana layout
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Dashboard.jsx       # Ana sayfa
│   │   ├── Planning.jsx        # İzin planlama
│   │   ├── Employees.jsx       # Çalışan yönetimi
│   │   ├── Reports.jsx         # Raporlar
│   │   └── Settings.jsx        # Ayarlar
│   ├── data/
│   │   └── mockData.js         # Mock data ve CRUD işlemleri
│   ├── App.jsx                 # Ana uygulama
│   ├── main.jsx                # Entry point
│   └── index.css               # Global stiller
├── index.html
├── package.json
└── vite.config.js
```

## Veri Yönetimi

Uygulama mock data kullanır. Tüm CRUD işlemler çalışır durumda:

- **getEmployees()**: Tüm çalışanları getir
- **addEmployee()**: Yeni çalışan ekle
- **updateEmployee()**: Çalışan güncelle
- **deleteEmployee()**: Çalışan sil
- **getLeaveRequests()**: İzin taleplerini getir
- **addLeaveRequest()**: Yeni izin talebi
- **updateLeaveRequest()**: İzin talebi güncelle
- **deleteLeaveRequest()**: İzin talebi sil
- **getTodaysBirthdays()**: Bugün doğanlar
- **getStatistics()**: İstatistikler

## İzin Akışı

1. Çalışan izin talebi oluşturur
2. Sistem bakiye kontrolü yapar
3. Yeterli bakiye varsa üst amire gönderilir
4. Üst amir onaylar/reddeder
5. Onaylanan izinler takvimde gösterilir
6. Zamanı geçen planlar otomatik pasif hale gelir

## Öne Çıkan Özellikler

### Dashboard'da
- Bugün doğum günü olanlar için özel banner
- Canlı istatistikler ve grafikler
- Hızlı erişim kartları

### İzin Planlama'da
- İnteraktif takvim görünümü
- Departman ve durum filtreleme
- Toplu izin görüntüleme
- Modal ile hızlı izin ekleme/düzenleme

### Çalışanlar'da
- Kart/Liste görünüm geçişi
- Gelişmiş arama ve filtreleme
- İzin bakiyesi gösterimi
- Yönetici badge'i

### Raporlar'da
- ReactFlow ile izin onay süreci diyagramı
- Departman bazlı detaylı analizler
- Aylık trend grafikleri
- Export özelliği (mock)

## Güvenlik

- Üst amir sadece kendi ekibini görebilir
- CRUD işlemleri kontrollü
- Şifre güncelleme özelliği

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## Geliştirici Notları

- Tüm CRUD işlemler memory-based çalışır (sayfa yenilendiğinde sıfırlanır)
- Gerçek backend entegrasyonu için `mockData.js` dosyasındaki fonksiyonları API çağrılarıyla değiştirin
- Otomatik planlama özelliği placeholder olarak bırakılmıştır
- Export fonksiyonları mock olarak eklenmiştir

## Tasarım Kararları

1. **Apple Tarzı**: Minimalist, temiz, premium hissi
2. **Glassmorphism**: Modern, şeffaf efektler
3. **Smooth Animations**: 250ms geçişler, scale ve translateY efektleri
4. **Color System**: Anlamlı renkler (success=yeşil, danger=kırmızı)
5. **Typography**: Inter font family, hierarchy
6. **Spacing**: Consistent spacing scale (8px base)
7. **Icons**: Lucide React (SVG, scalable)
8. **Responsive**: Mobile-first yaklaşım

---

## Önemli Notlar

- **Tarih**: Uygulama Haziran 2026 tarihli verilerle çalışmaktadır (demo amaçlı)
- **Bugünün Tarihi**: 18 Haziran 2026 Perşembe
- **Veri Kalıcılığı**: Tüm veriler localStorage'da saklanır
- **Veri Sıfırlama**: `clear-data.html` dosyasını açarak verileri sıfırlayabilirsiniz
- **İlk Kurulum**: İlk çalıştırmada 1000 çalışan ve izin verileri otomatik oluşturulur

## Veri Sıfırlama ve Güncelleme

### Otomatik Versiyon Kontrolü
Uygulama her açılışta veri versiyonunu kontrol eder. Eğer eski versiyon tespit edilirse, otomatik olarak Haziran 2026 verileriyle güncellenir.

### Manuel Veri Sıfırlama

**Yöntem 1: Web Arayüzü**
1. Tarayıcıda `http://localhost:3000/clear-data.html` adresini açın
2. "Verileri Sıfırla ve Yeniden Başlat" butonuna tıklayın
3. Otomatik olarak ana sayfaya yönlendirileceksiniz
4. Yeni Haziran 2026 verileri oluşturulacak

**Yöntem 2: Tarayıcı Konsolu**
```javascript
localStorage.clear();
location.reload();
```

**Yöntem 3: Geliştirici Konsolu (Debug)**
```javascript
// Import clearAllData fonksiyonu
import { clearAllData } from './src/data/mockData';
clearAllData();
```

### Veri Versiyonu
- **Mevcut Versiyon**: `2026-06` (Haziran 2026)
- **localStorage Anahtarı**: `dataVersion`
- Versiyon uyumsuzluğunda otomatik güncelleme yapılır
