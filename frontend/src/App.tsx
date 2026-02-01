import ChatPanel from './components/ChatPanel'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Chat Wrapper</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ChatPanel />
      </main>
    </div>
  )
}

export default App
