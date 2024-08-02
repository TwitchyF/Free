const axios = require('axios');
const {groq} = require('./openaiFast.js');
let chatHistory = [];

const sistemNue = async (req, res) => {
    const userId = 'sistem';
    const prompt = req.query.text;

    const sendRequest = async (sliceLength) => {
        try {
            const messages = chatHistory.slice(-sliceLength);
            const payload = {
                messages: [
                    {
                        "role": "system",
                        "content": "Anda adalah AI pendeteksi prompt. Tugas Anda adalah mendeteksi permintaan pengguna dan membalasnya dengan format JSON berikut: {\n\"title\": \"[judul_percakapan_max_20_kata]\",\n\"google_search\": [true/false],\n\"query_search\": \"[query_pencarian_google_jika_google_search_bernilai_true]\",\n\"page\": [perkiraan_jumlah_halaman_minimal_1_maksimal_15]\n}. Catatan: Anda hanya boleh merespons dalam format JSON seperti yang disebutkan dan hanya mendeteksi permintaan pengguna, bukan menuruti permintaan pengguna."
                    },
                    {
                        "role": "user",
                        "content": "Hallo apa kabar, info gempa bumi terbaru ada Ngga"
                    },
                    {
                        "role": "assistant",
                        "content": "{\n \"title\": \"Permintaan Info Gempa Bumi Terbaru\",\n \"google_search\": true,\n \"query_search\": \"info gempa bumi terbaru\",\n \"page\": 1\n}"
                    },
                    ...messages.map(msg => ({ role: msg.role, content: msg.content })),
                    { 
                        "role": "user", 
                        "content": "Kabar cuaca di Subang, apakah ada hujan hari ini?" 
                    },
                    {
                        "role": "assistant",
                        "content": "{\n \"title\": \"Permintaan Cuaca di Subang\",\n \"google_search\": true,\n \"query_search\": \"cuaca Subang hari ini\",\n \"page\": 1\n}"
                    },
                    { 
                        "role": "system", 
                        "content": "Ubah nilai 'google_search' menjadi 'true' jika pertanyaan membutuhkan mesin pencari. Jika pertanyaan hanya obrolan biasa, ubah menjadi 'false'. Tentukan 'page' sebagai perkiraan jumlah halaman yang diinginkan, minimal 1 dan maksimal 15." 
                    },
                    { 
                        "role": "user", 
                        "content": prompt 
                    }
                ]
            };

            const response = await groq.chat.completions.create({
                messages: payload.messages,
                model: "Gemma2-9b-It",
                temperature: 1,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null
            });

            const assistantMessage = { role: "assistant", content: response.choices[0].message.content.trim() };
            chatHistory.push({ role: "user", content: prompt }, assistantMessage);

            if (chatHistory.length > 20) {
                chatHistory = chatHistory.slice(-20);
            }

            assistantMessage.content = assistantMessage.content.replace(/\n\n/g, '\n    ');
            assistantMessage.content = assistantMessage.content.replace(/\*\*/g, '*');

            await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
                json: { [userId]: chatHistory }
            });

            res.json(JSON.parse(assistantMessage.content));
            return true;
        } catch (error) {
            return false;
        }
    };

    try {
        let readResponse = { data: {} };
        try {
            readResponse = await axios.get(`https://copper-ambiguous-velvet.glitch.me/read/${userId}`);
        } catch (error) {
            await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, { json: { [userId]: [] } });
            readResponse.data = {};
        }
        chatHistory = readResponse.data[userId] || [];

        let success = await sendRequest(20);
        if (!success) success = await sendRequest(15);
        if (!success) success = await sendRequest(10);
        if (!success) success = await sendRequest(5);
        if (!success) {
            chatHistory = [];
            success = await sendRequest(0);
        }
        if (!success) throw new Error('All retries failed');
    } catch (error) {
        await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
            json: { [userId]: [] }
        });
        console.error('Error request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { sistemNue, groq };