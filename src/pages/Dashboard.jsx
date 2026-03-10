import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { Search, Filter, Plus } from 'lucide-react';

export default function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsRes = await api.get('/teams/');
        setTeams(teamsRes.data);
        if (teamsRes.data.length > 0) setActiveTeam(teamsRes.data[0]);
        
        const tasksRes = await api.get('/tasks/');
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter tasks based on selected team 
  const filteredTasks = activeTeam 
    ? tasks.filter(task => task.team === activeTeam.id)
    : tasks;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex">
      <Sidebar teams={teams} activeTeam={activeTeam} setActiveTeam={setActiveTeam} />

      <main className="flex-1 ml-64 p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTeam ? activeTeam.name : 'Team Tasks'}
            </h1>
            <p className="text-gray-500 mt-1">Manage your team's productivity and tasks[cite: 10].</p>
          </div>
          <button className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95">
            <Plus size={20} /> Create Task
          </button>
        </header>

        {/* Search and Filters Section [cite: 22] */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-black shadow-sm transition-all">
            <Filter size={20} />
          </button>
        </div>

        {/* Task Grid  */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {task.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{task.description}</p>
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-bold">
                  <span>Due: Mar 20, 2026</span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    SA
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
               <p className="text-gray-400 font-medium">No tasks found for this team[cite: 17].</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}