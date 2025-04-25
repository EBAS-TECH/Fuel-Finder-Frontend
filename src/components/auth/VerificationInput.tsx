
import React, { useState, useRef } from 'react';

interface VerificationInputProps {
  length?: number;
  onComplete?: (code: string) => void;
}

const VerificationInput: React.FC<VerificationInputProps> = ({
  length = 6,
  onComplete
}) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last character
    setCode(newCode);

    // If a digit was entered and there's a next input, focus it
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Check if code is complete
    if (!newCode.includes('') && onComplete) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // If current input is empty and backspace was pressed, focus previous input
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length).split('');
    
    if (pastedData.some(char => !/\d/.test(char))) {
      return; // Contains non-numeric characters
    }
    
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (i < length) {
        newCode[i] = pastedData[i];
      }
    }
    
    setCode(newCode);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex(c => !c);
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
    
    if (!newCode.includes('') && onComplete) {
      onComplete(newCode.join(''));
    }
  };

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          className="w-12 h-12 text-center text-xl font-bold border rounded-lg bg-fuelGreen-50 focus:border-fuelGreen-500 focus:ring-2 focus:ring-fuelGreen-500 focus:outline-none"
        />
      ))}
    </div>
  );
};

export default VerificationInput;
