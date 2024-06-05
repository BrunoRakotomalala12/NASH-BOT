const axios = require('axios');

module.exports = {
  name: 'frog',
  description: 'An AI command powered by Neuronspike, modified by Joshua Apostol',
  aliases: ['Frog'],
  cooldown: 3,
  nashPrefix: false,
  execute: async function ({ api, event, args }) {
    
    async function fetchFromAI(url, params) {
      try {
        const response = await axios.get(url, { params });
        return response.data;
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    async function getAIResponse(input, userId, messageID) {
      const services = [
        { url: 'https://ai-tools.replit.app/gpt', params: { prompt: input, uid: userId } },
        { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: input } }
      ];

      let response = "First learn Hindi and English ok";
      let currentIndex = 0;

      for (let i = 0; i < services.length; i++) {
        const service = services[currentIndex];
        const data = await fetchFromAI(service.url, service.params);
        if (data && (data.gpt4 || data.reply || data.response)) {
          response = data.gpt4 || data.reply || data.response;
          break;
        }
        currentIndex = (currentIndex + 1) % services.length; // Move to the next service in the cycle
      }

      return { response, messageID };
    }

    const input = args.join(' ').trim();
    if (!input) {
      api.sendMessage(`kuch to bol machikney`, event.threadID, event.messageID);
      return;
    }

    const { response, messageID } = await getAIResponse(input, event.senderID, event.messageID);
    api.sendMessage(`${response}•`, event.threadID, messageID);
  },
  
  onChat: async function ({ event, message }) {
    const messageContent = event.body.trim().toLowerCase();
    if (messageContent.startsWith("ai")) {
      const input = messageContent.replace(/^ai\s*/, "").trim();
      const { response, messageID } = await getAIResponse(input, event.senderID, message.messageID);
      message.reply(`${response}`, messageID);
    }
  }
};
