import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string; // ISO string or date string
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }

            return timeLeft;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Initial call
        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="flex space-x-4 text-center">
            <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-white">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-xs text-indigo-100 uppercase">Days</span>
            </div>
            <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-white">:</span>
            </div>
            <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-indigo-100 uppercase">Hrs</span>
            </div>
            <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-white">:</span>
            </div>
            <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-indigo-100 uppercase">Mins</span>
            </div>
            <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-white">:</span>
            </div>
            <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-indigo-100 uppercase">Secs</span>
            </div>
        </div>
    );
};

export default CountdownTimer;
