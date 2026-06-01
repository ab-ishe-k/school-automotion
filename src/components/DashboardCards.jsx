import React from 'react';
import { Calendar, MessageSquare, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      themeClass: 'primary',
      trendText: 'Approved & Pending',
      trendUp: true
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingAppointments,
      icon: Calendar,
      themeClass: 'warning',
      trendText: 'Require action',
      trendUp: false
    },
    {
      title: 'Total Tickets (Queries)',
      value: stats.totalQueries,
      icon: MessageSquare,
      themeClass: 'success',
      trendText: `${stats.resolvedQueries} Resolved`,
      trendUp: true
    },
    {
      title: 'Active Grievances',
      value: stats.totalComplaints,
      icon: AlertTriangle,
      themeClass: 'danger',
      trendText: `${stats.escalatedComplaints} Escalated`,
      trendUp: false
    }
  ];

  return (
    <div className="metrics-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="metric-card">
            <div className="metric-info">
              <h3>{card.title}</h3>
              <span className="metric-value">{card.value}</span>
              <div className={`metric-trend ${card.trendUp ? 'trend-up' : 'trend-down'}`}>
                {card.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{card.trendText}</span>
              </div>
            </div>
            <div className={`metric-icon-box ${card.themeClass}`}>
              <Icon size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
