import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    theme?: 'primary' | 'success' | 'warning' | 'error' | 'info';
    trend?: {
        value: string;
        direction: 'up' | 'down';
    };
    subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    theme = 'primary',
    trend,
    subtitle
}) => {
    return (
        <div className="kpi-card">
            <div className={`kpi-icon ${theme}`}>
                <Icon size={24} />
            </div>
            <div style={{ flex: 1 }}>
                <div className="text-sm text-muted font-medium mb-1">{title}</div>
                <div className="kpi-value">{value}</div>
                {(trend || subtitle) && (
                    <div className="flex items-center gap-2 mt-2">
                        {trend && (
                            <div className={`flex items-center gap-1 text-xs font-semibold ${trend.direction === 'up' ? 'text-success-500' : 'text-error-500'}`}>
                                {trend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {trend.value}
                            </div>
                        )}
                        {subtitle && (
                            <span className="text-xs text-muted">{subtitle}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
