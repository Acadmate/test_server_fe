import { useEffect, useState } from "react";

export const CirculurProgress = ({
  value,
  size = 80,
}: {
  value: number;
  size?: number;
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 200);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (animatedValue / 100) * circumference;

  const isLowAttendance = value < 75;
  const progressColor = isLowAttendance ? "#ed7272ff" : "#6cf1cd";
  const backgroundOpacity = isLowAttendance
    ? "rgba(239, 68, 68, 0.1)"
    : "rgba(108, 241, 205, 0.1)";
  const glowColor = isLowAttendance
    ? "rgba(239, 68, 68, 0.4)"
    : "rgba(108, 241, 205, 0.3)";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90 transition-all duration-1200 ease-out"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundOpacity}
          strokeWidth="6"
          fill="transparent"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-2000 ease-out"
          style={{
            filter: `drop-shadow(0 0 4px ${glowColor})`,
          }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center \">
        <span
          className={`text-sm font-bold transition-colors duration-300 ${
            isLowAttendance ? "text-red-400" : "dark:text-white text-black"
          }`}
        >
          {Math.round(animatedValue)}%
        </span>
      </div>
    </div>
  );
};
