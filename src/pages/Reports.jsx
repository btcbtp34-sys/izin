import React, { useCallback } from 'react';
import {
  BarChart3, FileText, Users, Calendar, Download, 
  TrendingUp, PieChart, ArrowRight, Play, Square, 
  CheckCircle, XCircle, GitBranch
} from 'lucide-react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getStatistics } from '../data/mockData';
import './Reports.css';

const CustomNode = ({ data }) => {
  return (
    <div className={`custom-node ${data.type}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-content">
        <div className="node-icon">
          {data.icon}
        </div>
        <div className="node-title">{data.label}</div>
        {data.subtitle && <div className="node-subtitle">{data.subtitle}</div>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode
};

const Reports = () => {
  const stats = getStatistics();

  const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5AC8FA', '#5856D6'];

  // Flow chart data for leave approval process
  const initialNodes = [
    {
      id: '1',
      type: 'custom',
      data: { 
        label: 'Başlangıç',
        subtitle: 'İzin Talebi',
        type: 'start',
        icon: <Play size={16} />
      },
      position: { x: 400, y: 20 },
      draggable: true
    },
    {
      id: '2',
      type: 'custom',
      data: { 
        label: 'Talep Oluştur',
        subtitle: 'Çalışan',
        type: 'process',
        icon: <FileText size={16} />
      },
      position: { x: 400, y: 140 },
      draggable: true
    },
    {
      id: '3',
      type: 'custom',
      data: { 
        label: 'İzin Kontrolü',
        subtitle: 'Sistem',
        type: 'process',
        icon: <Calendar size={16} />
      },
      position: { x: 400, y: 260 },
      draggable: true
    },
    {
      id: '4',
      type: 'custom',
      data: { 
        label: 'Yeterli Bakiye?',
        type: 'decision',
        icon: <GitBranch size={16} />
      },
      position: { x: 400, y: 380 },
      draggable: true
    },
    {
      id: '5',
      type: 'custom',
      data: { 
        label: 'Yönetici Onayı',
        subtitle: 'Üst Amir',
        type: 'process',
        icon: <Users size={16} />
      },
      position: { x: 650, y: 380 },
      draggable: true
    },
    {
      id: '6',
      type: 'custom',
      data: { 
        label: 'Red',
        subtitle: 'Yetersiz Bakiye',
        type: 'end',
        icon: <XCircle size={16} />
      },
      position: { x: 150, y: 380 },
      draggable: true
    },
    {
      id: '7',
      type: 'custom',
      data: { 
        label: 'Onaylı mı?',
        type: 'decision',
        icon: <GitBranch size={16} />
      },
      position: { x: 650, y: 530 },
      draggable: true
    },
    {
      id: '8',
      type: 'custom',
      data: { 
        label: 'İzin Onaylandı',
        subtitle: 'Başarılı',
        type: 'end',
        icon: <CheckCircle size={16} />
      },
      position: { x: 850, y: 530 },
      draggable: true
    },
    {
      id: '9',
      type: 'custom',
      data: { 
        label: 'İzin Reddedildi',
        subtitle: 'Başarısız',
        type: 'end',
        icon: <XCircle size={16} />
      },
      position: { x: 450, y: 530 },
      draggable: true
    }
  ];

  const initialEdges = [
    { 
      id: 'e1-2', 
      source: '1', 
      target: '2', 
      animated: true, 
      style: { stroke: '#007AFF', strokeWidth: 2 },
      type: 'smoothstep'
    },
    { 
      id: 'e2-3', 
      source: '2', 
      target: '3', 
      animated: true, 
      style: { stroke: '#007AFF', strokeWidth: 2 },
      type: 'smoothstep'
    },
    { 
      id: 'e3-4', 
      source: '3', 
      target: '4', 
      animated: true, 
      style: { stroke: '#007AFF', strokeWidth: 2 },
      type: 'smoothstep'
    },
    { 
      id: 'e4-5', 
      source: '4', 
      target: '5', 
      label: 'Evet', 
      style: { stroke: '#34C759', strokeWidth: 2 },
      labelStyle: { fill: '#34C759', fontWeight: 600 },
      type: 'smoothstep'
    },
    { 
      id: 'e4-6', 
      source: '4', 
      target: '6', 
      label: 'Hayır', 
      style: { stroke: '#FF3B30', strokeWidth: 2 },
      labelStyle: { fill: '#FF3B30', fontWeight: 600 },
      type: 'smoothstep'
    },
    { 
      id: 'e5-7', 
      source: '5', 
      target: '7', 
      animated: true, 
      style: { stroke: '#007AFF', strokeWidth: 2 },
      type: 'smoothstep'
    },
    { 
      id: 'e7-8', 
      source: '7', 
      target: '8', 
      label: 'Evet', 
      style: { stroke: '#34C759', strokeWidth: 2 },
      labelStyle: { fill: '#34C759', fontWeight: 600 },
      type: 'smoothstep'
    },
    { 
      id: 'e7-9', 
      source: '7', 
      target: '9', 
      label: 'Hayır', 
      style: { stroke: '#FF3B30', strokeWidth: 2 },
      labelStyle: { fill: '#FF3B30', fontWeight: 600 },
      type: 'smoothstep'
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  console.log('ReactFlow Nodes:', nodes.length);
  console.log('ReactFlow Edges:', edges.length);

  const handleExport = (type) => {
    alert(`${type} formatında rapor indirme özelliği yakında eklenecek!`);
  };

  return (
    <div className="reports-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Raporlar</h1>
        <p className="page-subtitle">Detaylı izin analizleri ve istatistikler</p>
      </div>

      {/* Report Cards */}
      <div className="report-cards">
        <div className="report-card primary">
          <div className="report-card-icon">
            <BarChart3 size={32} />
          </div>
          <h3 className="report-card-title">Genel Özet Raporu</h3>
          <p className="report-card-description">
            Tüm departmanlar ve çalışanlar için kapsamlı izin kullanım raporu
          </p>
          <div className="report-card-meta">
            <span className="report-card-date">Son güncelleme: Bugün</span>
            <div className="report-card-arrow">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        <div className="report-card success">
          <div className="report-card-icon">
            <Users size={32} />
          </div>
          <h3 className="report-card-title">Departman Analizi</h3>
          <p className="report-card-description">
            Departman bazında detaylı izin kullanım ve planlama analizi
          </p>
          <div className="report-card-meta">
            <span className="report-card-date">Son güncelleme: Bugün</span>
            <div className="report-card-arrow">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        <div className="report-card warning">
          <div className="report-card-icon">
            <TrendingUp size={32} />
          </div>
          <h3 className="report-card-title">Trend Analizi</h3>
          <p className="report-card-description">
            Aylık izin kullanım trendleri ve gelecek tahminleri
          </p>
          <div className="report-card-meta">
            <span className="report-card-date">Son güncelleme: Bugün</span>
            <div className="report-card-arrow">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        <div className="report-card info">
          <div className="report-card-icon">
            <PieChart size={32} />
          </div>
          <h3 className="report-card-title">Dağılım Raporu</h3>
          <p className="report-card-description">
            İzin durumlarının ve kullanımın yüzdelik dağılımları
          </p>
          <div className="report-card-meta">
            <span className="report-card-date">Son güncelleme: Bugün</span>
            <div className="report-card-arrow">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Process Flow */}
      <div className="process-flow">
        <div className="report-header">
          <div className="report-header-left">
            <div className="report-icon">
              <GitBranch size={24} />
            </div>
            <div>
              <h2 className="report-header-title">İzin Onay Süreci</h2>
              <p className="report-header-subtitle">Adım adım izin talep ve onay akışı</p>
            </div>
          </div>
          <div className="export-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('PNG')}>
              <Download size={16} />
              PNG
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('PDF')}>
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>
        <div className="flow-container">
          {nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3, maxZoom: 0.9 }}
              minZoom={0.3}
              maxZoom={1.2}
              defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
              attributionPosition="bottom-right"
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#E5E7EB" gap={20} size={1} />
              <Controls showInteractive={false} />
              <MiniMap 
                nodeStrokeWidth={3}
                nodeColor={(node) => {
                  switch(node.data.type) {
                    case 'start': return '#34C759';
                    case 'process': return '#007AFF';
                    case 'decision': return '#FF9500';
                    case 'end': return '#FF3B30';
                    default: return '#6B7280';
                  }
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
                position="bottom-right"
              />
            </ReactFlow>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'var(--text-secondary)'
            }}>
              Akış şeması yükleniyor...
            </div>
          )}
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="detailed-reports">
        {/* Department Stats */}
        <div className="detailed-report">
          <div className="report-header">
            <div className="report-header-left">
              <div className="report-icon">
                <Users size={24} />
              </div>
              <div>
                <h2 className="report-header-title">Departman İstatistikleri</h2>
                <p className="report-header-subtitle">İzin kullanım detayları</p>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('Excel')}>
              <Download size={16} />
              Excel
            </button>
          </div>
          <div className="department-table">
            {stats.departmentStats.slice(0, 6).map((dept, index) => (
              <div key={index} className="department-row">
                <div className="department-info">
                  <h4 className="department-name">{dept.name}</h4>
                  <p className="department-count">{dept.employees} çalışan</p>
                </div>
                <div className="department-stats">
                  <div className="department-stat">
                    <div className="department-stat-value">{dept.totalLeave}</div>
                    <div className="department-stat-label">Toplam</div>
                  </div>
                  <div className="department-stat">
                    <div className="department-stat-value" style={{ color: 'var(--warning)' }}>
                      {dept.usedLeave}
                    </div>
                    <div className="department-stat-label">Kullanılan</div>
                  </div>
                  <div className="department-stat">
                    <div className="department-stat-value" style={{ color: 'var(--success)' }}>
                      {dept.availableLeave}
                    </div>
                    <div className="department-stat-label">Mevcut</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="detailed-report">
          <div className="report-header">
            <div className="report-header-left">
              <div className="report-icon">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="report-header-title">Aylık Trend</h2>
                <p className="report-header-subtitle">İzin kullanım grafiği</p>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('PDF')}>
              <Download size={16} />
              PDF
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyLeave}>
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
              <Line 
                type="monotone" 
                dataKey="days" 
                stroke="#007AFF" 
                strokeWidth={3}
                name="İzin Günü"
                dot={{ fill: '#007AFF', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="detailed-reports">
        {/* Leave Distribution */}
        <div className="detailed-report">
          <div className="report-header">
            <div className="report-header-left">
              <div className="report-icon">
                <PieChart size={24} />
              </div>
              <div>
                <h2 className="report-header-title">İzin Dağılımı</h2>
                <p className="report-header-subtitle">Durum bazlı analiz</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
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
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Departments */}
        <div className="detailed-report">
          <div className="report-header">
            <div className="report-header-left">
              <div className="report-icon">
                <BarChart3 size={24} />
              </div>
              <div>
                <h2 className="report-header-title">En Çok İzin Kullanan</h2>
                <p className="report-header-subtitle">Departman sıralaması</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={stats.departmentStats
                .sort((a, b) => b.usedLeave - a.usedLeave)
                .slice(0, 6)
              }
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#6B7280"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }} 
              />
              <Bar 
                dataKey="usedLeave" 
                fill="#FF9500" 
                name="Kullanılan İzin"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
