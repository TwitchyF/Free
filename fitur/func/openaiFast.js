const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = 'AIzaSyAS6CLgV1nFuSksdMBwo4gQfro1fHUFBHU';
const genAI = new GoogleGenerativeAI(apiKey);

let chatHistory = [];

const handleChat = async (req, res, systemMessage) => {
  const userId = req.query.user;
  const prompt = req.query.text;
  chatHistory[userId] = chatHistory[userId] || [];

  const messages = chatHistory[userId];
  const history = messages.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemMessage,
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 500,
    responseMimeType: "text/plain",
  };

  const maxRetries = 1000; // Maximum number of retries
  let attempts = 0;
  let success = false;

  while (attempts < maxRetries && !success) {
    attempts += 1;
    try {
      const chatSession = model.startChat({
        generationConfig,
        history,
      });

      const result = await chatSession.sendMessage(prompt);

      if (result) {
        const modelMessage = { role: "model", content: result.response.text() };
        chatHistory[userId].push({ role: "user", content: prompt }, modelMessage);

        res.json({ result: modelMessage.content, history: messages });
        success = true;
      } else {
        throw new Error('Failed to generate response');
      }
    } catch (error) {
      console.error(`Attempt ${attempts} - Error request:`, error);
      if (attempts >= maxRetries) {
        res.status(500).json({ error: error.message });
      }
    }
  }
};

module.exports = { handleChat };