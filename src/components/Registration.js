// src/components/Registration.js

import React, { useState } from 'react';

function Registration({ onRegister }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (name && email) {
            // Call the onRegister function passed as a prop to update the registration state
            onRegister({ name, email });
        } else {
            alert('Please enter both name and email.');
        }
    }

    return (
        <div className="registration-container">
            <h2>Registration</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </label>
                <label>
                    Email:
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </label>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Registration;
