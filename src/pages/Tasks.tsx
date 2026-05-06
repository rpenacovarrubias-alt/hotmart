import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Task, TaskStatus } from '../types';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';

const Tasks = () => {
  const { tasks, addTask, moveTask } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const byStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  const pendingTasks    = byStatus('Pendiente');
  const inProgressTasks = byStatus('En Progreso');
  const completedTasks  = byStatus('Completado');

  const handleAddTask = (task: Task) => {
    addTask(task);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Limpieza y Mantenimiento</h2>
        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} />
          Agregar Tarea
        </button>
      </div>

      <div className="kanban-board">
        <div className="kanban-column">
          <div className="kanban-header">
            Pendientes
            <span className="kanban-badge">{pendingTasks.length}</span>
          </div>
          {pendingTasks.map(task => (
            <TaskCard key={task.id} task={task} onMove={moveTask} />
          ))}
        </div>

        <div className="kanban-column">
          <div className="kanban-header">
            En Progreso
            <span className="kanban-badge">{inProgressTasks.length}</span>
          </div>
          {inProgressTasks.map(task => (
            <TaskCard key={task.id} task={task} onMove={moveTask} />
          ))}
        </div>

        <div className="kanban-column">
          <div className="kanban-header">
            Completadas
            <span className="kanban-badge">{completedTasks.length}</span>
          </div>
          {completedTasks.map(task => (
            <TaskCard key={task.id} task={task} onMove={moveTask} />
          ))}
        </div>
      </div>

      {isAddModalOpen && (
        <AddTaskModal
          onAdd={handleAddTask}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Tasks;
