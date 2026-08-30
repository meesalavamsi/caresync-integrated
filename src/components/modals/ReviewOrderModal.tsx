import React, { useState } from 'react';
import { 
  Pill, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Check, 
  Edit3 
} from 'lucide-react';
import { MedicationSafetyAlert } from '../../types';

interface ReviewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: MedicationSafetyAlert | null;
  onConfirmAdjustment: (alertId: string, adjustedDose: string) => void;
}

export const ReviewOrderModal: React.FC<ReviewOrderModalProps> = ({
  isOpen,
  onClose,
  alert,
  onConfirmAdjustment
}) => {
  const [adjustedDose, setAdjustedDose] = useState(
    alert?.dosageDetails?.suggested || '1000mg IV q24h (Renal dose adjustment)'
  );
  const [clinicalRationale, setClinicalRationale] = useState('Adjusted per pharmacy clinical protocol and current eGFR clearance.');

  if (!isOpen || !alert) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmAdjustment(alert.id, adjustedDose);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-[#001f1f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Review & Modify Medication Order</h3>
              <p className="text-xs text-teal-200/80">
                {alert.patientName} • {alert.bedNumber} • {alert.medicationName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
            <strong>Warning:</strong> {alert.details}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Adjusted Dose & Frequency *</label>
            <input
              type="text"
              required
              value={adjustedDose}
              onChange={(e) => setAdjustedDose(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold focus:outline-hidden focus:border-teal-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Clinical Justification & Pharmacist Note</label>
            <textarea
              rows={3}
              value={clinicalRationale}
              onChange={(e) => setClinicalRationale(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm & Re-verify Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
