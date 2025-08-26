# Notes Frontend (React)

A modern, minimal, and responsive UI to manage personal notes. It connects to the notes_backend via REST.

## Features
- List all notes
- Create a new note
- Edit existing note
- Delete note
- Responsive layout with top navigation, grid of notes, floating action button, and modals

## API
- Base URL: configurable via environment variable `REACT_APP_API_BASE_URL`
  - Defaults to `http://localhost:3001` if not set
- Expected endpoints:
  - `GET /notes` → list notes
  - `POST /notes` → create note, body: `{ "title": string, "content": string }`
  - `PUT /notes/{id}` → update note by id
  - `DELETE /notes/{id}` → delete note by id

Ensure the backend is running and accessible at the configured base URL.

## Configuration
- Copy `.env.example` to `.env` and adjust:
  ```
  REACT_APP_API_BASE_URL=http://localhost:3001
  ```
- Restart the dev server after changing `.env`.

## Development
- `npm start` → dev server on http://localhost:3000
- The UI makes client-side requests to the backend. Ensure the backend CORS allows `http://localhost:3000`.

## Theming
This project uses a light theme with colors:
- primary: `#1976d2`
- secondary: `#424242`
- accent: `#fbc02d`

These are applied via inline styles and minimal CSS in `src/App.css`.
