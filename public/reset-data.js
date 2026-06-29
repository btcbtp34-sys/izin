// Reset localStorage and reload with June 2026 data
console.log('Clearing old data and resetting to June 2026...');
localStorage.removeItem('employees');
localStorage.removeItem('leaveRequests');
console.log('Data cleared! Reloading page...');
window.location.href = '/';
