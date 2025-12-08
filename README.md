# Socratic Tutor

Socratic Tutor is an advanced AI-powered learning companion designed to help students learn through guided questioning, storytelling, and debate. Built with React, Vite, and the Google Gemini API, it offers a personalized and interactive educational experience.

## Features

### 🤖 AI Learning Companion
Interact with a sophisticated AI tutor that adapts to your learning style.
*   **Socratic Mode:** Guides you to answers through questions rather than giving direct solutions.
*   **Storyteller Mode:** Explains complex concepts through engaging narratives and analogies.
*   **Debate Mode:** Challenges your understanding through constructive, philosophical dialogue.
*   **Voice Interaction:** Capable of recognizing tone and emotion to adjust its responses (e.g., slowing down if you sound frustrated).

### 💻 Live Coding Assistant
A dedicated environment for coding practice.
*   Write and edit code directly in the browser.
*   Get instant AI analysis to explain code, identify bugs, and suggest optimizations.

### 💬 Discussions
A community space to explore topics, ask questions, and share knowledge with peers.

## Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **AI Model:** Google Gemini (using `gemini-3-pro-preview`)
*   **Markdown:** `react-markdown` for rendering rich text and code blocks

## Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn
*   A Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Yae-sine/Socratic-Tutor.git
    cd Socratic-Tutor
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    VITE_API_KEY=your_google_gemini_api_key_here
    ```
    *(Note: The code currently references `process.env.API_KEY`. Ensure your Vite config or code is set up to read this correctly, typically via `import.meta.env.VITE_API_KEY` in Vite projects).*

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Open the application**
    Visit `http://localhost:5173` in your browser.

## Usage

1.  **Select a Mode:** Choose between Socratic, Storyteller, or Debate modes in the Learning Companion.
2.  **Start Chatting:** Type your questions or use the voice feature to interact.
3.  **Practice Coding:** Switch to the Live Coding tab to work on programming problems with AI assistance.

## License

This project is licensed under the MIT License.
