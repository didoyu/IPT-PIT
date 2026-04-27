import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ActivateAccount = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('activating'); // activating, success, error

    useEffect(() => {
        const activate = async () => {
            try {
                // Adjust the URL to match your Django backend port
                await axios.post('http://127.0.0.1:8000/auth/users/activation/', {
                     uid,
                    token
                });
                setStatus('success');
                setTimeout(() => navigate('/login'), 3000);
            } catch (err) {
                setStatus('error');
                console.error(err);
            }
        };
        activate();
    }, [uid, token, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            {status === 'activating' && <h2>Activating your account...</h2>}
            {status === 'success' && (
                <div>
                    <h2 style={{ color: 'green' }}>Account Activated Successfully!</h2>
                    <p>Redirecting you to login...</p>
                </div>
            )}
            {status === 'error' && (
                <div>
                    <h2 style={{ color: 'red' }}>Activation Failed</h2>
                    <p>The link may be expired or already used.</p>
                    <button onClick={() => navigate('/login')}>Go to Login</button>
                </div>
            )}
        </div>
    );
};

export default ActivateAccount;