import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Server, 
  User, 
  Calendar, 
  Sparkles,
  Loader2,
  ArrowRight,
  List,
  Columns
} from 'lucide-react';
import { CareTask } from '../../types';
import { api } from '../../services/api';

interface CareTasksViewProps {
  careTasks: CareTask[];
  onToggleTaskComplete: (taskId: string) => void;
  onAddTask: (task: Partial<CareTask>) => void;
}

export const CareTasksView: React.FC<CareTasksViewProps> = ({
  careTasks,
  onToggleTaskComplete,
  onAddTask
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states for new task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPatient, setNewTaskPatient] = useState('Reynolds, Marcus');
  const [newTaskBed, setNewTaskBed] = useState('Bed 402');
  const [newTaskCategory, setNewTaskCategory] = useState<'MEDICATION ADMINISTRATION' | 'VITALS & ASSESSMENT' | 'WOUND CARE' | 'LAB DRAW' | 'CONSULT'>('MEDICATION ADMINISTRATION');
  const [newTaskPriority, setNewTaskPriority] = useState<'STAT' | 'Routine' | 'Scheduled'>('STAT');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [aiEvaluating, setAiEvaluating] = useState(false);
  const [aiResult, setAiResult] = useState<{ taskType?: string; assignedDept?: string; priority?: string; urgencyReason?: string; instruction?: string } | null>(null);

  const filteredTasks = careTasks.filter(task => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const priorityFromAi = (p?: string): 'STAT' | 'Routine' | 'Scheduled' => {
    const n = parseInt(String(p || '').trim(), 10);
    if (n <= 2) return 'STAT';
    if (n === 3) return 'Routine';
    return 'Scheduled';
  };

  const handleAiEvaluate = async () => {
    const dictation = (newTaskNotes || newTaskTitle).trim();
    if (!dictation) return;
    setAiEvaluating(true);
    setAiResult(null);
    try {
      const res = await api.evaluateHandoff(dictation);
      const a = res.aiAnalysis || {};
      setAiResult(a);
      // Pre-fill the form from the AI triage.
      if (a.instruction) setNewTaskTitle(a.instruction);
      if (a.urgencyReason) setNewTaskNotes(a.urgencyReason);
      setNewTaskPriority(priorityFromAi(a.priority));
    } catch {
      setAiResult({ urgencyReason: 'AI triage unavailable (Gemini/ServiceNow not reachable from this environment).' });
    } finally {
      setAiEvaluating(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    // Best-effort: persist to the ServiceNow clinical_task table when reachable.
    api.submitHandoff({
      patientName: newTaskPatient,
      submitterName: 'CareSync Portal',
      taskType: aiResult?.taskType || newTaskCategory.toLowerCase(),
      assignedDept: aiResult?.assignedDept || 'nursing',
      priority: aiResult?.priority || (newTaskPriority === 'STAT' ? '1' : '3'),
      urgencyReason: newTaskNotes,
      instruction: newTaskTitle,
    }).catch(() => { /* offline/demo — UI still records below */ });

    onAddTask({
      id: `task-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relativeTime: 'Just now',
      priority: newTaskPriority,
      category: newTaskCategory,
      title: newTaskTitle,
      patientName: newTaskPatient,
      mrn: `${Math.floor(100000 + Math.random() * 900000)}`,
      bedNumber: newTaskBed,
      notes: newTaskNotes || 'Standard clinical order.',
      slaMinutesRemaining: newTaskPriority === 'STAT' ? 30 : 120,
      isOverdue: false,
      status: 'pending',
      assignedTo: 'Dr. Sarah Chen / Sarah Jenkins, RN',
      serviceNowSync: {
        taskSysId: `sys_tsk_${Date.now().toString().slice(-6)}`,
        serviceRequestNumber: `SR-${newTaskPriority}-${Math.floor(1000 + Math.random() * 9000)}`
      }
    });

    setNewTaskTitle('');
    setNewTaskNotes('');
    setAiResult(null);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header & Filter Bar matching Image 15 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Care Tasks & Administration Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              {careTasks.filter(t => t.priority === 'STAT' && t.status !== 'completed').length} STAT Due
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized clinical task feed synchronized with ServiceNow Clinical Service Catalog
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search task, drug, patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 w-44 sm:w-52"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-medium">
            {['all', 'STAT', 'Routine', 'Scheduled'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  filterPriority === p ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* View switcher */}
          <div className="hidden sm:flex items-center rounded-xl bg-slate-100 p-1 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'board' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500'}`}
              title="Board View"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

          {/* Add Task Button */}
          <button
            id="btn-add-care-task"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Task List View (Matching Image 15 precision layout) */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isStat = task.priority === 'STAT';
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all bg-white shadow-xs ${
                  isCompleted 
                    ? 'opacity-60 bg-slate-50/70 border-slate-200' 
                    : isStat 
                    ? 'border-rose-200 hover:border-rose-400 ring-1 ring-rose-500/10' 
                    : 'border-slate-200 hover:border-teal-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Checkbox + Time + Category + Title */}
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => onToggleTaskComplete(task.id)}
                      className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                        isCompleted
                          ? 'bg-teal-700 border-teal-700 text-white'
                          : 'border-slate-300 hover:border-teal-600 bg-white'
                      }`}
                      aria-label="Toggle Complete"
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time Left Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                          task.isOverdue 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {task.time} ({task.relativeTime})
                        </span>

                        {/* Priority Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isStat 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-slate-800 text-slate-100'
                        }`}>
                          {task.priority}
                        </span>

                        {/* Category Label */}
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          {task.category}
                        </span>
                      </div>

                      {/* Main Title */}
                      <h3 className={`font-bold text-sm text-slate-900 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </h3>

                      {/* Notes */}
                      {task.notes && (
                        <p className="text-xs text-slate-500 italic max-w-xl">
                          "{task.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Patient Identity + Bed + ServiceNow Sync */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="font-bold text-slate-800 text-xs flex items-center sm:justify-end gap-1.5">
                        <User className="w-3.5 h-3.5 text-teal-600" />
                        {task.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {task.bedNumber} • MRN: {task.mrn}
                      </div>
                    </div>

                    {task.serviceNowSync && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold">
                        <Server className="w-3 h-3" />
                        {task.serviceNowSync.serviceRequestNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['STAT Urgent', 'Routine Care', 'Completed'].map((column, colIdx) => {
            const colTasks = careTasks.filter(t => {
              if (colIdx === 0) return t.priority === 'STAT' && t.status !== 'completed';
              if (colIdx === 1) return t.priority !== 'STAT' && t.status !== 'completed';
              return t.status === 'completed';
            });

            return (
              <div key={column} className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">{column}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-white font-bold text-xs text-slate-600 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTaskComplete(task.id)}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                          task.priority === 'STAT' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{task.time}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 leading-tight">{task.title}</h4>
                      <p className="text-[11px] text-slate-500">{task.patientName} • {task.bedNumber}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-700" />
                Schedule New Care Task
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Task Title / Order Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Draw STAT ABG & Lactate Series"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-600 bg-slate-50 text-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden bg-slate-50 text-slate-800 text-xs"
                  >
                    <option value="STAT">STAT (Urgent)</option>
                    <option value="Routine">Routine</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e: any) => setNewTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden bg-slate-50 text-slate-800 text-xs"
                  >
                    <option value="MEDICATION ADMINISTRATION">MEDICATION ADMINISTRATION</option>
                    <option value="VITALS & ASSESSMENT">VITALS & ASSESSMENT</option>
                    <option value="WOUND CARE">WOUND CARE</option>
                    <option value="LAB DRAW">LAB DRAW</option>
                    <option value="CONSULT">CONSULT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={newTaskPatient}
                    onChange={(e) => setNewTaskPatient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bed Location</label>
                  <input
                    type="text"
                    value={newTaskBed}
                    onChange={(e) => setNewTaskBed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Instructions & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional protocol notes, syringe prep, or precautions..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAiEvaluate}
                  disabled={aiEvaluating}
                  className="mt-2 w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {aiEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {aiEvaluating ? 'Gemini triaging dictation…' : 'AI Evaluate (Gemini Triage)'}
                </button>
              </div>

              {aiResult && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900 space-y-1">
                  {aiResult.taskType && <div className="flex justify-between"><span>Task type</span><strong>{aiResult.taskType}</strong></div>}
                  {aiResult.assignedDept && <div className="flex justify-between"><span>Assigned dept</span><strong>{aiResult.assignedDept}</strong></div>}
                  {aiResult.priority && <div className="flex justify-between"><span>AI priority</span><strong>{aiResult.priority}</strong></div>}
                  {aiResult.urgencyReason && <div className="pt-1 border-t border-teal-200">{aiResult.urgencyReason}</div>}
                </div>
              )}

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px] flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Task will be written to the ServiceNow clinical_task table when connected</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-xs"
                >
                  Create & Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
