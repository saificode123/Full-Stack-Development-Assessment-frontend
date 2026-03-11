import { useState, useMemo } from 'react';

export default function useFilteredTasks(tasks, activeTeam) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter(task => {
      // 1. Team Filter: Only show tasks for the selected team 
      const matchesTeam = activeTeam ? task.team === activeTeam.id : true;

      // 2. Search Text Filter: Check if query matches title or description 
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery
        ? task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower))
        : true;

      // 3. Status Filter: Match specific status or show all
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      // 4. Assignee Filter: Match assigned member (field is assigned_to, an integer ID)
      const matchesAssignee = assigneeFilter === 'all' || String(task.assigned_to) === String(assigneeFilter);

      return matchesTeam && matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [tasks, activeTeam, searchQuery, statusFilter, assigneeFilter]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    assigneeFilter,
    setAssigneeFilter,
    filteredTasks
  };
}