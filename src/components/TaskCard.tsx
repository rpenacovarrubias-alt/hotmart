import { Calendar, User, Camera, ArrowRight, CheckCircle, Trash2, Pencil } from 'lucide-react';
import type { Task, TaskStatus } from '../types';
import { useApp } from '../context/AppContext';

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
}

const TYPE_CLASS: Record<string, string> = {
  Limpieza:      'limpieza',
  Mantenimiento: 'mantenimiento',
  'Revisión':    'revision',
  Otro:          'otro',
};

const iconBtn: React.CSSProperties = {
  position: 'absolute', background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', padding: '4px', borderRadius: '5px',
  display: 'flex', alignItems: 'center', transition: 'color 0.15s, background 0.15s',
};

const TaskCard = ({ task, onMove }: TaskCardProps) => {
  const { openDeleteModal, openEditModal } = useApp();

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'Pendiente') return 'En Progreso';
    if (current === 'En Progreso') return 'Completado';
    return null;
  };

  const nextStatus = getNextStatus(task.status);
  const typeClass  = TYPE_CLASS[task.type] ?? task.type.toLowerCase();

  return (
    <div className="task-card" style={{ position: 'relative' }}>

      {/* Edit icon */}
      <button
        onClick={() => openEditModal({ category: 'tarea', itemId: task.id })}
        style={{ ...iconBtn, top: '10px', right: '42px' }}
        onMouseEnter={e => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.color = '#6B5BFF';
          b.style.background = 'rgba(107,91,255,0.08)';
        }}
        onMouseLeave={e => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.color = 'var(--text-muted)';
          b.style.background = 'none';
        }}
        title="Editar tarea"
      >
        <Pencil size={13} />
      </button>

      {/* Delete icon */}
      <button
        onClick={() => openDeleteModal({ category: 'tarea', itemId: task.id })}
        style={{ ...iconBtn, top: '10px', right: '10px' }}
        onMouseEnter={e => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.color = '#EF4444';
          b.style.background = 'rgba(239,68,68,0.08)';
        }}
        onMouseLeave={e => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.color = 'var(--text-muted)';
          b.style.background = 'none';
        }}
        title="Eliminar tarea"
      >
        <Trash2 size={13} />
      </button>

      {/* Type badge + Urgente pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', paddingRight: '68px' }}>
        <div className={`task-type type-${typeClass}`} style={{ marginBottom: 0 }}>
          {task.type}
        </div>
        {task.priority === 'Urgente' && (
          <span style={{
            background: 'rgba(255, 90, 95, 0.12)', color: 'var(--primary)',
            fontSize: '10px', fontWeight: 700, padding: '2px 7px',
            borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.4px',
          }}>
            Urgente
          </span>
        )}
      </div>

      <h4 className="task-title">{task.title}</h4>

      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        {task.description}
      </div>

      {task.photos && task.photos.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <img
            src={task.photos[0]}
            alt="Evidencia"
            style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
          />
        </div>
      )}

      <div className="task-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <User size={14} /> {task.assignedTo}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={14} /> {new Date(task.date).toLocaleDateString()}
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        {task.status !== 'Completado' && (
          <button
            style={{
              flex: 1, background: 'var(--bg-color)', border: 'none', padding: '8px',
              borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 600,
              color: 'var(--text-main)',
            }}
            onClick={() => nextStatus && onMove(task.id, nextStatus)}
          >
            Mover a {nextStatus}
            <ArrowRight size={14} />
          </button>
        )}

        {task.status === 'En Progreso' && (
          <button
            style={{ background: 'rgba(0, 166, 153, 0.1)', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: 'var(--success)' }}
            title="Subir evidencia"
          >
            <Camera size={16} />
          </button>
        )}

        {task.status === 'Completado' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle size={16} /> Tarea Finalizada
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
