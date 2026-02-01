import { Router, Request, Response } from 'express';
import { openRouterService } from '../services/OpenRouterService';
import { dbQueries } from '../db/database';

const router = Router();

router.post('/api/chat', async (req: Request, res: Response) => {
  const { conversationId, message, model, branchId } = req.body;

  if (!conversationId || !message || !model) {
    return res.status(400).json({ error: 'Missing required fields: conversationId, message, model' });
  }

  try {
    const conversation = dbQueries.getConversation.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Use the default branch (null) if no branchId is provided
    const activeBranchId = branchId || null;

    dbQueries.createMessage.run(conversationId, activeBranchId, 'user', message);

    const existingMessages = branchId 
      ? dbQueries.getMessagesByBranch.all(branchId)
      : dbQueries.getMessages.all(conversationId);
    
    const messages = existingMessages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let assistantMessage = '';

    try {
      for await (const chunk of openRouterService.streamChatCompletion({ model, messages })) {
        assistantMessage += chunk;
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      dbQueries.createMessage.run(conversationId, activeBranchId, 'assistant', assistantMessage);

      dbQueries.updateConversationModel.run(model, conversationId);

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (streamError) {
      res.write(`data: ${JSON.stringify({ error: streamError instanceof Error ? streamError.message : 'Stream error' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
  }
});

router.get('/api/models', async (req: Request, res: Response) => {
  try {
    const models = await openRouterService.getModels();
    res.json({ models });
  } catch (error) {
    console.error('Models error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch models' });
  }
});

router.get('/api/conversations', (req: Request, res: Response) => {
  try {
    const conversations = dbQueries.listConversations.all();
    res.json({ conversations });
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch conversations' });
  }
});

router.post('/api/conversations', (req: Request, res: Response) => {
  try {
    const conversation = dbQueries.createConversation.get();
    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create conversation' });
  }
});

router.get('/api/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversationId = parseInt(id, 10);

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const conversation = dbQueries.getConversation.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = dbQueries.getMessages.all(conversationId);

    res.json({ conversation, messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch conversation' });
  }
});

router.put('/api/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversationId = parseInt(id, 10);
    const { title, model } = req.body;

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const conversation = dbQueries.getConversation.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (title !== undefined) {
      dbQueries.updateConversationTitle.run(title, conversationId);
    }

    if (model !== undefined) {
      dbQueries.updateConversationModel.run(model, conversationId);
    }

    const updated = dbQueries.getConversation.get(conversationId);
    res.json({ conversation: updated });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update conversation' });
  }
});

router.delete('/api/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversationId = parseInt(id, 10);

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const conversation = dbQueries.getConversation.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    dbQueries.deleteConversation.run(conversationId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete conversation' });
  }
});

router.post('/api/branches', (req: Request, res: Response) => {
  try {
    const { conversationId, parentMessageId, title } = req.body;

    if (!conversationId || !title) {
      return res.status(400).json({ error: 'Missing required fields: conversationId, title' });
    }

    const conversation = dbQueries.getConversation.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const branch = dbQueries.createBranch.get(conversationId, parentMessageId || null, title);
    
    res.status(201).json({ branch });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create branch' });
  }
});

router.get('/api/conversations/:id/branches', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversationId = parseInt(id, 10);

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const conversation = dbQueries.getConversation.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const branches = dbQueries.getBranchesByConversation.all(conversationId);
    
    res.json({ branches });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch branches' });
  }
});

router.get('/api/branches/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const branchId = parseInt(id, 10);

    if (isNaN(branchId)) {
      return res.status(400).json({ error: 'Invalid branch ID' });
    }

    const branch = dbQueries.getBranch.get(branchId);

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const messages = dbQueries.getMessagesByBranch.all(branchId);
    
    res.json({ branch, messages });
  } catch (error) {
    console.error('Get branch error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch branch' });
  }
});

router.put('/api/branches/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const branchId = parseInt(id, 10);
    const { title } = req.body;

    if (isNaN(branchId)) {
      return res.status(400).json({ error: 'Invalid branch ID' });
    }

    const branch = dbQueries.getBranch.get(branchId);

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const updated = dbQueries.updateBranchTitle.run(title, branchId);
    
    res.json({ branch: updated });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update branch' });
  }
});

router.delete('/api/branches/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const branchId = parseInt(id, 10);

    if (isNaN(branchId)) {
      return res.status(400).json({ error: 'Invalid branch ID' });
    }

    const branch = dbQueries.getBranch.get(branchId);

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    dbQueries.deleteBranch.run(branchId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete branch' });
  }
});

router.get('/api/messages/:id/branches', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messageId = parseInt(id, 10);

    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const branches = dbQueries.getBranchesByParentMessage.all(messageId);
    
    res.json({ branches });
  } catch (error) {
    console.error('Get message branches error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch branches for message' });
  }
});

export default router;