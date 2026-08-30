import React from 'react';
import { BedStatus } from '../../types';

interface BedStatusLogoProps {
  status: BedStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const BedStatusLogo: React.FC<BedStatusLogoProps> = ({
  status,
  size = 'md',
  className = '',
  showBadge = false
}) => {
  // Dimensions mapping
  const dimensions = {
    xs: { w: 24, h: 24, iconSize: 18 },
    sm: { w: 32, h: 32, iconSize: 24 },
    md: { w: 42, h: 42, iconSize: 32 },
    lg: { w: 56, h: 56, iconSize: 44 },
    xl: { w: 72, h: 72, iconSize: 58 }
  }[size];

  // Colors & visual theme based on status
  const config = {
    occupied: {
      color: '#0f766e', // teal-700
      bg: 'bg-teal-50',
      border: 'border-teal-300',
      pillBg: 'bg-teal-100 text-teal-900 border-teal-200',
      title: 'Occupied',
      subtext: 'Patient Assigned',
      animClass: 'bed-occupied-card'
    },
    'freeing-soon': {
      color: '#0284c7', // sky-600
      bg: 'bg-sky-50',
      border: 'border-sky-300',
      pillBg: 'bg-sky-100 text-sky-900 border-sky-200',
      title: 'Leaving Soon',
      subtext: 'Discharging in ~2-3 hrs',
      animClass: ''
    },
    critical: {
      color: '#e11d48', // rose-600
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      pillBg: 'bg-rose-100 text-rose-900 border-rose-200',
      title: 'Critical Occupied',
      subtext: 'High Acuity Patient',
      animClass: ''
    },
    available: {
      color: '#059669', // emerald-600
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      pillBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      title: 'Available (Vacant)',
      subtext: 'Ready for Admission',
      animClass: 'bed-available-card'
    },
    cleaning: {
      color: '#d97706', // amber-600
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      pillBg: 'bg-amber-100 text-amber-900 border-amber-200',
      title: 'Cleaning / EVS',
      subtext: 'Turnover in Progress',
      animClass: 'bed-cleaning-card'
    }
  }[status] || {
    color: '#64748b',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    pillBg: 'bg-slate-100 text-slate-900 border-slate-200',
    title: 'Unknown',
    subtext: '',
    animClass: ''
  };

  const renderBedGraphic = () => {
    const isOccupied = status === 'occupied' || status === 'critical' || status === 'freeing-soon';
    const isFreeingSoon = status === 'freeing-soon';
    const isCritical = status === 'critical';
    const isAvailable = status === 'available';

    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xs transition-transform duration-200"
      >
        {/* Bed Headboard (Left) */}
        <rect
          x="6"
          y="22"
          width="4"
          height="30"
          rx="2"
          className={
            isAvailable
              ? 'fill-emerald-600'
              : isCritical
              ? 'fill-rose-700'
              : isFreeingSoon
              ? 'fill-sky-700'
              : 'fill-teal-800'
          }
        />
        {/* Bed Footboard (Right) */}
        <rect
          x="54"
          y="30"
          width="4"
          height="22"
          rx="2"
          className={
            isAvailable
              ? 'fill-emerald-600'
              : isCritical
              ? 'fill-rose-700'
              : isFreeingSoon
              ? 'fill-sky-700'
              : 'fill-teal-800'
          }
        />

        {/* Lower Bed Frame & Rails */}
        <rect
          x="8"
          y="42"
          width="48"
          height="4"
          rx="1"
          className={
            isAvailable
              ? 'fill-emerald-700'
              : isCritical
              ? 'fill-rose-800'
              : isFreeingSoon
              ? 'fill-sky-800'
              : 'fill-teal-900'
          }
        />

        {/* Bed Legs */}
        <rect x="8" y="46" width="3.5" height="8" rx="1" fill="#475569" />
        <rect x="52.5" y="46" width="3.5" height="8" rx="1" fill="#475569" />
        {/* Wheels / Casters */}
        <circle cx="9.75" cy="55.5" r="2.5" fill="#334155" />
        <circle cx="54.25" cy="55.5" r="2.5" fill="#334155" />

        {/* Mattress */}
        <rect
          x="9"
          y="36"
          width="46"
          height="7"
          rx="2.5"
          className={
            isAvailable
              ? 'fill-emerald-200 stroke-emerald-400'
              : isCritical
              ? 'fill-rose-200 stroke-rose-400'
              : isFreeingSoon
              ? 'fill-sky-200 stroke-sky-400'
              : 'fill-teal-200 stroke-teal-400'
          }
          strokeWidth="1.5"
        />

        {/* Pillow on the left */}
        <rect
          x="12"
          y="32"
          width="10"
          height="6"
          rx="3"
          className={
            isAvailable
              ? 'fill-emerald-100 stroke-emerald-300'
              : isCritical
              ? 'fill-rose-100 stroke-rose-300'
              : isFreeingSoon
              ? 'fill-sky-100 stroke-sky-300'
              : 'fill-teal-100 stroke-teal-300'
          }
          strokeWidth="1.2"
        />

        {/* OCCUPIED STATE: PERSON ON BED */}
        {isOccupied && (
          <g className={`animate-in fade-in duration-300 ${status === 'occupied' ? 'bed-occupied-icon' : ''}`}>
            {/* Person Head on Pillow */}
            <circle
              cx="17"
              cy="31"
              r="4.2"
              className={
                isCritical
                  ? 'fill-rose-900'
                  : isFreeingSoon
                  ? 'fill-sky-900'
                  : 'fill-teal-900'
              }
            />

            {/* Person Torso / Blanket Covering Person */}
            <path
              d="M20 34.5 C22 32.5, 27 32, 33 32.5 C40 33, 49 34.5, 52 36 L52 39.5 C47 39.5, 22 39.5, 19 38 Z"
              className={
                isCritical
                  ? 'fill-rose-600 stroke-rose-800'
                  : isFreeingSoon
                  ? 'fill-sky-600 stroke-sky-800'
                  : 'fill-teal-700 stroke-teal-900'
              }
              strokeWidth="1.2"
            />

            {/* Blanket Fold / Texture */}
            <path
              d="M22 34.5 Q26 33.5 30 34"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.8"
            />
          </g>
        )}

        {/* AVAILABLE STATE: EMPTY BED (NO PERSON) */}
        {isAvailable && (
          <g className="bed-available-icon">
            {/* Clean checkmark badge floating above */}
            <circle cx="32" cy="22" r="7" className="fill-emerald-500 stroke-white" strokeWidth="1.5" />
            <path
              d="M29 22 L31 24 L35.5 19.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* FREEING SOON STATE: PERSON LEAVING / CLOCK INDICATOR */}
        {isFreeingSoon && (
          <g className="animate-in fade-in duration-300">
            {/* Clock / Hourglass leaving badge */}
            <circle cx="48" cy="18" r="8" className="fill-amber-500 stroke-white" strokeWidth="1.5" />
            {/* Clock face & hands */}
            <circle cx="48" cy="18" r="6" fill="#fef3c7" />
            <path
              d="M48 14.5 V18 L50.5 19.5"
              stroke="#b45309"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Outgoing Arrow small */}
            <path
              d="M32 18 L36 18 M36 18 L34 16 M36 18 L34 20"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* CRITICAL STATE: EMERGENCY PULSE */}
        {isCritical && (
          <g className="animate-in fade-in duration-300">
            <circle cx="48" cy="18" r="8" className="fill-rose-600 stroke-white" strokeWidth="1.5" />
            {/* Heartbeat / ECG line inside circle */}
            <path
              d="M43 18 H45 L46.5 14.5 L48 21.5 L49.5 16.5 L51 18 H53"
              stroke="white"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* CLEANING STATE: SPARKLE */}
        {status === 'cleaning' && (
          <g className="animate-in fade-in duration-300 bed-cleaning-icon">
            <circle cx="32" cy="22" r="7" className="fill-amber-500 stroke-white" strokeWidth="1.5" />
            <path
              d="M32 18 V26 M28 22 H36 M29.5 19.5 L34.5 24.5 M34.5 19.5 L29.5 24.5"
              stroke="white"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        style={{ width: `${dimensions.w}px`, height: `${dimensions.h}px` }}
        className={`relative flex items-center justify-center rounded-xl p-1 border transition-all ${config.bg} ${config.border} ${config.animClass}`}
        title={`${config.title} - ${config.subtext}`}
      >
        {renderBedGraphic()}
      </div>

      {showBadge && (
        <div className="flex flex-col text-left">
          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border capitalize inline-block ${config.pillBg}`}>
            {config.title}
          </span>
          <span className="text-[9px] text-slate-500 font-medium">
            {config.subtext}
          </span>
        </div>
      )}
    </div>
  );
};
