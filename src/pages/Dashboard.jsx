import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TeamModal from '../components/TeamModal';
import TaskModal from '../components/TaskModal';
import InviteModal from '../components/InviteModal';
import TaskFilterBar from '../components/TaskFilterBar';
import useFilteredTasks from '../hooks/useFilteredTasks';
import useNotifications from '../hooks/useNotifications';
import api from '../api/axios';
import { Plus, Clock, CheckCircle2, AlertCircle, Menu, Activity, Trash2, MailPlus, CalendarClock } from 'lucide-react';

// Helper: returns due date status for a task
function getDueDateStatus(dueDateStr) {
  if (!dueDateStr) return null;
  const now = new Date();
  const due = new Date(dueDateStr);
  const diffMs = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Overdue', color: 'text-red-600 bg-red-50 border-red-100' };
  if (diffDays === 0) return { label: 'Due Today', color: 'text-orange-600 bg-orange-50 border-orange-100' };
  if (diffDays <= 2) return { label: `Due in ${diffDays}d`, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' };
  return { label: `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, color: 'text-gray-500 bg-gray-50 border-gray-100' };
}

export default function Dashboard() {
  // --- 1. Core State Management ---
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // Holds users for task assignments
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Logged-in user for RBAC checks
  
  // --- 2. UI & Modal State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false); 
  const [taskToEdit, setTaskToEdit] = useState(null); 

  // --- 3. Custom Hook Integration ---
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    assigneeFilter,
    setAssigneeFilter,
    filteredTasks
  } = useFilteredTasks(tasks, activeTeam);

  // Notification enforcement — reads prefs from localStorage set in Settings page
  const { notify } = useNotifications();

  // --- 4. Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user for RBAC checks
        const profileRes = await api.get('/auth/profile/');
        setCurrentUser(profileRes.data);

        const teamsRes = await api.get('/teams/');
        setTeams(teamsRes.data);
        if (teamsRes.data.length > 0) setActiveTeam(teamsRes.data[0]);
        
        const tasksRes = await api.get('/tasks/');
        setTasks(tasksRes.data);

        // Due date reminder: notify for overdue or due-today tasks (respects notification prefs)
        const urgentTasks = tasksRes.data.filter(t => {
          if (!t.due_date || t.status === 'done') return false;
          const ds = getDueDateStatus(t.due_date);
          return ds && (ds.color.includes('red') || ds.color.includes('orange'));
        });
        if (urgentTasks.length > 0) {
          // Will be called after notify is available — deferred to after state is set
          setTimeout(() => {
            urgentTasks.forEach(t => {
              const ds = getDueDateStatus(t.due_date);
              if (ds) notify('task_status_updates', `⏰ Task Reminder: ${t.title}`, `${ds.label} — click to view your dashboard.`);
            });
          }, 1000);
        }

        // Fetch users to populate assignment dropdowns
        try {
          const usersRes = await api.get('/users/');
          setUsers(usersRes.data);
        } catch (userErr) {
          console.warn("Users endpoint not found. Using empty list.", userErr);
          setUsers([]);
        }
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
    setTaskToEdit(null); 
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setTaskToEdit(task); 
    setIsTaskModalOpen(true);
  };

  // --- 6. Role-Based Delete Logic ---
  const handleDeleteTeam = async () => {
    if (!window.confirm(`Are you sure you want to delete "${activeTeam.name}"? All tasks will be lost.`)) {
      return;
    }

    try {
      await api.delete(`/teams/${activeTeam.id}/`);
      const updatedTeams = teams.filter(t => t.id !== activeTeam.id);
      setTeams(updatedTeams);
      setActiveTeam(updatedTeams.length > 0 ? updatedTeams[0] : null);
    } catch (err) {
      if (err.response?.status === 403) {
        alert("🔒 Access Denied: Only the team creator has permission to delete this team.");
      } else {
        alert("An error occurred while trying to delete the team.");
      }
    }
  };

  // --- 7. RBAC: Check if current user is the creator of the active team ---
  const isTeamCreator = currentUser && activeTeam && activeTeam.creator === currentUser.id;

  // --- 8. Derived Statistics ---
  const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = filteredTasks.filter(t => t.status === 'done').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
          setTaskToEdit(null); 
        }} 
        activeTeam={activeTeam}
        taskToEdit={taskToEdit} 
        users={users} 
        onTaskCreated={(newTask) => {
          setTasks([...tasks, newTask]);
          notify('task_assignments', 'New Task Created', `"${newTask.title}" has been added to ${activeTeam?.name || 'your team'}.`);
        }}
        onTaskUpdated={(updatedTask) => {
          setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
          notify('task_status_updates', 'Task Updated', `"${updatedTask.title}" status changed to ${updatedTask.status.replace('_', ' ')}.`);
        }}
        onTaskDeleted={(taskId) => {
          setTasks(tasks.filter(t => t.id !== taskId));
        }}
      />

      <InviteModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        activeTeam={activeTeam}
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
            <TaskFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              assigneeFilter={assigneeFilter}
              setAssigneeFilter={setAssigneeFilter}
              users={users}
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
          
          {/* Main Left Column (Task List) */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            
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
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-medium">ToDo</p>
                  <p className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-200" /> {todoTasks}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Task Directory</h3>
              </div>
              {/* Due date reminder banner — shows tasks due within 2 days */}
              {filteredTasks.some(t => t.due_date && t.status !== 'done' && getDueDateStatus(t.due_date)?.label !== undefined && (getDueDateStatus(t.due_date)?.color.includes('red') || getDueDateStatus(t.due_date)?.color.includes('orange') || getDueDateStatus(t.due_date)?.color.includes('yellow'))) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center gap-2 text-sm font-medium text-yellow-700">
                  <CalendarClock size={16} className="shrink-0" />
                  <span>You have tasks with upcoming or overdue deadlines!</span>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div 
                      key={task.id} 
                      onClick={() => openEditTaskModal(task)} 
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
                          {/* Due date badge */}
                          {task.due_date && task.status !== 'done' && (() => {
                            const ds = getDueDateStatus(task.due_date);
                            return ds ? (
                              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${ds.color}`}>
                                <CalendarClock size={9} /> {ds.label}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end shrink-0 ml-2">
                        <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mb-2 ${
                          task.status === 'done' ? 'bg-green-100 text-green-700' : 
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        
                        {/* Task Assignee Initials */}
                        <div className="flex -space-x-2">
                          {task.assigned_to_name ? (
                            <div 
                              title={`Assigned to ${task.assigned_to_name}`}
                              className="w-6 h-6 rounded-full bg-black border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                            >
                              {task.assigned_to_name.substring(0, 2).toUpperCase()}
                            </div>
                          ) : (
                            <div title="Unassigned" className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-400">?</div>
                          )}
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

          {/* Right Column (Team Details & Actions) */}
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
                  {/* RBAC: Only team creator can invite members */}
                  {isTeamCreator && (
                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-green-100 transition-colors"
                    >
                      <MailPlus size={14} /> Invite
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:gap-3">
                  {/* Show current user as a member */}
                  {currentUser && (
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-green-400 to-green-600 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-sm">
                        {currentUser.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900">
                          {currentUser.first_name ? `${currentUser.first_name} ${currentUser.last_name}`.trim() : currentUser.username}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                          {isTeamCreator ? 'Team Creator' : 'Member'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RBAC: Only team creator can delete the team */}
              {isTeamCreator && (
                <div className="pt-6 border-t border-gray-100 mt-auto">
                  <button
                    onClick={handleDeleteTeam}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 py-3.5 rounded-2xl transition-all active:scale-95"
                  >
                    <Trash2 size={18} /> Delete Team
                  </button>
                </div>
              )}
              {/* Non-creator sees a read-only notice */}
              {activeTeam && !isTeamCreator && (
                <div className="pt-6 border-t border-gray-100 mt-auto">
                  <p className="text-xs text-center text-gray-400 font-medium py-2">
                    🔒 Only the team creator can delete or manage this team.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}