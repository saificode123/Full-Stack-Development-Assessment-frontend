import { Search, Filter, Users } from 'lucide-react';

export default function TaskFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  assigneeFilter,
  setAssigneeFilter,
  users = [],
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
      
      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-4 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all"
        />
      </div>

      {/* Status Filter Dropdown */}
      <div className="relative w-full sm:w-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Filter className="text-gray-400" size={16} />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all appearance-none cursor-pointer font-medium text-gray-700"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      {/* Assignee Filter Dropdown */}
      {users.length > 0 && (
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Users className="text-gray-400" size={16} />
          </div>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="w-full sm:w-auto pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all appearance-none cursor-pointer font-medium text-gray-700"
          >
            <option value="all">All Members</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      )}
      
    </div>
  );
}