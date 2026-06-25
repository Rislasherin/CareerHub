'use client';

import React, { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onResend: () => void;
  isLoading?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, onResend, isLoading }) => {
  const [timer, setTimer] = useState(30);
  const canResend = timer === 0;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = () => {
    if (canResend) {
      onResend();
      setTimer(30);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return;

    const otpArray = value.split('');
    otpArray[index] = val.slice(-1);
    const newOtp = otpArray.join('');
    onChange(newOtp);

    // Move to next input if value is entered
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    onChange(pastedData);
    // Focus the last input or the next empty one
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between gap-2 sm:gap-4" onPaste={handlePaste}>
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ''}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-slate-400">
          Didn't receive the code?{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-indigo-600 font-bold hover:underline transition-all"
            >
              Resend Code
            </button>
          ) : (
            <span className="text-slate-500 font-bold">
              Resend in <span className="text-indigo-600 font-black tabular-nums">{timer}s</span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
