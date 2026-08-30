import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  PieChart, 
  AlertTriangle, 
  Search, 
  Filter, 
  Activity, 
  Users, 
  CheckCircle2, 
  Clock, 
  ChevronRight 
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('7d');
  const [searchAlert, setSearchAlert] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportNotice('CareSync_Clinical_Operations_Report_Q4.csv exported successfully.');
      setTimeout(() => setExportNotice(null), 4000);
    }, 800);
  };

  const alertHistory = [
    {
      id: 'ah-1',
      date: 'Oct 24, 08:30 AM',
      type: 'Potassium Critical Lab (5.8 mEq/L)',
      patient: 'Marcus Reynolds',
      bed: 'Bed 402',
      severity: 'Critical',
      resolution: 'Kayexalate protocol initiated by Dr. S. Chen',
      duration: '8 mins'
    },
    {
      id: 'ah-2',
      date: 'Oct 24, 07:15 AM',
      type: 'Drug-Drug Interaction (Warfarin + ASA)',
      patient: 'John Doe',
      bed: 'Bed 401',
      severity: 'High',
      resolution: 'Aspirin order modified to Clopidogrel',
      duration: '14 mins'
    },
    {
      id: 'ah-3',
      date: 'Oct 23, 22:40 PM',
      type: 'Telemetry Drop - Hamilton Ventilator',
      patient: 'Bed 402',
      bed: 'Bed 402',
      severity: 'Critical',
      resolution: 'ServiceNow INC0010482 generated & bridge swapped',
      duration: '18 mins'
    },
    {
      id: 'ah-4',
      date: 'Oct 23, 16:20 PM',
      type: 'Vancomycin Trough Dosage Mismatch',
      patient: 'Maria Silva',
      bed: 'Bed 406',
      severity: 'Medium',
      resolution: 'Adjusted to 1000mg q24h per Pharmacy',
      duration: '22 mins'
    },
    {
      id: 'ah-5',
      date: 'Oct 22, 11:05 AM',
      type: 'Hypotension Sepsis Alert (MAP < 60)',
      patient: 'Alice Wright',
      bed: 'Bed 411',
      severity: 'Critical',
      resolution: '1L NS bolus & Levophed titrate',
      duration: '5 mins'
    }
  ];

  const filteredAlerts = alertHistory.filter(a => 
    a.type.toLowerCase().includes(searchAlert.toLowerCase()) ||
    a.patient.toLowerCase().includes(searchAlert.toLowerCase()) ||
    a.bed.toLowerCase().includes(searchAlert.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header matching Images 1 & 5 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Clinical Analytics & Unit Insights</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
              Biomedical & Operations Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time throughput metrics, telemetry event frequency, and ServiceNow SLA performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            {(['today', '7d', '30d'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-lg uppercase transition-colors ${
                  timeRange === t ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Top 4 KPI Metrics matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Average Length of Stay</span>
          <div className="text-2xl font-black text-slate-900 mt-1">3.4 Days</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            -0.4 days vs hospital benchmark
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Telemetry Alarm Latency</span>
          <div className="text-2xl font-black text-teal-700 mt-1">14.2 sec</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">
            100% within 30-second target
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Medication Error Prevention</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">100%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            18 interactions intercepted
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">ServiceNow IT SLA Rate</span>
          <div className="text-2xl font-black text-sky-700 mt-1">99.2%</div>
          <div className="text-[11px] text-sky-600 font-semibold mt-1">
            Mean Time To Resolve: 24 mins
          </div>
        </div>
      </div>

      {/* 2 Charts Grid matching Image 1 & 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Patient Admission Trends Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-700" />
                Admission & Census Throughput Trends
              </h3>
              <p className="text-xs text-slate-500">Daily admissions, transfers, and discharge throughput</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-600"></span> Admissions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-400"></span> Discharges
              </span>
            </div>
          </div>

          {/* SVG Area / Line Chart */}
          <div className="h-64 w-full pt-4">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />

              {/* Area 1 */}
              <polygon
                points="0,150 80,120 160,135 240,90 320,110 400,60 500,80 500,190 0,190"
                fill="url(#tealGradient)"
              />
              <polyline
                fill="none"
                stroke="#0d9488"
                strokeWidth="3"
                points="0,150 80,120 160,135 240,90 320,110 400,60 500,80"
              />

              {/* Area 2 */}
              <polygon
                points="0,170 80,150 160,160 240,130 320,140 400,100 500,120 500,190 0,190"
                fill="url(#skyGradient)"
              />
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                points="0,170 80,150 160,160 240,130 320,140 400,100 500,120"
              />

              {/* Points */}
              <circle cx="240" cy="90" r="4" fill="#0d9488" />
              <circle cx="400" cy="60" r="5" fill="#0d9488" />
            </svg>
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold pt-2">
              <span>Mon (Oct 18)</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu (Peak 11)</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun (Today)</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Acuity Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-700" />
              Department Acuity Breakdown
            </h3>
            <p className="text-xs text-slate-500">Current nursing intensity ratio</p>
          </div>

          {/* Donut Chart representation */}
          <div className="flex items-center justify-center py-3">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
                {/* Level 3 High Acuity - 45% */}
                <circle
                  cx="50" cy="50" r="40"
                  stroke="#e11d48" strokeWidth="16" fill="transparent"
                  strokeDasharray="113 251" strokeDashoffset="0"
                />
                {/* Level 2 Medium Acuity - 35% */}
                <circle
                  cx="50" cy="50" r="40"
                  stroke="#0d9488" strokeWidth="16" fill="transparent"
                  strokeDasharray="88 251" strokeDashoffset="-113"
                />
                {/* Level 1 Low Acuity - 20% */}
                <circle
                  cx="50" cy="50" r="40"
                  stroke="#38bdf8" strokeWidth="16" fill="transparent"
                  strokeDasharray="50 251" strokeDashoffset="-201"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900">12</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Beds</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Level 3 High Acuity (1:1 Nursing)
              </span>
              <strong className="text-slate-900 font-bold">45% (5)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span> Level 2 Medium Acuity (1:2 Nursing)
              </span>
              <strong className="text-slate-900 font-bold">35% (4)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Level 1 Stepdown / D/C
              </span>
              <strong className="text-slate-900 font-bold">20% (3)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts History Table matching Image 5 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Critical Clinical Alerts & Incident History
            </h3>
            <p className="text-xs text-slate-500">Historical log of intercepted warnings and clinical resolutions</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert, drug, bed..."
              value={searchAlert}
              onChange={(e) => setSearchAlert(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 w-48 sm:w-56 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Alert Condition</th>
                <th className="p-3">Patient / Bed</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Clinical Action Taken</th>
                <th className="p-3">Resolution SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.map(alert => (
                <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-slate-500 whitespace-nowrap">{alert.date}</td>
                  <td className="p-3 font-bold text-slate-900">{alert.type}</td>
                  <td className="p-3 text-slate-700 font-medium">
                    {alert.patient} <span className="text-slate-400">({alert.bed})</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      alert.severity === 'Critical' ? 'bg-rose-100 text-rose-700' :
                      alert.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{alert.resolution}</td>
                  <td className="p-3 font-bold text-emerald-700">{alert.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
