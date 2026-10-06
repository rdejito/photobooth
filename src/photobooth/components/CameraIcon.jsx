export default function CameraIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 32 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 7.5h5l2-4h12l2 4h5A2 2 0 0 1 31 9.5v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="15.5" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="26.5" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}
