import { useState, useEffect, useCallback } from 'react';
import { Task, Column, TaskStatus, KanbanBoard, FilterOptions } from '@/types/kanban';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'kanban-boards';

export const useKanban = () => {
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [activeBoard, setActiveBoard] = useState<KanbanBoard | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Load boards from localStorage on mount
  useEffect(() => {
    const savedBoards = localStorage.getItem(STORAGE_KEY);
    if (savedBoards) {
      const parsedBoards = JSON.parse(savedBoards);
      setBoards(parsedBoards);
      if (parsedBoards.length > 0) {
        setActiveBoard(parsedBoards[0]);
      }
    } else {
      // Create default board if none exists
      const defaultBoard = createDefaultBoard();
      setBoards([defaultBoard]);
      setActiveBoard(defaultBoard);
    }
  }, []);

  // Save boards to localStorage whenever boards change
  useEffect(() => {
    if (boards.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    }
  }, [boards]);

  const createDefaultBoard = (): KanbanBoard => {
    const now = new Date().toISOString();
    return {
      id: uuidv4(),
      title: 'My Kanban Board',
      description: 'Organize your tasks effectively',
      createdAt: now,
      updatedAt: now,
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          tasks: []
        },
        {
          id: 'in-progress',
          title: 'In Progress',
          tasks: []
        },
        {
          id: 'done',
          title: 'Done',
          tasks: []
        }
      ]
    };
  };

  const createTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!activeBoard) return;

    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedBoard = {
      ...activeBoard,
      updatedAt: new Date().toISOString(),
      columns: activeBoard.columns.map(column =>
        column.id === taskData.status
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      )
    };

    setActiveBoard(updatedBoard);
    setBoards(prev => prev.map(board => 
      board.id === activeBoard.id ? updatedBoard : board
    ));
  }, [activeBoard]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    if (!activeBoard) return;

    const updatedBoard = {
      ...activeBoard,
      updatedAt: new Date().toISOString(),
      columns: activeBoard.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        )
      }))
    };

    setActiveBoard(updatedBoard);
    setBoards(prev => prev.map(board => 
      board.id === activeBoard.id ? updatedBoard : board
    ));
  }, [activeBoard]);

  const deleteTask = useCallback((taskId: string) => {
    if (!activeBoard) return;

    const updatedBoard = {
      ...activeBoard,
      updatedAt: new Date().toISOString(),
      columns: activeBoard.columns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => task.id !== taskId)
      }))
    };

    setActiveBoard(updatedBoard);
    setBoards(prev => prev.map(board => 
      board.id === activeBoard.id ? updatedBoard : board
    ));
  }, [activeBoard]);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    if (!activeBoard) return;

    let taskToMove: Task | null = null;
    
    // Find and remove the task from its current column
    const updatedColumns = activeBoard.columns.map(column => {
      const taskIndex = column.tasks.findIndex(task => task.id === taskId);
      if (taskIndex >= 0) {
        taskToMove = column.tasks[taskIndex];
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        };
      }
      return column;
    });

    // Add the task to the new column
    if (taskToMove) {
      const finalColumns = updatedColumns.map(column =>
        column.id === newStatus
          ? {
              ...column,
              tasks: [...column.tasks, { ...taskToMove!, status: newStatus, updatedAt: new Date().toISOString() }]
            }
          : column
      );

      const updatedBoard = {
        ...activeBoard,
        updatedAt: new Date().toISOString(),
        columns: finalColumns
      };

      setActiveBoard(updatedBoard);
      setBoards(prev => prev.map(board => 
        board.id === activeBoard.id ? updatedBoard : board
      ));
    }
  }, [activeBoard]);

  const getFilteredTasks = useCallback((tasks: Task[]): Task[] => {
    let filteredTasks = [...tasks];

    // Filter by priority
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    // Filter by category
    if (filters.category) {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }

    // Sort by due date
    if (filters.dueDateOrder) {
      filteredTasks.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return filters.dueDateOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // Sort by priority
    if (filters.priorityOrder) {
      const priorityOrder = { low: 1, medium: 2, high: 3 };
      filteredTasks.sort((a, b) => {
        const priorityA = priorityOrder[a.priority];
        const priorityB = priorityOrder[b.priority];
        return filters.priorityOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
      });
    }

    return filteredTasks;
  }, [filters]);

  return {
    boards,
    activeBoard,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    getFilteredTasks,
    setActiveBoard
  };
};