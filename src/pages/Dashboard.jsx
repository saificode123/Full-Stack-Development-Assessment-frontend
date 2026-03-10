import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TeamModal from '../components/TeamModal';
import TaskModal from '../components/TaskModal';
import TaskFilterBar from '../components/TaskFilterBar'; // NEW: Imported UI Component
import useFilteredTasks from '../hooks/useFilteredTasks'; // NEW: Imported Custom Hook
import api from '../api/axios';
import { Plus, Clock, CheckCircle2, AlertCircle, Menu, Activity, Trash2, MailPlus } from 'lucide-react';

export default function Dashboard() {
  // --- 1. Core State Management ---
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- 2. UI & Modal State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null); // Tracks which task to update 

  // --- 3. Custom Hook Integration (Gap 2 Solved)  ---
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredTasks
  } = useFilteredTasks(tasks, activeTeam);

  // --- 4. Data Fetching ---
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

  // --- 5. Handlers ---
  const handleTeamCreated = (newTeam) => {
    setTeams([...teams, newTeam]);
    setActiveTeam(newTeam);
  };

  const openNewTaskModal = () => {
    setTaskToEdit(null); // Ensure we are in "Create Mode"
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setTaskToEdit(task); // Pass the specific task to "Edit Mode" 
    setIsTaskModalOpen(true);
  };

  // --- 6. Derived Statistics ---
  // Calculates stats dynamically based on the CURRENT search/filter results
  const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex font-sans">
      
      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        teams={teams} 
        activeTeam={activeTeam} 
        setActiveTeam={(team) => {
          setActiveTeam(team);
          setIsSidebarOpen(false);
        }} 
        onOpenTeamModal={() => {
          setIsTeamModalOpen(true);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Modals */}
      <TeamModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
        onTeamCreated={handleTeamCreated} 
      />

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null); // Reset after closing
        }} 
        activeTeam={activeTeam}
        taskToEdit={taskToEdit} // Passes data for updating 
        onTaskCreated={(newTask) => setTasks([...tasks, newTask])} 
        onTaskUpdated={(updatedTask) => {
          // Replaces the old task with the updated one in state
          setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-8 lg:p-10 overflow-y-auto transition-all duration-300 w-full">
        
        {/* Top Header Row */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 lg:hidden hover:bg-gray-50 transition-colors active:scale-95"
            >
              <Menu size={24} className="text-gray-900" />
            </button>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {activeTeam ? activeTeam.name : 'Team Dashboard'}
              </h1>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm font-medium">Manage your team's workflow and assignments.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            {/* The Modular Filter Bar  */}
            <TaskFilterBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            
            <button 
              onClick={openNewTaskModal}
              disabled={!activeTeam}
              className="w-full sm:w-auto bg-black text-white px-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md active:scale-95 text-sm whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus size={18} /> New Task
            </button>
          </div>
        </header>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Left Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            
            {/* Prominent Overview Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-[32px] p-6 sm:p-8 text-white shadow-lg shadow-green-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white opacity-10 rounded-full -mr-10 -mt-10 sm:-mr-20 sm:-mt-20 blur-2xl"></div>
              <h2 className="text-green-50 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1 relative z-10">Filtered Overview</h2>
              <div className="text-4xl sm:text-5xl font-black mb-6 relative z-10">{filteredTasks.length} <span className="text-xl sm:text-2xl font-semibold opacity-80">Tasks Found</span></div>
              
              <div className="flex gap-6 sm:gap-8 relative z-10">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-medium">Completed</p>
                  <p className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-200" /> {completedTasks}
                  </p>
                </div>
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-medium">In Progress</p>
                  <p className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <Clock size={18} className="text-green-200" /> {inProgressTasks}
                  </p>
                </div>
              </div>
            </div>

            {/* Sleek Task List */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Task Directory [cite: 20]</h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div 
                      key={task.id} 
                      [cite_start]onClick={() => openEditTaskModal(task)} // Opens Edit Mode 
                      className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                          task.status === 'done' ? 'bg-green-100 text-green-600' : 
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {task.status === 'done' ? <CheckCircle2 size={20} /> : 
                           task.status === 'in_progress' ? <Activity size={20} /> : <Clock size={20} />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors text-sm sm:text-base truncate">{task.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{task.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end shrink-0 ml-2">
                        <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mb-2 ${
                          task.status === 'done' ? 'bg-green-100 text-green-700' : 
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <div className="flex -space-x-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[7px] sm:text-[8px] font-bold">SA</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 sm:py-12 text-center flex flex-col items-center">
                    <AlertCircle className="text-gray-300 mb-3" size={32} />
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">No tasks match your current filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Team Details & Bonus Features Setup) */}
          <div className="space-y-6 lg:space-y-8">
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Team Profile</h3>
              
              <div className="mb-6 flex-1">
                <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-2xl">
                  {activeTeam?.description || "No description provided for this team yet."}
                </p>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">Members</p>
                  {/* Pre-setup for Bonus Feature: Invites  */}
                  <button className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-green-100 transition-colors">
                    <MailPlus size={14} /> Invite
                  </button>
                </div>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-green-400 to-green-600 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-sm">
                      SA
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">Saif</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Team Admin</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pre-setup for Bonus Feature: Role Based Access (Delete)  */}
              <div className="pt-6 border-t border-gray-100 mt-auto">
                 <button 
                  disabled={!activeTeam}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Trash2 size={18} /> Delete Team
                 </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}