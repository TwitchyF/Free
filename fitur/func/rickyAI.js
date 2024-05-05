module.exports = async function rickyAI(text) {
    const googleIt = require('google-it');
    const axios = require('axios');

    const google = async (query, limit) => {
        try {
            const result = await googleIt({ query, limit });
            return result;
        } catch (error) {
            throw new Error(`Error saat melakukan pencarian Google: ${error.message}`);
        }
    }

    const gemma = async (userInput) => {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/google/gemma-1.1-7b-it",
            { inputs: userInput },
            {
                headers: {
                    Authorization: "Bearer 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",
                },
            }
        );
        return response.data[0].generated_text;
    };

    if (!text) {
        console.log('*Contoh :* .search apa itu AI\n\n`Untuk mencari informasi dari google dan menggunakan AI gemma untuk membuat teks`');
        return;
    }

    try {
        const hasilGoogle = await google(text, 20);
        const hasilGemma = await gemma(`Knowledge :${JSON.stringify(hasilGoogle)}\n----\nAI : Hallo saya Ricky AI, saya mempunyai pengetahuan realtime dan saya bisa mengakses internet, saya di buat oleh wa.me/6283894391287, Saya bukan GPT atau LLM saya adalah AI yang masih versi Uji Coba, Jadi mau tanya apa?\nuser : ${text}\nOutput:`);
        const hasilGemma1 = await gemma(hasilGemma)
        const hasilGemma2 = await gemma(hasilGemma1)
        const hasil = hasilGemma2
        return hasil.split('Output:')[1];
    } catch (error) {
        console.error(error);
        console.log('Terjadi kesalahan saat mencari informasi.');
    }
}
