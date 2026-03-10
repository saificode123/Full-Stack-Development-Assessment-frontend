import { Users, LayoutDashboard, Settings, LogOut, PlusCircle, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Sidebar({ teams, activeTeam, setActiveTeam, onOpenTeamModal, isOpen, setIsOpen }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/');
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className={`
      fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col font-sans z-30
      transition-transform duration-300 ease-in-out w-64 shadow-2xl lg:shadow-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      
      {/* Brand / Logo Section with Mobile Close Button */}
      <div className="p-6 lg:p-8 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center shadow-md">
            <CheckCircle2 className="text-green-400 w-6 h-6" />
          </div>
          <span className="tracking-tight">Task Manager</span>
        </h2>
        
        {/* Mobile Close Button (Hidden on Desktop) */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 lg:px-6 space-y-8 overflow-y-auto pb-4 custom-scrollbar">
        
        {/* Main Navigation */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Main Menu</p>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 text-gray-900 rounded-2xl font-bold transition-all border border-gray-100 shadow-sm">
            <LayoutDashboard size={20} className="text-green-600" /> Dashboard
          </button>
        </div>

        {/* Dynamic Teams List */}
        <div>
          <div className="flex items-center justify-between px-2 mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Teams</p>
            {/* Connected the Plus button to trigger the Modal via Props */}
            <button 
              onClick={onOpenTeamModal}
              className="text-gray-400 hover:text-green-600 transition-colors p-1.5 hover:bg-green-50 rounded-full active:scale-95"
              title="Create New Team"
            >
              <PlusCircle size={18} />
            </button>
          </div>
          
          <div className="space-y-2">
            {teams.length > 0 ? (
              teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setActiveTeam(team)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 ${
                    activeTeam?.id === team.id 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200 translate-x-1' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Users size={18} className={activeTeam?.id === team.id ? 'text-green-100' : 'text-gray-400'} />
                  <span className="truncate">{team.name}</span>
                </button>
              ))
            ) : (
              <p className="text-xs text-gray-400 font-medium px-4 py-2 text-center border border-dashed border-gray-200 rounded-xl">
                No teams yet. Create one!
              </p>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-gray-100 space-y-3 shrink-0 bg-white">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-2xl text-sm font-semibold transition-all">
          <Settings size={20} /> Settings
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl text-sm font-semibold transition-all active:scale-95"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}