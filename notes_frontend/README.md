# Notes Frontend (React)

A modern, minimal, and responsive UI to manage personal notes. It connects to the notes_backend via REST.

## Features
- List all notes
- Create a new note
- Edit existing note
- Delete note
- Responsive layout with top navigation, grid of notes, floating action button, and modals

## API
- Base URL: `http://localhost:3001`
- Expected endpoints:
  - `GET /notes` → list notes
  - `POST /notes` → create note, body: `{ "title": string, "content": string }`
  - `PUT /notes/{id}` → update note by id
  - `DELETE /notes/{id}` → delete note by id

Ensure the backend is running and accessible at `http://localhost:3001`.

## Development
- `npm start` → dev server on http://localhost:3000
- The UI makes client-side requests to the backend. For cross-origin setups, configure CORS on the backend.

## Theming
This project uses a light theme with colors:
- primary: `#1976d2`
- secondary: `#424242`
- accent: `#fbc02d`

These are applied via inline styles and minimal CSS in `src/App.css`.
