/**
 * A spinner that shows during DeepL API PDF/Docx translation.
 * An orange wheel with a semi-transparent white ball rotating around it.
 **/

export default function LoadingDeepLSpinner() {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col justify-center items-center">
      <h2 className="text-xl font-semibold mt-5">Translation process ongoing...</h2>
      <h2 className="text-lg font-semibold mt-3 mb-3"> Do not refresh the page </h2>

      <div className="relative w-55 h-55 mt-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            {/* Glow gradient */}
            <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>

            {/* Mask to limit glow to progress arc */}
            <mask id="filled-mask">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={0}
              />
            </mask>

            {/* Animation */}
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

          {/* Background circle (grey) */}
          <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="7" className="stroke-gray-200" />

          {/* Main orange progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="7"
            className="stroke-amber-600"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* Moving white glow */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="7"
            stroke="url(#glow-gradient)"
            strokeDasharray="10 1000"
            strokeDashoffset={0}
            strokeLinecap="round"
            mask="url(#filled-mask)"
            style={{
              animation: 'dashOffset 1s linear infinite',
            }}
            className="opacity-80"
          />
        </svg>
      </div>
    </div>
  );
}
