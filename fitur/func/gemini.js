const axios = require('axios');
let chatHistory = [];

const gemini = async (systemMessage, prompt, userId) => {
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

            const formattedMessages = payload.messages.map(msg => `${msg.role === "system" ? "System" : "User"}: ${msg.content}`).join("\n");
            const apiUrl = `https://nue-api.vercel.app/api/gemini?prompt=[${formattedMessages}]\nPermintaan-baru: ${prompt}`;

            const response = await axios.get(apiUrl);

            if (response.data.status !== 200) {
                throw new Error('Request failed');
            }

            const assistantMessage = { role: "assistant", content: response.data.result.trim() };
            chatHistory.push({ role: "user", content: prompt }, assistantMessage);

            if (chatHistory.length > 20) {
                chatHistory = chatHistory.slice(-20);
            }

            assistantMessage.content = assistantMessage.content.replace(/\n\n/g, '\n    ');
            assistantMessage.content = assistantMessage.content.replace(/\*\*/g, '*');

            await axios.get(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
                params: {
                    json: JSON.stringify({ [userId]: chatHistory })
                }
            });

            return { result: assistantMessage.content, history: messages };
        } catch (error) {
            return false;
        }
    };

    try {
        let readResponse = { data: {} };
        try {
            readResponse = await axios.get(`https://copper-ambiguous-velvet.glitch.me/read/${userId}`);
        } catch (error) {
            await axios.get(`https://copper-ambiguous-velvet.glitch.me/write/${userId}?json={}`);
            readResponse.data = [];
        }
        chatHistory = readResponse.data[userId] || [];

        let success;
        for (let sliceLength = 100; sliceLength >= 0; sliceLength -= 5) {
            success = await sendRequest(sliceLength);
            if (success) break;
        }

        if (!success) {
            chatHistory = [];
            success = await sendRequest(0);
        }
        if (!success) throw new Error('All retries failed');

        return success;
    } catch (error) {
        await axios.get(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
            params: {
                json: JSON.stringify({ [userId]: [] })
            }
        });
        console.error('Error request:', error);
        return { error: 'Internal Server Error' };
    }
};

module.exports = { gemini };