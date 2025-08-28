import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KanbanColumn } from './KanbanColumn';
import { KanbanFilters } from './KanbanFilters';
import { TaskDialog } from './TaskDialog';
import { useKanban } from '@/hooks/useKanban';
import { Task, TaskStatus } from '@/types/kanban';
import { Plus, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const KanbanBoard: React.FC = () => {
  const {
    activeBoard,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    getFilteredTasks
  } = useKanban();

  const { toast } = useToast();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  );

  // Get all unique categories for filters
  const categories = useMemo(() => {
    if (!activeBoard) return [];
    const allTasks = activeBoard.columns.flatMap(column => column.tasks);
    const uniqueCategories = [...new Set(allTasks.map(task => task.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [activeBoard]);

  // Apply filters to tasks in each column
  const filteredColumns = useMemo(() => {
    if (!activeBoard) return [];
    
    return activeBoard.columns.map(column => ({
      ...column,
      tasks: getFilteredTasks(column.tasks)
    }));
  }, [activeBoard, getFilteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    // Optional: Add visual feedback when dragging starts
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback during drag
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeBoard) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    
    // Find current task status
    let currentStatus: TaskStatus | null = null;
    for (const column of activeBoard.columns) {
      if (column.tasks.find(task => task.id === taskId)) {
        currentStatus = column.id;
        break;
      }
    }
    
    if (currentStatus && currentStatus !== newStatus) {
      moveTask(taskId, newStatus);
      toast({
        title: "Task moved",
        description: `Task moved to ${newStatus.replace('-', ' ')}`,
      });
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setInitialStatus(status);
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast({
      title: "Task deleted",
      description: "The task has been removed from your board",
    });
  };

  const handleTaskSubmit = (taskData: any) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated",
      });
    } else {
      createTask(taskData);
      toast({
        title: "Task created",
        description: "Your new task has been added to the board",
      });
    }
  };

  if (!activeBoard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Board Found</h3>
              <p className="text-muted-foreground mb-4">
                It looks like there's no Kanban board available. This shouldn't happen!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{activeBoard.title}</h1>
            {activeBoard.description && (
              <p className="text-muted-foreground">{activeBoard.description}</p>
            )}
          </div>
          <Button onClick={() => handleAddTask('todo')} className="w-fit">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <KanbanFilters
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
        />

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={column.tasks}
                onTaskEdit={handleEditTask}
                onTaskDelete={handleDeleteTask}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        </DndContext>

        {/* Task Dialog */}
        <TaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onSubmit={handleTaskSubmit}
          task={editingTask}
          initialStatus={initialStatus}
        />
      </div>
    </div>
  );
};