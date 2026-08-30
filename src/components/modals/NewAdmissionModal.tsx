import React, { useState } from 'react';
import { 
  Bed, 
  X, 
  User, 
  Activity, 
  ShieldAlert, 
  Plus, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Bed as BedType, Patient } from '../../types';

interface NewAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBeds: BedType[];
  onAdmit: (patient: Partial<Patient>, bedId: string) => void;
}

export const NewAdmissionModal: React.FC<NewAdmissionModalProps> = ({
  isOpen,
  onClose,
  availableBeds,
  onAdmit
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(58);
  const [gender, setGender] = useState('Male');
  const [admittingDx, setAdmittingDx] = useState('STEMI Post-PCI (Cardiac Cath)');
  const [selectedBedNumber, setSelectedBedNumber] = useState<string>(availableBeds[0]?.number || '404');
  const [allergies, setAllergies] = useState('Penicillin');
  const [acuity, setAcuity] = useState<'High (Level 3)' | 'Medium (Level 2)' | 'Low (Level 1)'>('High (Level 3)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const mrn = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

    onAdmit({
      id: `pt-${Date.now()}`,
      name: name.trim(),
      initials: initials || 'PT',
      mrn,
      dob: '06/15/1965',
      age: Number(age),
      gender,
      bedId: `bed-${selectedBedNumber}`,
      roomNumber: selectedBedNumber,
      admittingDx: admittingDx.trim(),
      allergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
      attendingPhysician: 'Dr. Sarah Chen',
      primaryNurse: 'Sarah Jenkins, RN',
      los: 'Day 1',
      codeStatus: 'Full',
      statusTag: 'Direct ICU Intake',
      acuityLevel: acuity,
      isTelemetryActive: true,
      admittedDate: 'Today 10:45 AM',
      estDischargeDate: 'Oct 30',
      vitals: {
        hr: 76,
        hrStatus: 'stable',
        bpSystolic: 122,
        bpDiastolic: 78,
        bpStatus: 'stable',
        spO2: 98,
        spO2Status: 'stable',
        respRate: 16,
        respStatus: 'stable',
        temp: 98.6,
        lastUpdated: 'Live from Bed Monitor',
        hrTrend: [72, 74, 76, 76],
        bpTrend: [120, 122, 122]
      },
      carePlanGoals: [
        {
          id: `cpg-${Date.now()}-1`,
          title: 'Initial ICU Intake Assessment',
          description: 'Head to toe baseline assessment, allergy check, baseline 12-lead ECG.',
          status: 'Completed',
          progressPercent: 100,
          completed: true
        },
        {
          id: `cpg-${Date.now()}-2`,
          title: 'Continuous Telemetry Monitoring',
          description: 'ST-segment alarm parameters verified on Mindray gateway.',
          status: 'On Track',
          progressPercent: 60,
          completed: false
        }
      ],
      recentImaging: {
        id: `img-${Date.now()}`,
        title: 'Post-Procedure Portable CXR',
        modality: 'CXR',
        date: 'Today 10:30 AM',
        findings: 'Catheter placement verified. Lungs clear without pneumothorax.',
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
      },
      clinicalTimeline: [
        {
          id: `tl-${Date.now()}`,
          time: '10:45 AM',
          date: 'Today',
          type: 'assessment',
          title: 'Patient Admitted to Cardiac ICU',
          description: `Direct admission to Bed ${selectedBedNumber}. Vitals stable.`,
          clinician: 'Dr. Sarah Chen'
        }
      ]
    }, selectedBedNumber);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-[#001f1f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Admit Patient to ICU Bed</h3>
              <p className="text-xs text-teal-200/80">Cardiac ICU Ward 4 • Bed Placement & Telemetry Link</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Patient Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. David Miller"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-hidden focus:border-teal-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Assign Bed</label>
              <select
                value={selectedBedNumber}
                onChange={(e) => setSelectedBedNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold"
              >
                {availableBeds.length > 0 ? (
                  availableBeds.map(b => (
                    <option key={b.id} value={b.number}>Bed {b.number} (Available)</option>
                  ))
                ) : (
                  <option value="404">Bed 404 (Auto Clean)</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Primary Admitting Diagnosis</label>
            <input
              type="text"
              value={admittingDx}
              onChange={(e) => setAdmittingDx(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Known Drug Allergies</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa, NKDA"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Acuity Level</label>
              <select
                value={acuity}
                onChange={(e: any) => setAcuity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
              >
                <option value="High (Level 3)">High (Level 3 - 1:1 Nursing)</option>
                <option value="Medium (Level 2)">Medium (Level 2 - 1:2 Nursing)</option>
                <option value="Low (Level 1)">Low (Level 1 - Stepdown)</option>
              </select>
            </div>
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
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete Admission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
