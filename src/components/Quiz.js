import React, { useState, useEffect, useRef } from 'react';
import { QuizData } from '../Data/QuizData';
import QuizResult from './QuizResult';

function Quiz() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [clickedOption, setClickedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [location, setLocation] = useState(null);
    const [timer, setTimer] = useState(30); // Initial timer value

    const videoRef = useRef(null);
    const timerRef = useRef(null);

    const changeQuestion = () => {
        if (clickedOption !== null) {
            if (clickedOption === QuizData[currentQuestion].answer) {
                setScore(score + 1);
            }

            if (currentQuestion < QuizData.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setClickedOption(null);
                setTimer(30); // Reset timer
            } else {
                setShowResult(true);
            }
        } else {
            alert('Please select an option before proceeding.');
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer === 1) {
                    clearInterval(timerRef.current);
                    changeQuestion(); // Auto move to the next question when time's up
                    return 30; // Reset timer for the next question
                } else {
                    return prevTimer - 1;
                }
            });
        }, 1000);
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraStream(stream);
            }
        } catch (error) {
            console.error("Error accessing camera: ", error);
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location: ", error);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    useEffect(() => {
        startCamera();
        getLocation();
        startTimer();

        document.addEventListener('fullscreenchange', () => {
            setIsFullscreen(!!document.fullscreenElement);

            if (!document.fullscreenElement) {
                alert('You have exited fullscreen mode. Please return to fullscreen to continue.');
            }
        });

        return () => {
            stopCamera();
            clearInterval(timerRef.current);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [cameraStream]);

    const resetAll = () => {
        setShowResult(false);
        setCurrentQuestion(0);
        setClickedOption(null);
        setScore(0);
        stopCamera();
        setTimer(30); // Reset the timer
        startTimer(); // Restart the timer
    };

    const toggleFullscreen = () => {
        if (isFullscreen) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    };

    return (
        <div>
            <p className="heading-txt">Quiz APP</p>
            <div className="container">
                {showResult ? (
                    <QuizResult score={score} totalScore={QuizData.length} tryAgain={resetAll} />
                ) : (
                    <>
                        <div className="question">
                            <span id="question-number">{currentQuestion + 1}. </span>
                            <span id="question-txt">{QuizData[currentQuestion].question}</span>
                        </div>
                        <div className="timer">
                            Time Left: {timer} seconds
                        </div>
                        <div className="option-container">
                            {QuizData[currentQuestion].options.map((option, i) => (
                                <button
                                    className={`option-btn ${clickedOption === i + 1 ? "checked" : ""}`}
                                    key={i}
                                    onClick={() => setClickedOption(i + 1)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <button onClick={changeQuestion} disabled={clickedOption === null}>
                            {currentQuestion < QuizData.length - 1 ? "Next" : "Submit"}
                        </button>
                        <button onClick={toggleFullscreen}>
                            {isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
                        </button>
                        <div className="camera-feed">
                            <video ref={videoRef} autoPlay></video>
                        </div>
                        {location && (
                            <div className="location-info">
                                <p>Latitude: {location.latitude}</p>
                                <p>Longitude: {location.longitude}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Quiz;
