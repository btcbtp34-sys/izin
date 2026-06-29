// Bu scripti console'a yapıştırarak localStorage'ı temizleyin
console.log('%c🧹 LocalStorage Temizleniyor...', 'color: #FF9500; font-size: 16px; font-weight: bold;');
localStorage.clear();
console.log('%c✅ Temizlendi! Sayfa yenileniyor...', 'color: #34C759; font-size: 16px; font-weight: bold;');
setTimeout(() => {
  window.location.reload();
}, 1000);
