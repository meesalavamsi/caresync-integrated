import React, { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Contrast, 
  RotateCw, 
  Maximize2, 
  Eye, 
  FileText, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Patient } from '../../types';

interface PacsViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const PacsViewerModal: React.FC<PacsViewerModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !patient) return null;

  const resetControls = () => {
    setZoom(100);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-xs">
              DICOM
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                PACS Diagnostic Radiology Viewer
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-900 text-teal-300 font-mono">
                  {patient.recentImaging.modality}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {patient.name} • MRN: {patient.mrn} • Study Date: {patient.recentImaging.date}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.min(z + 20, 200))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 20, 60))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-400 text-[11px] w-12 text-center">{zoom}%</span>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              onClick={() => setBrightness(b => (b >= 140 ? 100 : b + 20))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
              title="Brightness"
            >
              <Sun className="w-4 h-4" />
              <span>{brightness}%</span>
            </button>

            <button
              onClick={() => setContrast(c => (c >= 140 ? 100 : c + 20))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
              title="Contrast"
            >
              <Contrast className="w-4 h-4" />
              <span>{contrast}%</span>
            </button>

            <button
              onClick={() => setIsInverted(!isInverted)}
              className={`px-2 py-1 rounded text-xs font-semibold ${isInverted ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              Invert
            </button>

            <button
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={resetControls}
            className="text-xs text-slate-400 hover:text-teal-400 font-semibold"
          >
            Reset View
          </button>
        </div>

        {/* Viewport and Findings */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden bg-black">
          {/* Main DICOM Image Viewport */}
          <div className="md:col-span-2 relative flex items-center justify-center p-4 min-h-[360px] overflow-hidden">
            <img
              src={patient.recentImaging.imageUrl}
              alt="DICOM X-Ray"
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`,
                transition: 'transform 0.15s ease, filter 0.15s ease'
              }}
              className="max-h-[380px] max-w-full object-contain rounded select-none shadow-2xl"
            />

            {/* Viewport Overlay details */}
            <div className="absolute top-3 left-3 text-[10px] font-mono text-teal-400 bg-black/60 px-2 py-1 rounded backdrop-blur-xs">
              <div>STUDY: {patient.recentImaging.title}</div>
              <div>KV: 120 • mA: 250 • LAT: AP ERECT</div>
            </div>

            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-1 rounded">
              CareSync DICOM Bridge 2024.4
            </div>
          </div>

          {/* Radiologist Report & Findings */}
          <div className="p-5 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 space-y-4 text-xs overflow-y-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
                Radiologist Impression
              </span>
              <h4 className="font-bold text-white text-sm">{patient.recentImaging.title}</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Read by: Dr. Evelyn Vance, Attending Radiologist</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-slate-200">
              <span className="font-bold text-teal-300">Findings:</span>
              <p className="leading-relaxed">{patient.recentImaging.findings}</p>
            </div>

            <div className="space-y-1 text-slate-400">
              <div>Comparison: <strong className="text-slate-200">Prior baseline CXR 48h earlier</strong></div>
              <div>Impression: <strong className="text-emerald-400">Improving pulmonary congestion, no pneumothorax or pleural effusion.</strong></div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: Finalized & Signed</span>
              <button 
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-bold transition-colors"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
