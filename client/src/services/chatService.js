import api from './authService';

export const chatService = {
  getChats: async () => {
    const response = await api.get('/api/chats');
    return response.data;
  },

  saveChat: async (chatData) => {
    const response = await api.post('/api/chats', chatData);
    return response.data;
  },

  deleteChat: async (chatId) => {
    const response = await api.delete(`/api/chats/${chatId}`);
    return response.data;
  }
};
