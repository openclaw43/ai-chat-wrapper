export interface Branch {
  id: string;
  conversationId: string;
  parentMessageId: string | null;
  title: string;
  createdAt: Date;
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
  branchId?: string | null
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  currentBranch: string | null
  createdAt: Date
  updatedAt: Date
}

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  currentBranch: string | null
  isLoading: boolean
  
  createConversation: () => void
  createBranch: (messageId: string, branchTitle: string) => void
  switchBranch: (branchId: string | null) => void
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  loadConversation: (conversation: Conversation) => void
  updateBranchTitle: (branchId: string, title: string) => void
  deleteBranch: (branchId: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentConversation: null,
  currentBranch: null,
  isLoading: false,
  
  createConversation: () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      currentBranch: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    set({ currentConversation: newConv, currentBranch: null })
  },
  
  createBranch: (messageId: string, branchTitle: string) => {
    set((state) => {
      if (!state.currentConversation) return state
      
      const newBranch: Branch = {
        id: Date.now().toString(),
        conversationId: state.currentConversation.id,
        parentMessageId: messageId,
        title: branchTitle,
        createdAt: new Date()
      }
      
      const updatedConv = {
        ...state.currentConversation,
        currentBranch: newBranch.id,
        updatedAt: new Date()
      }
      
      return { currentConversation: updatedConv, currentBranch: newBranch.id }
    })
  },
  
  switchBranch: (branchId: string | null) => {
    set((state) => {
      if (!state.currentConversation) return state
      
      const updatedConv = {
        ...state.currentConversation,
        currentBranch: branchId,
        updatedAt: new Date()
      }
      
      return { currentConversation: updatedConv, currentBranch: branchId }
    })
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
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  loadConversation: (conversation: Conversation) => {
    set({ currentConversation: conversation, currentBranch: conversation.currentBranch || null })
  },
  
  updateBranchTitle: (branchId: string, title: string) => {
    set((state) => {
      if (!state.currentConversation) return state
      
      const updatedConv = {
        ...state.currentConversation,
        updatedAt: new Date()
      }
      
      return { currentConversation: updatedConv }
    })
  },
  
  deleteBranch: (branchId: string) => {
    set((state) => {
      if (!state.currentConversation || state.currentBranch === branchId) return state
      
      const updatedConv = {
        ...state.currentConversation,
        updatedAt: new Date()
      }
      
      return { currentConversation: updatedConv }
    })
  }
}))