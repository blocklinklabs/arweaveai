export const Logo = () => (
  <div className="flex items-center gap-3">
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white"
    >
      <path
        d="M16 2L2 9L16 16L30 9L16 2Z"
        className="stroke-indigo-500"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 23L16 30L30 23"
        className="stroke-purple-500"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 16L16 23L30 16"
        className="stroke-indigo-400"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2" className="fill-indigo-500" />
      <circle cx="16" cy="23" r="2" className="fill-purple-500" />
      <circle cx="16" cy="9" r="2" className="fill-indigo-400" />
    </svg>
    <div className="flex flex-col">
      <span className="text-white font-semibold text-xl leading-none">
        AI Registry
      </span>
      <span className="text-white/40 text-xs">Powered by Arweave</span>
    </div>
  </div>
);
