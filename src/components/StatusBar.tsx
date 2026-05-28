export function StatusBar() {
  return (
    <div className="flex justify-between items-center px-6 pt-3.5 pb-2 text-[12px] font-semibold text-charcoal shrink-0">
      <span>9:41</span>
      <div className="flex gap-1.5 items-center">
        {/* Signal bars */}
        <svg width="14" height="9" viewBox="0 0 14 9" fill="currentColor">
          <rect x="0" y="6" width="2" height="3" rx="0.5" />
          <rect x="3" y="4" width="2" height="5" rx="0.5" />
          <rect x="6" y="2" width="2" height="7" rx="0.5" />
          <rect x="9" y="0" width="2" height="9" rx="0.5" />
        </svg>
        {/* Wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
          <path d="M7.5 2.5c2 0 3.8 0.7 5.3 2L14 3.3a8 8 0 0 0-13 0L2.2 4.5c1.5-1.3 3.3-2 5.3-2zm0 3c1.2 0 2.3 0.4 3.2 1.2l1.2-1.2a6 6 0 0 0-8.8 0l1.2 1.2c0.9-0.8 2-1.2 3.2-1.2zm0 3c0.5 0 1 0.2 1.4 0.5l-1.4 1.4-1.4-1.4c0.4-0.3 0.9-0.5 1.4-0.5z" />
        </svg>
        {/* Battery */}
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
          <rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor" />
          <rect x="2" y="2" width="14" height="6" rx="1" fill="currentColor" />
          <rect x="19" y="3" width="2" height="4" rx="0.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
