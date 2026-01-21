import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Bell, Search, LogOut, User, Settings, ChevronDown } from 'lucide-react';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const getInitials = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        return user?.username?.[0]?.toUpperCase() || 'U';
    };

    return (
        <header className="header">
            <h1 className="header-title">{title}</h1>

            <div className="header-actions">
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search
                        size={20}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="form-input"
                        style={{
                            paddingLeft: '40px',
                            width: '240px',
                            height: '40px',
                        }}
                    />
                </div>

                {/* Notifications */}
                <button className="btn btn-icon btn-secondary">
                    <Bell size={20} />
                </button>

                {/* User Menu */}
                <div className="user-menu">
                    <div
                        className="user-menu-trigger"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <div className="user-avatar">{getInitials()}</div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                {user?.first_name} {user?.last_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {user?.department || 'No Department'}
                            </div>
                        </div>
                        <ChevronDown size={16} />
                    </div>

                    {showUserMenu && (
                        <>
                            <div
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    zIndex: 99,
                                }}
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div className="user-menu-dropdown">
                                <div className="user-menu-item">
                                    <User size={18} />
                                    Profile
                                </div>
                                <div className="user-menu-item">
                                    <Settings size={18} />
                                    Settings
                                </div>
                                <div
                                    className="user-menu-item danger"
                                    onClick={() => logout()}
                                >
                                    <LogOut size={18} />
                                    Logout
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
