# 🎭 AI Chat Wrapper

**Multi-model AI chat client with profiles, branched conversations, and smart memory capture.**

## 🚀 Overview

AI Chat Wrapper is a sophisticated chat interface that orchestrates multiple AI models through OpenRouter, enabling:

- **Multi-Model Conversations**: Seamlessly switch between AI models mid-conversation
- **Branched Chats**: Fork conversations to explore different paths
- **Intelligent Profiles**: Model-specific profiles with custom instructions
- **Smart Memory Capture**: Automatic extraction and storage of key information
- **Flexible UI**: Web-based interface for desktop and mobile

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express (or Fastify)
- **API**: OpenRouter API for model access
- **Database**: SQLite for conversations & branches
- **Storage**: JSON files for profiles & memories

## 📦 Features

### Phase 1: Core Chat
- [ ] Model selection dropdown (OpenRouter integration)
- [ ] Basic chat interface with message history
- [ ] Save/load conversations
- [ ] Export conversations (Markdown, JSON, PDF)

### Phase 2: Branches & Profiles  
- [ ] Conversation branching/forking
- [ ] Create and manage model profiles
- [ ] Profile-specific system prompts
- [ ] Visual branch navigation

### Phase 3: Smart Features
- [ ] Automatic memory capture & storage
- [ ] Semantic search across conversations
- [ ] Chat templates & prompt library
- [ ] Voice input/output support

### Phase 4: Advanced
- [ ] Multi-model parallel responses
- [ ] Response comparison view
- [ ] Custom API endpoint support
- [ ] Plugin system for tools

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/openclaw43/ai-chat-wrapper.git
cd ai-chat-wrapper
npm install

# Copy env file and add your OpenRouter API key
cp .env.example .env
```

### Development

```bash
# Start backend
npm run dev:server

# Start frontend (in another terminal)
npm run dev:client
```

## 🔐 API Keys

This project requires API keys for:
- OpenRouter (required)
- ElevenLabs (optional, for TTS)

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

This is an open project! Check out the GitHub issues to see what needs to be done.
