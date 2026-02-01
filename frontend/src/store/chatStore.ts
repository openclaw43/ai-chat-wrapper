import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  isLoading: boolean
  
  createConversation: () => void
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  
  createConversation: () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    set({ currentConversation: newConv })
  },
  
  addMessage: (message: Message) => {
    set((state) => {
      if (!state.currentConversation) return state
      
      const updatedConv = {
        ...state.currentConversation,
        messages: [...state.currentConversation.messages, message],
        updatedAt: new Date()
      }
      
      return { currentConversation: updatedConv }
    })
  },
  
  setLoading: (loading: boolean) => set({ isLoading: loading })
}))
