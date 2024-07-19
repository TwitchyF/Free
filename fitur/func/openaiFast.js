const Groq = require('groq-sdk');
const axios = require('axios');
const groq = new Groq({apiKey:'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'});

const handleChat = async (req, res, systemMessage) => {
    const userId = req.query.user;
    const prompt = req.query.text;

    try {
        // Membaca riwayat percakapan dari API
        let readResponse = {data:{}}
        try {
         readResponse = await axios.get(`https://copper-ambiguous-velvet.glitch.me/read/${userId}`);
        } catch (error) {
         await axios.get(`https://copper-ambiguous-velvet.glitch.me/write/${userId}?json={}`)
        readResponse.data = []
        }
        const chatHistory = readResponse.data[userId] || [];

        const messages = chatHistory;
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
            max_tokens: 500,
            top_p: 1,
            stream: false,
            stop: "\n\n\n"
        });

        const assistantMessage = { role: "assistant", content: response.choices[0].message.content.trim() };
        chatHistory.push({ role: "user", content: prompt }, assistantMessage);

        // Batasi chatHistory hanya sampai 20 percakapan terbaru
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }

        assistantMessage.content = assistantMessage.content.replace(/\n\n/g, '\n    ');
        assistantMessage.content = assistantMessage.content.replace(/\*\*/g, '*');

        // Menyimpan riwayat percakapan ke API
        await axios.get(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
            params: {
                json: JSON.stringify({ [userId]: chatHistory })
            }
        });

        res.json({ result: assistantMessage.content, history: messages });
    } catch (error) {
        console.error('Error request:', error);

        // Menghapus riwayat percakapan jika terjadi kesalahan
        await axios.get(`https://copper-ambiguous-velvet.glitch.me/delete/${userId}`);
        res.status(500).json({ error: 'Error request' });
    }
};

module.exports = { handleChat };