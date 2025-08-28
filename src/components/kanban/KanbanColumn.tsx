import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import { Task, Column, TaskStatus } from '@/types/kanban';
import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

const columnColors: Record<TaskStatus, string> = {
  'todo': 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
  'in-progress': 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
  'done': 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onTaskEdit,
  onTaskDelete,
  onAddTask
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id
  });

  return (
    <Card className={`flex flex-col h-fit min-h-[500px] ${columnColors[column.id]} ${
      isOver ? 'ring-2 ring-primary shadow-lg' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">
              {column.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddTask(column.id)}
            className="h-7 w-7 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[400px]"
        >
          <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
              />
            ))}
          </SortableContext>
          
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground text-sm">
                No tasks yet
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddTask(column.id)}
                className="mt-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add task
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};