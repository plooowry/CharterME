# 🏗️ CharterME – Chartership Progress Tracker & Application Assistant

**CharterME** is a web-based assistant for engineers and technical professionals working toward **Chartered Engineer (CEng)** or similar professional status. It helps users **track competencies**, **manage supporting evidence**, and even **draft their final application** with the aid of AI.

---

## 🚀 Features

- ✅ **Competency Navigator**  
  Browse through engineering competencies (e.g., UK-SPEC A–E) and track your progress.

- 📎 **Evidence Hub**  
  Upload, organise, and tag evidence mapped to specific competencies and sub-competencies.

- 🤖 **AI Application Drafter**  
  Generate tailored draft applications based on your competency inputs and evidence, using the Gemini API.

- 📚 **Resource Hub**  
  Access official guides, best-practice examples, and support materials.

- 🔐 **User Authentication**  
  Secure login system with user-specific views and saved progress.

---

## 🧱 Tech Stack

- **Frontend:** React + TypeScript + TailwindCSS
- **Routing:** React Router DOM
- **State Management:** React Context API
- **AI Integration:** Gemini API (`.env.local`)
- **Bundler:** Vite

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+)
- Gemini API Key (for AI drafting)

### Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/plooowry/CharterME.git
cd CharterME

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
echo "GEMINI_API_KEY=your-key-here" > .env.local

# 4. Run the development server
npm run dev
