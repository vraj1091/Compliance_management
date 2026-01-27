import React from 'react';
import { Settings as SettingsIcon, Database, Shield, Bell, Palette } from 'lucide-react';

const Settings: React.FC = () => {
    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h2>Settings</h2>
                <p className="text-muted text-sm mt-1">
                    Configure system settings and preferences
                </p>
            </div>

            <div className="grid-2">
                {/* General Settings */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <SettingsIcon size={20} style={{ marginRight: '0.5rem' }} />
                            General
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input
                                type="text"
                                className="form-input"
                                defaultValue="Medical Device Company Inc."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">System Email</label>
                            <input
                                type="email"
                                className="form-input"
                                defaultValue="system@qms-erp.com"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Time Zone</label>
                            <select className="form-input form-select">
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time (ET)</option>
                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                <option value="Europe/London">London (GMT)</option>
                                <option value="Asia/Kolkata" selected>India (IST)</option>
                            </select>
                        </div>
                        <button className="btn btn-primary mt-2">Save Changes</button>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Shield size={20} style={{ marginRight: '0.5rem' }} />
                            Security
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="form-label">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                className="form-input"
                                defaultValue="480"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password Policy</label>
                            <select className="form-input form-select">
                                <option value="standard">Standard (8+ chars)</option>
                                <option value="strong" selected>Strong (12+ chars, special)</option>
                                <option value="enterprise">Enterprise (16+ chars, MFA)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked />
                                <span>Require password change every 90 days</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked />
                                <span>Enable audit logging</span>
                            </label>
                        </div>
                        <button className="btn btn-primary mt-2">Save Changes</button>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Bell size={20} style={{ marginRight: '0.5rem' }} />
                            Notifications
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked />
                                <span>Email notifications for NC creation</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked />
                                <span>Email notifications for CAPA due dates</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked />
                                <span>Training expiry reminders</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" />
                                <span>Daily digest email</span>
                            </label>
                        </div>
                        <button className="btn btn-primary mt-2">Save Changes</button>
                    </div>
                </div>

                {/* Theme Settings */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Palette size={20} style={{ marginRight: '0.5rem' }} />
                            Appearance
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="form-label">Theme</label>
                            <select className="form-input form-select">
                                <option value="light" selected>Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System Default</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Primary Color</label>
                            <div className="flex gap-2">
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        background: 'var(--primary-500)',
                                        border: '2px solid var(--primary-700)',
                                        cursor: 'pointer',
                                    }}
                                />
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        background: '#10b981',
                                        cursor: 'pointer',
                                    }}
                                />
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        background: '#8b5cf6',
                                        cursor: 'pointer',
                                    }}
                                />
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        background: '#f59e0b',
                                        cursor: 'pointer',
                                    }}
                                />
                            </div>
                        </div>
                        <button className="btn btn-primary mt-2">Save Changes</button>
                    </div>
                </div>

                {/* Database Info */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <Database size={20} style={{ marginRight: '0.5rem' }} />
                            System Information
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="grid-3">
                            <div>
                                <div className="text-muted text-sm">Version</div>
                                <div style={{ fontWeight: 500 }}>1.0.0</div>
                            </div>
                            <div>
                                <div className="text-muted text-sm">Database</div>
                                <div style={{ fontWeight: 500 }}>SQLite (Development)</div>
                            </div>
                            <div>
                                <div className="text-muted text-sm">Last Backup</div>
                                <div style={{ fontWeight: 500 }}>Never</div>
                            </div>
                            <div>
                                <div className="text-muted text-sm">Regulatory Framework</div>
                                <div style={{ fontWeight: 500 }}>FDA 21 CFR Part 820, ISO 13485, EU MDR</div>
                            </div>
                            <div>
                                <div className="text-muted text-sm">License</div>
                                <div style={{ fontWeight: 500 }}>Enterprise</div>
                            </div>
                            <div>
                                <div className="text-muted text-sm">Support</div>
                                <div style={{ fontWeight: 500 }}>support@qms-erp.com</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
