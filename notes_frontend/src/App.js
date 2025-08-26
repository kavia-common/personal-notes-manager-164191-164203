import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

// Constants for theming and API
const THEME = {
  primary: '#1976d2',
  secondary: '#424242',
  accent: '#fbc02d',
  lightBg: '#ffffff',
  lightSurface: '#f8f9fa',
  lightText: '#1f2937'
};

const API_BASE_URL = 'http://localhost:3001';

// PUBLIC_INTERFACE
function App() {
  /**
   * This is the main Notes application component.
   * - Renders a top navigation bar
   * - Displays a list/grid of notes
   * - Provides a floating action button for creating notes
   * - Opens modals for creating and editing notes
   * - Integrates with a backend via REST API for CRUD operations
   */
  const [theme] = useState('light');

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  // Fetch all notes on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchNotes();
  }, []);

  // Helpers
  const headersJson = useMemo(() => ({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }), []);

  async function fetchNotes() {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/notes`, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        throw new Error(`Failed to load notes (${res.status})`);
      }
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function createNote(payload) {
    /**
     * Create a new note via backend.
     * payload: { title: string, content: string }
     */
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: headersJson,
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to create note (${res.status})`);
      }
      await fetchNotes();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create note');
      throw err;
    }
  }

  // PUBLIC_INTERFACE
  async function updateNote(id, payload) {
    /**
     * Update an existing note via backend.
     * id: number|string
     * payload: { title?: string, content?: string }
     */
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'PUT',
        headers: headersJson,
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to update note (${res.status})`);
      }
      await fetchNotes();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update note');
      throw err;
    }
  }

  // PUBLIC_INTERFACE
  async function deleteNote(id) {
    /**
     * Delete a note via backend.
     * id: number|string
     */
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to delete note (${res.status})`);
      }
      await fetchNotes();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete note');
      throw err;
    }
  }

  function openCreateModal() {
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setIsModalOpen(true);
  }

  function openEditModal(note) {
    setEditingNote(note);
    setFormTitle(note?.title || '');
    setFormContent(note?.content || '');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      title: formTitle.trim(),
      content: formContent.trim()
    };
    if (!payload.title) {
      setErrorMsg('Title is required.');
      return;
    }
    try {
      if (editingNote) {
        await updateNote(editingNote.id, payload);
      } else {
        await createNote(payload);
      }
      closeModal();
    } catch {
      // error already set in helper
    }
  }

  return (
    <div className="App">
      <TopNav />
      <main style={styles.main}>
        <div style={styles.container}>
          {errorMsg && <div role="alert" style={styles.error}>{errorMsg}</div>}

          {loading ? (
            <div style={styles.loading}>Loading notes…</div>
          ) : (
            <NotesGrid
              notes={notes}
              onEdit={openEditModal}
              onDelete={(id) => deleteNote(id)}
            />
          )}
        </div>

        <button
          style={styles.fab}
          aria-label="Create new note"
          onClick={openCreateModal}
          title="Create note"
        >
          +
        </button>
      </main>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <h3 style={styles.modalTitle}>{editingNote ? 'Edit Note' : 'New Note'}</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Title
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                style={styles.input}
                placeholder="Note title"
                maxLength={120}
                autoFocus
              />
            </label>
            <label style={styles.label}>
              Content
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                style={styles.textarea}
                rows={6}
                placeholder="Write your note..."
              />
            </label>
            <div style={styles.actions}>
              <button type="button" onClick={closeModal} style={styles.btnSecondary}>Cancel</button>
              <button type="submit" style={styles.btnPrimary}>{editingNote ? 'Save' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function TopNav() {
  return (
    <header style={styles.navbar} role="banner">
      <div style={styles.navbarInner}>
        <div style={styles.brand}>
          <span style={styles.brandDot} />
          <span style={styles.brandText}>Notes</span>
        </div>
      </div>
    </header>
  );
}

function NotesGrid({ notes, onEdit, onDelete }) {
  if (!notes?.length) {
    return (
      <div style={styles.emptyState}>
        <h3 style={styles.emptyTitle}>No notes yet</h3>
        <p style={styles.emptySubtitle}>Create your first note using the + button.</p>
      </div>
    );
  }

  return (
    <section aria-label="Notes list" style={styles.grid}>
      {notes.map((n) => (
        <article key={n.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle} title={n.title}>{n.title}</h4>
            <div style={styles.cardActions}>
              <button
                onClick={() => onEdit(n)}
                style={styles.iconButton}
                aria-label={`Edit ${n.title}`}
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(n.id)}
                style={{ ...styles.iconButton, color: '#d32f2f' }}
                aria-label={`Delete ${n.title}`}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
          {n.content && <p style={styles.cardContent}>{n.content}</p>}
        </article>
      ))}
    </section>
  );
}

function Modal({ children, onClose }) {
  useEffect(() => {
    function onKeydown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button aria-label="Close" onClick={onClose} style={styles.modalClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

// Inline styles for simplicity and to align with minimal dependency requirement
const styles = {
  main: {
    background: THEME.lightBg,
    minHeight: '100vh',
    paddingTop: 64
  },
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '1rem'
  },
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    background: THEME.lightBg,
    borderBottom: '1px solid #e5e7eb',
    zIndex: 10
  },
  navbarInner: {
    maxWidth: 960,
    margin: '0 auto',
    width: '100%',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  brandDot: {
    width: 12,
    height: 12,
    background: THEME.primary,
    borderRadius: '50%'
  },
  brandText: {
    fontWeight: 700,
    color: THEME.lightText,
    letterSpacing: 0.3
  },
  fab: {
    position: 'fixed',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: THEME.primary,
    color: '#fff',
    border: 'none',
    boxShadow: '0 8px 20px rgba(25, 118, 210, 0.35)',
    fontSize: 28,
    lineHeight: '56px',
    cursor: 'pointer',
    transition: 'transform .15s ease, box-shadow .2s ease'
  },
  error: {
    background: '#fdecea',
    color: '#b71c1c',
    border: '1px solid #f5c6cb',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    marginBottom: '1rem',
    fontSize: 14
  },
  loading: {
    color: THEME.secondary,
    padding: '1.25rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem'
  },
  card: {
    background: THEME.lightSurface,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '0.875rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    color: THEME.lightText,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '70%'
  },
  cardContent: {
    margin: 0,
    color: '#374151',
    fontSize: 14,
    whiteSpace: 'pre-wrap'
  },
  cardActions: {
    display: 'flex',
    gap: 6
  },
  iconButton: {
    background: 'transparent',
    border: 'none',
    color: THEME.secondary,
    cursor: 'pointer',
    padding: 6,
    borderRadius: 8
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: THEME.secondary
  },
  emptyTitle: {
    margin: 0,
    fontSize: 20,
    color: THEME.lightText
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6b7280'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 50
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: 520,
    background: '#fff',
    borderRadius: 12,
    padding: '1rem 1rem 1.25rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    border: '1px solid #e5e7eb'
  },
  modalTitle: {
    margin: '0 0 .5rem',
    color: THEME.lightText
  },
  modalClose: {
    position: 'absolute',
    right: 8,
    top: 4,
    border: 'none',
    background: 'transparent',
    fontSize: 22,
    color: THEME.secondary,
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 8
  },
  label: {
    fontSize: 13,
    color: THEME.secondary,
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none'
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    resize: 'vertical'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4
  },
  btnPrimary: {
    background: THEME.primary,
    border: 'none',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600
  },
  btnSecondary: {
    background: '#e5e7eb',
    border: 'none',
    color: '#111827',
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 500
  }
};

export default App;
