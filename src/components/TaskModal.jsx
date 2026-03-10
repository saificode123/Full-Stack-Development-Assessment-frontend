import { useState, useEffect, useRef } from 'react';
import { X, CheckSquare, AlertCircle, LayoutList, Edit3 } from 'lucide-react';
import api from '../api/axios';

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onTaskCreated, 
  onTaskUpdated, // NEW: Handler for successful updates
  activeTeam, 
  taskToEdit // NEW: The task object we want to edit (null if creating)
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const inputRef = useRef(null);

  // Determine if we are in Edit Mode
  const isEditMode = Boolean(taskToEdit);

  // Handle 'Escape' key & Pre-fill form data for Edit Mode
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      setTimeout(() => inputRef.current?.focus(), 100);
      
      // PRE-FILL LOGIC: If editing, populate the fields
      if (taskToEdit) {
        setTitle(taskToEdit.title || '');
        setDescription(taskToEdit.description || '');
        setStatus(taskToEdit.status || 'todo');
      } else {
        // Reset if creating new
        setTitle('');
        setDescription('');
        setStatus('todo');
      }
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, taskToEdit]); // Re-run if taskToEdit changes

  // Prevent rendering if not open or no team is selected
  if (!isOpen || !activeTeam) return null;

  // Helper to cleanly close and reset errors
  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); 
    
    try {
      if (isEditMode) {
        // UPDATE MODE: PATCH request to the specific task endpoint
        const response = await api.patch(`/tasks/${taskToEdit.id}/`, {
          title,
          description,
          status,
          team: activeTeam.id
        });
        onTaskUpdated(response.data); // Update the task in the dashboard state
      } else {
        // CREATE MODE: POST request to the base tasks endpoint
        const response = await api.post('/tasks/', { 
          title, 
          description, 
          status,
          team: activeTeam.id 
        });
        onTaskCreated(response.data); // Add the new task to the dashboard state
      }
      handleClose();
    } catch (err) {
      console.error("Error saving task", err);
      // Professional error handling extracting Django validation messages
      setError(err.response?.data?.title?.[0] || 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 transition-opacity"
      onClick={handleClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Header Section */}
        <div className="p-6 sm:px-8 border-b border-gray-50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-3 mb-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${isEditMode ? 'bg-blue-600' : 'bg-black'}`}>
                {isEditMode ? <Edit3 className="text-white w-5 h-5" /> : <CheckSquare className="text-white w-5 h-5" />}
              </div>
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs font-bold text-gray-400 flex items-center gap-1 ml-14">
              <LayoutList size={12} /> {activeTeam.name}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-400 hover:text-gray-900" />
          </button>
        </div>

        {/* Scrollable Form Section */}
        <div className="overflow-y-auto overflow-x-hidden p-6 sm:p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="taskTitle">
                Task Title
              </label>
              <input
                id="taskTitle"
                ref={inputRef}
                type="text"
                required
                placeholder="e.g. Design Landing Page"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-900 transition-all text-sm sm:text-base text-gray-900"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="taskStatus">
                Status
              </label>
              <div className="relative">
                <select
                  id="taskStatus"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-900 transition-all text-sm sm:text-base text-gray-900 appearance-none font-medium cursor-pointer"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="taskDesc">
                Description (Optional)
              </label>
              <textarea
                id="taskDesc"
                placeholder="Add task details, links, or instructions..."
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-900 transition-all min-h-[100px] resize-none text-sm sm:text-base text-gray-900"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className={`w-full text-white font-bold py-4 rounded-full transition-all shadow-lg active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Add Task'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}