import React, { useState, useEffect } from 'react';

const TestComponent = () => {
    const [apiStatus, setApiStatus] = useState(null);
    const [sessionStatus, setSessionStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        testApiConnectivity();
        testSessionFunctionality();
    }, []);

    const testApiConnectivity = async () => {
        try {
            const response = await fetch('/api/healthcheck');
            const data = await response.json();
            setApiStatus(data);
        } catch (err) {
            setError(`API Test Error: ${err.message}`);
        }
    };

    const testSessionFunctionality = async () => {
        try {
            const response = await fetch('/api/test-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ test_data: 'test_value' })
            });
            const data = await response.json();
            setSessionStatus(data);
        } catch (err) {
            setError(`Session Test Error: ${err.message}`);
        }
    };

    const testBirthTimeRectification = async () => {
        try {
            const response = await fetch('/api/rectification/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    birth_date: '1985-10-24',
                    birth_time: '14:30',
                    birth_place: 'Pune, India'
                })
            });
            const data = await response.json();
            console.log('Rectification Test Result:', data);
            return data;
        } catch (err) {
            setError(`Rectification Test Error: ${err.message}`);
            return null;
        }
    };

    return (
        <div className="test-component" style={{ padding: '20px' }}>
            <h2>System Tests</h2>
            
            {error && (
                <div style={{ color: 'red', marginBottom: '20px' }}>
                    {error}
                </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
                <h3>API Status</h3>
                <pre>{JSON.stringify(apiStatus, null, 2)}</pre>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Session Status</h3>
                <pre>{JSON.stringify(sessionStatus, null, 2)}</pre>
            </div>
            
            <button 
                onClick={testBirthTimeRectification}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Test Birth Time Rectification
            </button>
        </div>
    );
};

export default TestComponent; 