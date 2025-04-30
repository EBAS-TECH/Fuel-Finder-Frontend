import React, { useState, useRef } from "react";

interface VerificationInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

const VerificationInput: React.FC<VerificationInputProps> = ({
  length = 6,
  onComplete,
  disabled = false,
}) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (!newCode.includes("")) {
      onComplete(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, length)
      .split("");

    if (pastedData.some((char) => !/\d/.test(char))) return;

    const newCode = [...code];
    pastedData.forEach((char, i) => {
      if (i < length) newCode[i] = char;
    });
    setCode(newCode);

    if (!newCode.includes("")) {
      onComplete(newCode.join(""));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between gap-2 mb-2">
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
            disabled={disabled}
            className={`w-12 h-12 text-center text-xl font-bold border rounded-lg
              border-gray-300 focus:border-fuelGreen-500 focus:ring-2
              focus:ring-fuelGreen-500 focus:outline-none
              ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
            aria-label={`Verification code digit ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default VerificationInput;
