const Groq = require('groq-sdk');
const axios = require('axios');
const groq = new Groq({ apiKey: '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' });
let chatHistory = [];

const handleChat = async (req, res, systemMessage) => {
    const userId = req.query.user;
    const prompt = req.query.text;
    systemMessage = systemMessage || req.query.systemPrompt

    const sendRequest = async (sliceLength) => {
        try {
            const messages = chatHistory.slice(-sliceLength);
            const payload = {
                messages: [
                    { role: "system", content: systemMessage },
                    ...messages.map(msg => ({ role: msg.role, content: msg.content })),
                    { role: "user", content: prompt }
                ]
            };

            const response = await groq.chat.completions.create({
                messages: payload.messages,
                model: "Gemma2-9b-It",
                temperature: 1,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: "\n\n\n"
            });

            const assistantMessage = { role: "assistant", content: response.choices[0].message.content.trim() };
            chatHistory.push({ role: "user", content: prompt }, assistantMessage);

            assistantMessage.content = assistantMessage.content.replace(/\n\n/g, '\n    ');
            assistantMessage.content = assistantMessage.content.replace(/\*\*/g, '*');

            await axios.get(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
                params: {
                    json: JSON.stringify({ [userId]: chatHistory })
                }
            });

            res.json({ result: assistantMessage.content, history: messages });
            return true;
        } catch (error) {
            return false;
        }
    };

    try {
        let readResponse = { data: {} }
        try {
            readResponse = await axios.get(`https://copper-ambiguous-velvet.glitch.me/read/${userId}`);
        } catch (error) {
            await axios.get(`https://copper-ambiguous-velvet.glitch.me/write/${userId}?json={}`)
            readResponse.data = []
        }
        chatHistory = readResponse.data[userId] || [];

        let sliceLength = chatHistory.length;
        let success = await sendRequest(sliceLength);
        while (!success && sliceLength > 0) {
            sliceLength -= 5;
            success = await sendRequest(sliceLength);
        }
        if (!success) throw new Error('All retries failed');
    } catch (error) {
        await axios.get(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
            params: {
                json: JSON.stringify({ [userId]: [] })
            }
        });
        console.error('Error request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { handleChat };