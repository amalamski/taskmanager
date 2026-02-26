import { useState, useRef } from 'react';
import { Plus, Trash2, Move, Sparkles, StickyNote } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { FreestyleNote } from '../types';
import { cn } from '../utils/cn';

const noteColors = [
  '#FEF3C7', // yellow
  '#DBEAFE', // blue
  '#D1FAE5', // green
  '#FCE7F3', // pink
  '#E9D5FF', // purple
  '#FED7AA', // orange
];

export function FreestylePage() {
  const { freestyleNotes, addFreestyleNote, updateFreestyleNote, deleteFreestyleNote } = useTaskContext();
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddNote = () => {
    const randomX = Math.random() * 400 + 50;
    const randomY = Math.random() * 200 + 50;
    const randomColor = noteColors[Math.floor(Math.random() * noteColors.length)];
    
    addFreestyleNote({
      content: 'New note...',
      color: randomColor,
      position: { x: randomX, y: randomY },
    });
  };

  const handleMouseDown = (e: React.MouseEvent, noteId: string, note: FreestyleNote) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return;
    
    setDraggedNote(noteId);
    setOffset({
      x: e.clientX - note.position.x,
      y: e.clientY - note.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNote || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - offset.x, containerRect.width - 200));
    const newY = Math.max(0, Math.min(e.clientY - offset.y - containerRect.top, containerRect.height - 200));

    updateFreestyleNote(draggedNote, {
      position: { x: newX, y: newY },
    });
  };

  const handleMouseUp = () => {
    setDraggedNote(null);
  };

  const handleContentChange = (noteId: string, content: string) => {
    updateFreestyleNote(noteId, { content });
  };

  const handleColorChange = (noteId: string, color: string) => {
    updateFreestyleNote(noteId, { color });
  };

  const handleDeleteNote = (noteId: string) => {
    deleteFreestyleNote(noteId);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-violet-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Freestyle</h1>
            <p className="text-sm text-slate-500">Free-form space for notes, ideas, and brainstorming</p>
          </div>
        </div>
        <button
          onClick={handleAddNote}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </button>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative h-[600px] overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white"
      >
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Notes */}
        {freestyleNotes.map(note => (
          <div
            key={note.id}
            onMouseDown={e => handleMouseDown(e, note.id, note)}
            className={cn(
              'absolute w-56 rounded-lg p-4 shadow-lg transition-shadow hover:shadow-xl',
              draggedNote === note.id ? 'cursor-grabbing z-50 scale-105' : 'cursor-grab'
            )}
            style={{
              left: note.position.x,
              top: note.position.y,
              backgroundColor: note.color,
            }}
          >
            {/* Note Header */}
            <div className="mb-2 flex items-center justify-between">
              <Move className="h-4 w-4 text-slate-400" />
              <div className="flex items-center gap-1">
                {/* Color Selector */}
                <div className="flex gap-1">
                  {noteColors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(note.id, color)}
                      className={cn(
                        'h-4 w-4 rounded-full border-2 transition-transform hover:scale-110',
                        note.color === color ? 'border-slate-600' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="ml-2 rounded p-1 text-slate-400 hover:bg-white/50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Note Content */}
            <textarea
              value={note.content}
              onChange={e => handleContentChange(note.id, e.target.value)}
              className="w-full resize-none bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
              rows={5}
              placeholder="Write something..."
            />
          </div>
        ))}

        {/* Empty State */}
        {freestyleNotes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <StickyNote className="mb-4 h-16 w-16 text-slate-300" />
            <p className="text-lg font-medium">No notes yet</p>
            <p className="text-sm">Click "Add Note" to create your first note</p>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="mb-3 font-semibold text-slate-700">Tips</h3>
        <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs text-violet-600">1</span>
            Drag notes anywhere on the canvas
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs text-violet-600">2</span>
            Click the color dots to change note color
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs text-violet-600">3</span>
            Click inside to edit the note content
          </li>
        </ul>
      </div>
    </div>
  );
}
