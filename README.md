# Nova AI

> A focused AI workspace for asking questions, exploring ideas, and getting help with code.

Nova AI is a responsive React chat application powered by Google's Gemini API. It combines a calm, minimal interface with persistent local chat history, quick-start prompts, Markdown-friendly responses, and an Express backend that keeps the Gemini API key out of the browser.

## Showcase

<!-- Replace these placeholders with screenshots from the running app. -->

### Main workspace

![Nova AI workspace screenshot](/Ai-Chatbot/screenshots/UI.png)

<!-- _Add a screenshot of the empty-state workspace here._- -->

### Conversation view

![Nova AI conversation screenshot](/Ai-Chatbot/screenshots/Converstion.png)

<!-- _Add a screenshot showing a completed conversation and recent chats here._ -->


## Highlights

- **Natural AI conversations** through the Gemini API
- **Quick actions** for React explanations, code help, and project ideas
- **Persistent chat history** saved locally in the browser
- **Recent chat navigation** with automatic conversation titles
- **Responsive interface** for desktop and smaller screens
- **Markdown and GitHub-Flavored Markdown** support for readable answers and code
- **Separate API server** so credentials remain on the server side

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Icons | Lucide React |
| Content rendering | React Markdown, Remark GFM |
| Backend | Node.js, Express 5, CORS |
| AI | Google Gemini via `@google/genai` |
| Storage | Browser `localStorage` |

## Project Structure

```text
Ai-Chatbot/
├── public/                 # Static assets
├── server/
│   ├── server.js           # Express API and Gemini integration
│   └── package.json        # Backend dependencies and start script
├── src/
│   ├── components/         # Chat, sidebar, message, and input UI
│   ├── services/           # Frontend service helpers
│   ├── App.jsx             # Chat state and application shell
│   ├── App.css
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Setup

### Prerequisites

- Node.js 18 or newer
- A Google Gemini API key

### 1. Install dependencies

From the project root:

```bash
npm install
cd server
npm install
```

### 2. Configure the Gemini API key

Create `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Keep this file private and do not commit it to source control.

### 3. Start the backend

In one terminal:

```bash
cd server
npm start
```

The API runs at `http://localhost:5000`.

### 4. Start the frontend

In a second terminal, from the project root:

```bash
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## API

### `GET /`

Returns a basic backend health response.

### `POST /api/chat`

Request:

```json
{
  "message": "Explain React hooks"
}
```

Response:

```json
{
  "reply": "..."
}
```

## Available Scripts

Run these from the project root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production frontend build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

Run `npm start` inside `server/` to start the API.

## Notes

- The frontend currently calls `http://localhost:5000/api/chat` directly.
- Chat history is stored under the browser key `nova-ai-chats`.
- Clearing browser storage removes saved conversations from that browser.
