import { useState } from 'react';
import { Plus, CheckSquare, Trash2, ArrowRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Task, TaskStatus } from '../types';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';

const Tasks = () => {
  const { tasks, addTask, moveTask, deleteTask } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectMode, setSelectMode]         = useState(false);
  const [selected, setSelected]             = useState<Set<string>>(new Set());

  const byStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  const pendingTasks    = byStatus('Pendiente');
  const inProgressTasks = byStatus('En Progreso');
  const completedTasks  = byStatus('Completado');

  const handleAddTask = (task: Task) => { addTask(task); };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const handleBulkMove = (status: TaskStatus) => {
    selected.forEach(id => moveTask(id, status));
    exitSelectMode();
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`¿Eliminar ${selected.size} tarea${selected.size !== 1 ? 's' : ''} seleccionada${selected.size !== 1 ? 's' : ''}?`)) return;
    selected.forEach(id => deleteTask(id));
    exitSelectMode();
  };

  const cardProps = (task: Task) => ({
    task,
    onMove: moveTask,
    selectMode,
    selected: selected.has(task.id),
    onToggleSelect: toggleSelect,
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Limpieza y Mantenimiento</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectMode ? (
            <button className="btn-outline" onClick={exitSelectMode} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <X size={16} /> Cancelar
            </button>
          ) : (
            <button className="btn-outline" onClick={() => setSelectMode(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckSquare size={16} /> Seleccionar
            </button>
          )}
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> Agregar Tarea
          </button>
        </div>
      </div>

      <div className="kanban-board">
        <div className="kanban-column">
          <div className="kanban-header">
            Pendientes <span className="kanban-badge">{pendingTasks.length}</span>
          </div>
          {pendingTasks.map(task => <TaskCard key={task.id} {...cardProps(task)} />)}
        </div>

        <div className="kanban-column">
          <div className="kanban-header">
            En Progreso <span className="kanban-badge">{inProgressTasks.length}</span>
          </div>
          {inProgressTasks.map(task => <TaskCard key={task.id} {...cardProps(task)} />)}
        </div>

        <div className="kanban-column">
          <div className="kanban-header">
            Completadas <span className="kanban-badge">{completedTasks.length}</span>
          </div>
          {completedTasks.map(task => <TaskCard key={task.id} {...cardProps(task)} />)}
        </div>
      </div>

      {/* Floating action bar */}
      {selectMode && selected.size > 0 && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--text-main)', color: 'white', borderRadius: '16px',
          padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)', zIndex: 1000,
          fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          <span>{selected.size} seleccionada{selected.size !== 1 ? 's' : ''}</span>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.25)' }} />
          <span style={{ opacity: 0.65, fontSize: '12px' }}>Mover a:</span>
          {(['Pendiente', 'En Progreso', 'Completado'] as TaskStatus[]).map(s => (
            <button
              key={s}
              onClick={() => handleBulkMove(s)}
              style={{
                background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none',
                borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <ArrowRight size={13} /> {s}
            </button>
          ))}
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.25)' }} />
          <button
            onClick={handleBulkDelete}
            style={{
              background: 'rgba(255,90,95,0.22)', color: '#FF8A8E', border: 'none',
              borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}
          >
            <Trash2 size={13} /> Eliminar
          </button>
        </div>
      )}

      {isAddModalOpen && (
        <AddTaskModal onAdd={handleAddTask} onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};

export default Tasks;
