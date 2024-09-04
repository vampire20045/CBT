import React, { useState } from 'react';
import Quiz from './components/Quiz';
import Registration from './components/Registration';
import "./App.css"


function App() {
    const [isRegistered, setIsRegistered] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const handleRegister = (info) => {
        setUserInfo(info);
        setIsRegistered(true);
    };

    return (
        <div>
            {!isRegistered ? (
                <Registration onRegister={handleRegister} />
            ) : (
                <Quiz userInfo={userInfo} />
            )}
        </div>
    );
}

export default App;
