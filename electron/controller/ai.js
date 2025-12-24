const { Controller } = require('ee-core');
const Services = require('ee-core/services');

class AiController extends Controller {
  constructor(ctx) {
    super(ctx);
  }

  async sendMessage(args) {
    const { conversationId, message, configId } = args;

    try {
      const aiService = Services.get('ai');

      const userMessage = await aiService.createMessage({
        conversation_id: conversationId,
        role: 'user',
        content: message
      });

      const config = await aiService.getAiConfig(configId);

      if (!config) {
        throw new Error('AI configuration not found');
      }

      const response = await aiService.generateResponse(message, config);

      const assistantMessage = await aiService.createMessage({
        conversation_id: conversationId,
        role: 'assistant',
        content: response
      });

      await aiService.updateConversation(conversationId);

      return {
        success: true,
        userMessage,
        assistantMessage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createConversation(args) {
    const { title, aiConfigId } = args;

    try {
      const aiService = Services.get('ai');
      const conversation = await aiService.createConversation({ title, ai_config_id: aiConfigId });

      return {
        success: true,
        conversation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getConversations() {
    try {
      const aiService = Services.get('ai');
      const conversations = await aiService.getAllConversations();

      return {
        success: true,
        conversations
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getMessages(args) {
    const { conversationId } = args;

    try {
      const aiService = Services.get('ai');
      const messages = await aiService.getMessages(conversationId);

      return {
        success: true,
        messages
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteConversation(args) {
    const { conversationId } = args;

    try {
      const aiService = Services.get('ai');
      await aiService.deleteConversation(conversationId);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

AiController.toString = () => '[class AiController]';
module.exports = AiController;
