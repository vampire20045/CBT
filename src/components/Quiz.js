import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuizData } from '../Data/QuizData';
import QuizResult from './QuizResult';

function Quiz({ userInfo }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [clickedOption, setClickedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [location, setLocation] = useState(null);
    const [timer, setTimer] = useState(30); // Set initial timer value (30 seconds)

    const videoRef = useRef(null);
    const timerRef = useRef(null);

    const updateScore = useCallback(() => {
        if (clickedOption === QuizData[currentQuestion].answer) {
            setScore((prevScore) => prevScore + 1);
        }
    }, [clickedOption, currentQuestion]);

    const changeQuestion = useCallback(() => {
        if (clickedOption !== null) {
            updateScore();
            if (currentQuestion < QuizData.length - 1) {
                setCurrentQuestion((prevQuestion) => prevQuestion + 1);
                setClickedOption(null);
                setTimer(30); // Reset the timer for the next question
            } else {
                setShowResult(true);
            }
        } else {
            alert('Please select an option before proceeding.');
        }
    }, [clickedOption, currentQuestion, updateScore]);

    const startTimer = useCallback(() => {
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
    }, [changeQuestion]);

    const stopCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    }, [cameraStream]);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraStream(stream);
            }
        } catch (error) {
            console.error("Error accessing camera: ", error);
        }
    }, []);

    const getLocation = useCallback(() => {
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
    }, []);

    const toggleFullscreen = () => {
        if (isFullscreen) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
        setIsFullscreen(!isFullscreen);
    };

    const handleFullscreenChange = useCallback(() => {
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isCurrentlyFullscreen);

        if (!isCurrentlyFullscreen) {
            alert('You have exited fullscreen mode. Please return to fullscreen to continue.');
        }
    }, []);

    useEffect(() => {
        startCamera();
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        getLocation();
        startTimer();

        return () => {
            stopCamera();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            clearInterval(timerRef.current);
        };
    }, [startCamera, stopCamera, handleFullscreenChange, getLocation, startTimer]);

    const resetAll = useCallback(() => {
        setShowResult(false);
        setCurrentQuestion(0);
        setClickedOption(null);
        setScore(0);
        setLocation(null);
        stopCamera();
        setTimer(30); // Reset the timer
        startTimer(); // Restart the timer
    }, [stopCamera, startTimer]);

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
