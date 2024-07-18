const Groq = require('groq-sdk');
const groq = new Groq({apiKey:'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'});
let chatHistory = [];

const handleChat = async (req, res, systemMessage) => {
    const userId = req.query.user;
    const prompt = req.query.text;
    chatHistory[userId] = chatHistory[userId] || [];

    const messages = chatHistory[userId];
    const payload = {
        messages: [
            { role: "system", content: systemMessage },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: prompt }
        ]
    };

    try {
        const response = await groq.chat.completions.create({
            messages: payload.messages,
            model: "Gemma2-9b-It",
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            stream: false,
            stop: "."
        });

        const assistantMessage = { role: "assistant", content: response.choices[0].message.content.trim() };
        chatHistory[userId].push({ role: "user", content: prompt }, assistantMessage);

        // Batasi chatHistory hanya sampai 20 percakapan terbaru
        if (chatHistory[userId].length > 20) {
            chatHistory[userId] = chatHistory[userId].slice(-20);
        }

        res.json({ result: assistantMessage.content, history: messages });
    } catch (error) {
        console.error('Error request:', error);

        chatHistory[userId] = [];
        res.status(500).json({ error: 'Error request' });
    }
};

module.exports = { handleChat };