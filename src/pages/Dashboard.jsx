import React from 'react';
import { 
  Users, Calendar, CheckCircle, Clock, TrendingUp, 
  Cake, Gift, ArrowUp, ArrowDown, CalendarPlus, FileText,
  BarChart3, UserPlus
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getTodaysBirthdays, getStatistics } from '../data/mockData';
import './Dashboard.css';

const Dashboard = () => {
  const birthdays = getTodaysBirthdays();
  const stats = getStatistics();

  const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5AC8FA', '#5856D6'];

  // Recent activities mock data - June 2026
  const recentActivities = [
    {
      type: 'approved',
      title: 'İzin Onaylandı',
      description: 'Ahmet Yılmaz\'ın 5 günlük izin talebi onaylandı',
      time: '2 saat önce'
    },
    {
      type: 'pending',
      title: 'Yeni İzin Talebi',
      description: 'Ayşe Demir 3 günlük izin talep etti',
      time: '4 saat önce'
    },
    {
      type: 'approved',
      title: 'Plan Tamamlandı',
      description: 'Bilgi Teknolojileri departmanı Haziran planını tamamladı',
      time: '1 gün önce'
    },
    {
      type: 'rejected',
      title: 'İzin Reddedildi',
      description: 'Mehmet Kaya\'nın izin talebi reddedildi',
      time: '2 gün önce'
    }
  ];

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">İzin yönetim sistemi genel görünümü</p>
      </div>


      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon primary">
              <Users size={24} />
            </div>
          </div>
          <h2 className="stat-value">{stats.totalEmployees}</h2>
          <p className="stat-label">Toplam Çalışan</p>
          <div className="stat-change positive">
            <ArrowUp size={14} />
            <span>+12 bu ay</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon warning">
              <Clock size={24} />
            </div>
          </div>
          <h2 className="stat-value">{stats.pendingRequests}</h2>
          <p className="stat-label">Bekleyen Talepler</p>
          <div className="stat-change negative">
            <ArrowDown size={14} />
            <span>-5 geçen haftaya göre</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon success">
              <CheckCircle size={24} />
            </div>
          </div>
          <h2 className="stat-value">{stats.approvedRequests}</h2>
          <p className="stat-label">Onaylanan İzinler</p>
          <div className="stat-change positive">
            <ArrowUp size={14} />
            <span>+24 bu ay</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon info">
              <Calendar size={24} />
            </div>
          </div>
          <h2 className="stat-value">%{stats.utilizationRate}</h2>
          <p className="stat-label">İzin Kullanım Oranı</p>
          <div className="stat-change positive">
            <TrendingUp size={14} />
            <span>Optimal seviye</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Monthly Leave Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Aylık İzin Dağılımı</h3>
              <p className="chart-subtitle">2026 yılı izin kullanım trendi</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyLeave}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="days" fill="#007AFF" name="İzin Günü" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Departman Bazlı İzin Kullanımı</h3>
              <p className="chart-subtitle">Toplam ve kullanılan izin günleri</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.departmentStats.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="totalLeave" fill="#5AC8FA" name="Toplam İzin" radius={[8, 8, 0, 0]} />
              <Bar dataKey="usedLeave" fill="#34C759" name="Kullanılan" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leave Status Pie Chart */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">İzin Durumu Dağılımı</h3>
              <p className="chart-subtitle">Toplam izin hak edişi ve kullanım</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Kullanılan', value: stats.totalLeaveUsed },
                  { name: 'Planlanan', value: stats.totalLeavePlanned },
                  { name: 'Mevcut', value: stats.totalLeaveAvailable }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1, 2].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <div className="chart-header">
            <h3 className="chart-title">Son Aktiviteler</h3>
            <p className="chart-subtitle">Sistemdeki güncel hareketler</p>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'approved' && <CheckCircle size={20} />}
                  {activity.type === 'pending' && <Clock size={20} />}
                  {activity.type === 'rejected' && <Calendar size={20} />}
                </div>
                <div className="activity-details">
                  <h4 className="activity-title">{activity.title}</h4>
                  <p className="activity-description">{activity.description}</p>
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <a href="#/planning" className="quick-action">
          <div className="quick-action-icon">
            <CalendarPlus size={28} />
          </div>
          <h4 className="quick-action-title">Yeni İzin Planla</h4>
        </a>
        <a href="#/employees" className="quick-action">
          <div className="quick-action-icon">
            <UserPlus size={28} />
          </div>
          <h4 className="quick-action-title">Çalışan Ekle</h4>
        </a>
        <a href="#/reports" className="quick-action">
          <div className="quick-action-icon">
            <FileText size={28} />
          </div>
          <h4 className="quick-action-title">Rapor Oluştur</h4>
        </a>
        <a href="#/reports" className="quick-action">
          <div className="quick-action-icon">
            <BarChart3 size={28} />
          </div>
          <h4 className="quick-action-title">İstatistikler</h4>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
