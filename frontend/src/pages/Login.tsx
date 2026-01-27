import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Shield, ArrowRight, Lock, User, CheckCircle2, Globe, Zap } from 'lucide-react';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        { icon: <Globe size={24} />, text: "Global Compliance Standards" },
        { icon: <Zap size={24} />, text: "AI-Powered Risk Analysis" },
        { icon: <Shield size={24} />, text: "Enterprise Grade Security" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
                <div className="spinner-loader"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-split-layout">
            {/* Left Side - Cinematic Vision */}
            <div className="login-vision-panel">
                {/* Dynamic Background */}
                <div className="vision-bg">
                    <div className="vision-bg-gradient"></div>
                    <div className="vision-bg-pulse"></div>
                    {/* Animated Mesh Orbs */}
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>

                {/* Content */}
                <div className="vision-content">
                    <div className="vision-brand">
                        <div className="vision-logo-box">
                            <Shield size={28} color="white" />
                        </div>
                        <span className="vision-brand-name">Nexus QMS</span>
                    </div>

                    <div className="compliance-badges">
                        <div className="compliance-pill">
                            <Shield size={14} fill="currentColor" />
                            <span>ISO 13485:2016</span>
                        </div>
                        <div className="compliance-pill">
                            <CheckCircle2 size={14} />
                            <span>FDA 21 CFR Part 11</span>
                        </div>
                    </div>

                    <div className="vision-text-container">
                        <h1 className="vision-title">
                            The Future of <br />
                            <span className="text-gradient">Quality Assurance</span>
                        </h1>
                        <p className="vision-subtitle">
                            Experience the next generation of compliance management.
                            AI-driven insights, seamless FDA/ISO integration, and
                            uncompromising security.
                        </p>

                        <div className="feature-carousel">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className={`feature-item ${idx === activeFeature ? 'active' : ''}`}
                                >
                                    <div className={`feature-icon ${idx === activeFeature ? 'active' : ''}`}>
                                        {feature.icon}
                                    </div>
                                    <span className={`feature-text ${idx === activeFeature ? 'active' : ''}`}>
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="vision-footer">
                        <span>© 2026 Nexus Systems</span>
                        <span className="dot"></span>
                        <span>FDA 21 CFR Part 11 Compliant</span>
                        <span className="dot"></span>
                        <span>ISO 13485:2016 Certified</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Portal */}
            <div className="login-form-panel">
                <div className="login-form-container animate-fade-in">
                    <div className="login-header">
                        <h2 className="login-welcome">Welcome Back</h2>
                        <p className="login-instruction">Please enter your credentials to access the workspace.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="login-error-banner animate-shake">
                                <span className="error-dot"></span>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Username</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="custom-input"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="label-row">
                                <label>Password</label>
                                <a href="#" className="forgot-link">Forgot password?</a>
                            </div>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="custom-input"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-submit-btn"
                        >
                            {loading ? (
                                <div className="btn-spinner"></div>
                            ) : (
                                <>
                                    <span>Sign In to Dashboard</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-security-badge">
                        <div className="security-content">
                            <CheckCircle2 size={16} color="#22c55e" />
                            <span>Secured by Enterprise SSO</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style>{`
                .login-split-layout {
                    display: flex;
                    min-height: 100vh;
                    width: 100%;
                    background: #0f172a;
                    font-family: 'Outfit', sans-serif;
                    overflow: hidden;
                }

                /* Left Panel */
                .login-vision-panel {
                    width: 60%;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    padding: 4rem;
                    justify-content: space-between;
                    overflow: hidden;
                }

                @media (max-width: 1024px) {
                    .login-vision-panel {
                        display: none;
                    }
                    .login-form-panel {
                        width: 100%;
                    }
                }

                .vision-bg {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                }

                .vision-bg-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #172554 100%);
                }

                .vision-bg-pulse {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0.3;
                    background-image: radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%);
                    animation: pulse 10s infinite;
                }

                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.4;
                    animation: blob 10s infinite;
                    mix-blend-mode: screen;
                }

                .orb-1 {
                    top: -10%;
                    right: -10%;
                    width: 500px;
                    height: 500px;
                    background: #2563eb;
                }

                .orb-2 {
                    bottom: -10%;
                    left: -10%;
                    width: 500px;
                    height: 500px;
                    background: #7c3aed;
                    animation-delay: 2s;
                }

                .orb-3 {
                    top: 40%;
                    left: 40%;
                    width: 400px;
                    height: 400px;
                    background: #0d9488;
                    animation-delay: 4s;
                }

                .vision-content {
                    position: relative;
                    z-index: 10;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .vision-brand {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .vision-logo-box {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
                }

                .compliance-badges {
                    margin-top: 1.5rem;
                    display: flex;
                    gap: 0.75rem;
                }

                .compliance-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 100px;
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .compliance-pill:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                    border-color: rgba(255, 255, 255, 0.4);
                }

                .vision-brand-name {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                    letter-spacing: -0.02em;
                }

                .vision-title {
                    font-size: 3.5rem;
                    font-weight: 700;
                    color: white;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                }

                .text-gradient {
                    background: linear-gradient(to right, #60a5fa, #2dd4bf);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .vision-subtitle {
                    font-size: 1.125rem;
                    color: #94a3b8;
                    margin-bottom: 3rem;
                    max-width: 500px;
                    line-height: 1.6;
                }

                .feature-carousel {
                    display: flex;
                    gap: 1rem;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.5s ease;
                    opacity: 0.5;
                    transform: translateY(10px);
                }

                .feature-item.active {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    opacity: 1;
                    transform: translateY(0);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .feature-icon {
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    background: #1e293b;
                    color: #94a3b8;
                    display: flex;
                }

                .feature-icon.active {
                    background: #3b82f6;
                    color: white;
                }

                .feature-text {
                    font-weight: 500;
                    color: #94a3b8;
                }

                .feature-text.active {
                    color: white;
                }

                .vision-footer {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    color: #64748b;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: #475569;
                }

                /* Right Panel */
                .login-form-panel {
                    width: 40%;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .login-form-container {
                    width: 100%;
                    max-width: 400px;
                }

                .login-header {
                    text-align: left;
                    margin-bottom: 2rem;
                }

                .login-welcome {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 0.5rem;
                }

                .login-instruction {
                    color: #64748b;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #334155;
                    margin-bottom: 0.5rem;
                }

                .label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .forgot-link {
                    font-size: 0.75rem;
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 500;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    width: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    transition: color 0.2s;
                }

                .input-wrapper:focus-within .input-icon {
                    color: #2563eb;
                }

                .custom-input {
                    width: 100%;
                    height: 48px;
                    padding-left: 48px;
                    padding-right: 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    color: #0f172a;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }

                .custom-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    background: white;
                }

                .login-submit-btn {
                    width: 100%;
                    height: 48px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                }

                .login-submit-btn:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                }

                .login-submit-btn:active {
                    transform: translateY(0);
                }

                .btn-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .login-error-banner {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 1rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .error-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #dc2626;
                }

                .login-security-badge {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: center;
                }

                .security-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: #64748b;
                }

                /* Animations */
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.5; }
                }

                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }

                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }

                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }

                .spinner-loader {
                    width: 48px;
                    height: 48px;
                    border: 5px solid #3b82f6;
                    border-bottom-color: transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Login;
