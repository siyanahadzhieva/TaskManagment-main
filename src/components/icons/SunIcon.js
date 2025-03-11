import React from "react";

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="var(--sun-icon-color)"
    width="20"
    height="20"
  >
    <circle cx="12" cy="12" r="5" />
    <path
      d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke="var(--sun-icon-color)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default SunIcon;
