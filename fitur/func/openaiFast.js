const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const randomPick = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};
const apiKey = randomPick(['AIzaSyAS6CLgV1nFuSksdMBwo4gQfro1fHUFBHU','AIzaSyB2tVdHido-pSjSNGrCrLeEgGGW3y28yWg']);
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
    model: "gemini-1.5-pro",
    systemInstruction: systemMessage,
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 500,
    responseMimeType: "text/plain",
  };

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
    } else {
      throw new Error('Failed to generate response');
    }
  } catch (error) {
    console.error('Error request:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { handleChat };