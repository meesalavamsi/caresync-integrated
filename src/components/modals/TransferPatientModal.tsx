import React, { useState } from 'react';
import { 
  Bed, 
  X, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Patient, Bed as BedType } from '../../types';

interface TransferPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  availableBeds: BedType[];
  onConfirmTransfer: (patientId: string, targetBedNumber: string) => void;
}

export const TransferPatientModal: React.FC<TransferPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  availableBeds,
  onConfirmTransfer
}) => {
  const [targetBedNumber, setTargetBedNumber] = useState<string>(availableBeds[0]?.number || '404');
  const [reason, setReason] = useState('Stepdown transfer / Telemetry isolation requirement');

  if (!isOpen || !patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmTransfer(patient.id, targetBedNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-[#001f1f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Transfer ICU Bed Station</h3>
              <p className="text-xs text-teal-200/80">
                {patient.name} • Current Bed {patient.roomNumber}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Target Destination Bed *</label>
            <select
              value={targetBedNumber}
              onChange={(e) => setTargetBedNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold focus:outline-hidden"
            >
              {availableBeds.length > 0 ? (
                availableBeds.map(b => (
                  <option key={b.id} value={b.number}>Bed {b.number} (Available & Cleaned)</option>
                ))
              ) : (
                <option value="404">Bed 404 (Auto Clean)</option>
              )}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Transfer Rationale</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-hidden"
            />
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[11px] space-y-1">
            <strong>Automated Action:</strong>
            <p>1. Telemetry signal stream will migrate to Bed {targetBedNumber} gateway.</p>
            <p>2. ServiceNow EVS sanitization request generated for previous Bed {patient.roomNumber}.</p>
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
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-xs"
            >
              Execute Bed Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
