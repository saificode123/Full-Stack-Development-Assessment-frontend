import { useState, useEffect, useRef } from 'react';
import { X, Users, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export default function TeamModal({ isOpen, onClose, onTeamCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Ref to auto-focus the input when modal opens
  const inputRef = useRef(null);

  // Close modal on 'Escape' key press and manage focus
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Small timeout ensures the modal is rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent rendering if not open
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); 
    
    try {
      // POST request to your Django /teams/ endpoint
      const response = await api.post('/teams/', { name, description });
      onTeamCreated(response.data); // Update the dashboard instantly
      
      // Reset form and close
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error("Error creating team", err);
      setError(err.response?.data?.name?.[0] || 'Failed to create team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop overlay (z-[100] ensures it covers the sidebar)
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 transition-opacity"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="p-6 sm:px-8 border-b border-gray-50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Users className="text-green-600 w-5 h-5" />
            </div>
            Create New Team
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-400 hover:text-gray-900" />
          </button>
        </div>

        {/* Scrollable Form Section */}
        <div className="overflow-y-auto overflow-x-hidden p-6 sm:p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="teamName">
                Team Name
              </label>
              <input
                id="teamName"
                ref={inputRef}
                type="text"
                required
                placeholder="e.g. Design Ninjas"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all text-sm sm:text-base text-gray-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="teamDesc">
                Description (Optional)
              </label>
              <textarea
                id="teamDesc"
                placeholder="What is the main goal of this team?"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all min-h-[120px] resize-none text-sm sm:text-base text-gray-900"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-black text-white font-bold py-4 rounded-full hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Launch Team'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}