import { useState, useEffect, useRef } from 'react';
import { X, MailPlus, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import api from '../api/axios';

export default function InviteModal({ isOpen, onClose, activeTeam }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const inputRef = useRef(null);

  // Handle 'Escape' key for accessibility and auto-focus the email input
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Small timeout to ensure the modal is painted before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent rendering if not open or no team is selected [cite: 15]
  if (!isOpen || !activeTeam) return null;

  // Helper to cleanly reset internal state when closing
  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // POST request to the custom action endpoint built in views.py [cite: 27, 46]
      const response = await api.post(`/teams/${activeTeam.id}/invite_member/`, { email });
      
      // Display the stubbed success message from the Django backend
      setSuccess(response.data.success || `Invite successfully sent to ${email}`);
      setEmail('');
      
      // Auto-close the modal after 2 seconds to return user to dashboard 
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (err) {
      console.error("Error sending invite", err);
      // Extracts specific error message from Django validation if available [cite: 29]
      setError(err.response?.data?.error || 'Failed to send invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop overlay at z-[100] to sit above the mobile sidebar
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 transition-opacity"
      onClick={handleClose}
    >
      {/* Modal Container with entrance animations  */}
      <div 
        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="p-6 sm:px-8 border-b border-gray-50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shadow-md">
                <MailPlus className="text-green-600 w-5 h-5" />
              </div>
              Invite Member
            </h2>
            <p className="text-xs font-bold text-gray-400 flex items-center gap-1 ml-14">
              <Users size={12} /> {activeTeam.name}
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

        {/* Dynamic Form Content */}
        <div className="p-6 sm:p-8">
          
          {/* Success State View [cite: 46] */}
          {success ? (
            <div className="flex flex-col items-center justify-center text-center py-6 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Invite Sent!</h3>
              <p className="text-sm text-gray-500 font-medium">{success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Alert Display [cite: 29] */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="inviteEmail">
                  Email Address
                </label>
                <input
                  id="inviteEmail"
                  ref={inputRef}
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all text-sm sm:text-base text-gray-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-black text-white font-bold py-4 rounded-full hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  'Send Invite'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}