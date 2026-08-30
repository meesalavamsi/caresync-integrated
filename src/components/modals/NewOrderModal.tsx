import React, { useState } from 'react';
import { 
  Pill, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Send 
} from 'lucide-react';
import { Patient } from '../../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSubmitOrder: (order: {
    medication: string;
    dose: string;
    route: string;
    frequency: string;
    indication: string;
  }) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSubmitOrder
}) => {
  const [medication, setMedication] = useState('Potassium Chloride (Oral / IVPB)');
  const [dose, setDose] = useState('20 mEq');
  const [route, setRoute] = useState('Oral Solution');
  const [frequency, setFrequency] = useState('Once STAT');
  const [indication, setIndication] = useState('Serum K+ elevation management / telemetry monitoring');

  if (!isOpen || !patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOrder({
      medication,
      dose,
      route,
      frequency,
      indication
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-[#001f1f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">CPOE Provider Order Entry</h3>
              <p className="text-xs text-teal-200/80">
                {patient.name} • Bed {patient.roomNumber} • MRN: {patient.mrn}
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
            <label className="font-bold text-slate-700 block mb-1">Medication Order Name *</label>
            <input
              type="text"
              required
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-hidden focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dose / Strength</label>
              <input
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Administration Route</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium"
              >
                <option value="Oral Solution">Oral Solution / Tablet</option>
                <option value="IV Push">IV Push</option>
                <option value="IV Continuous Infusion">IV Continuous Infusion</option>
                <option value="Subcutaneous (SC)">Subcutaneous (SC)</option>
                <option value="Inhalation / Nebulizer">Inhalation / Nebulizer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Frequency / Timing</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium"
            >
              <option value="Once STAT">Once STAT (Immediate)</option>
              <option value="Every 4 Hours (Q4H)">Every 4 Hours (Q4H)</option>
              <option value="Every 8 Hours (Q8H)">Every 8 Hours (Q8H)</option>
              <option value="Daily at Bedtime">Daily at Bedtime (QHS)</option>
              <option value="Titrate per ICU Protocol">Titrate per ICU Protocol</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Clinical Indication & Instructions</label>
            <textarea
              rows={2}
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-hidden"
            />
          </div>

          {/* Allergy Check Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">
              Allergy Screen: <strong>{patient.allergies.join(', ') || 'No known allergies'}</strong>
            </span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Safety Checked
            </span>
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
              <Send className="w-3.5 h-3.5" />
              Sign & Transmit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
