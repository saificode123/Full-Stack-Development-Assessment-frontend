import { Users, LayoutDashboard, Settings, LogOut, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Sidebar({ teams, activeTeam, setActiveTeam }) {
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
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          Manager
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-8">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Main Menu</p>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-black rounded-xl font-bold transition-all">
            <LayoutDashboard size={20} /> Dashboard
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Teams</p>
            <button className="text-gray-400 hover:text-black transition-colors">
              <PlusCircle size={16} />
            </button>
          </div>
          <div className="space-y-1">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setActiveTeam(team)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTeam?.id === team.id 
                    ? 'bg-green-50 text-green-700 border border-green-100' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                # {team.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all">
          <Settings size={20} /> Settings
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}