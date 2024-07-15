const axios = require("axios");
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
        ],
        model: "llama3-70b-8192",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null
    };

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            }
        });

        if (response.status === 200) {
            const assistantMessage = { role: "assistant", content: response.data.choices[0].message.content };
            chatHistory[userId].push({ role: "user", content: prompt }, assistantMessage);

            res.json({ result: assistantMessage.content, history: messages });
        } else {
            throw new Error('Non-200 response');
        }
    } catch (error) {
        console.error('Error request:', error);

        chatHistory[userId] = [];
        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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'
                }
            });

            if (response.status === 200) {
                const assistantMessage = { role: "assistant", content: response.data.choices[0].message.content };
                chatHistory[userId].push({ role: "user", content: prompt }, assistantMessage);

                res.json({ result: assistantMessage.content, history: messages });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } catch (retryError) {
            res.status(500).json({ error: retryError.message });
            console.error('Retry error request:', retryError);
        }
    }
};

module.exports = { handleChat }