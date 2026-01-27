import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon, actions }) => {
    return (
        <div className="page-header-section mb-8">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        {Icon && (
                            <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
                                <Icon size={24} />
                            </div>
                        )}
                        <h1 className="text-3xl font-bold text-primary">{title}</h1>
                    </div>
                    {description && (
                        <p className="text-muted text-lg">{description}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
