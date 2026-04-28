import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ActivateAccount.css';

const ActivateAccount = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('activating');
    const initialized = React.useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;

            const activate = async () => {
                try {
                    await axios.post('http://127.0.0.1:8000/api/auth/users/activation/', {
                        uid,
                        token
                    });
                    setStatus('success');
                    setTimeout(() => navigate('/'), 3000);
                } catch (err) {
                    setStatus('error');
                    console.log("Error Data:", err.response?.data);
                }
            };
            activate();
        }
    }, [uid, token, navigate]);

    return (
        <div className="activate-container">
            <div className="activate-card">
                <div className="activate-icon">
                    {status === 'activating' && (
                        <div className="spinner"></div>
                    )}
                    {status === 'success' && (
                        <svg viewBox="0 0 24 24" className="success-icon">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                    )}
                    {status === 'error' && (
                        <svg viewBox="0 0 24 24" className="error-icon">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                    )}
                </div>

                {status === 'activating' && (
                    <div className="activate-content">
                        <h1>Activating Account</h1>
                        <p>Please wait while we verify your account...</p>
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="activate-content">
                        <h1>Account Activated!</h1>
                        <p>Your account has been successfully verified.</p>
                        <p className="redirect-text">Redirecting to login...</p>
                        <button className="primary-btn" onClick={() => navigate('/login')}>
                            Go to Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="activate-content">
                        <h1>Activation Failed</h1>
                        <p>The activation link may be expired, invalid, or already used.</p>
                        <div className="error-details">
                            <p>Please try the following:</p>
                            <ul>
                                <li>Request a new activation email</li>
                                <li>Contact support if the problem persists</li>
                            </ul>
                        </div>
                        <div className="button-group">
                            <button className="primary-btn" onClick={() => navigate('/login')}>
                                Go to Login
                            </button>
                            <button className="secondary-btn" onClick={() => navigate('/register')}>
                                Register Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivateAccount;