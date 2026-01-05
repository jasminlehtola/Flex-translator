/**
 * A spinner that shows during automatic translation.
 * An orange wheel with a semi-transparent white ball rotating around it.
 * Also shows progression in percentages.
 **/

import LoadingComponent from './Loading';

type LoadingAutoProps = {
  translated: number;
  total: number;
  percent: number;
};

export default function LoadingAuto({ translated, total, percent }: LoadingAutoProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const safePercent = isNaN(percent) ? 0 : percent;
  const offset = circumference - (safePercent / 100) * circumference;

  // Preparing-view at the beginning
  if (percent === 0 && translated === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <h2 className="text-2xl font-semibold mt-25">Preparing auto-translation...</h2>
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="pb-8 text-2xl font-thin">Step 2: Wait for the whole translation to finish </div>
      <h2 className="text-xl font-semibold mt-5">Auto-translating document...</h2>
      <p className="mt-3">
        Paragraph {translated} / {total} translated
      </p>

      <div className="relative w-55 h-55 mt-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            {/* Gradient-glow */}
            <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>

            {/* Mask that limits light to the filled part */}
            <mask id="filled-mask">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="white" // in mask white=shows, black=hidden
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            </mask>

            {/* Animation that moves the line */}
            <style>
              {`
              @keyframes dashOffset {
                to {
                  stroke-dashoffset: -${circumference};
                }
              }
              `}
            </style>
          </defs>

          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="7" className="stroke-gray-200" />

          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="7"
            className="stroke-amber-600 transition-all duration-300 ease-out"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />

          {/* Gradient-glow */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="7"
            stroke="url(#glow-gradient)"
            strokeDasharray="10 1000"
            strokeDashoffset={offset}
            strokeLinecap="round"
            mask="url(#filled-mask)"
            style={{
              animation: 'dashOffset 1s linear infinite',
            }}
            className="opacity-80"
          />

          {/* Percent text */}
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dy=".3em"
            transform="rotate(90, 50, 50)"
            className="text-lg font-bold fill-amber-600"
          >
            {safePercent}%
          </text>
        </svg>
      </div>
    </div>
  );
}
