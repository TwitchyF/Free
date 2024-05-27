const { snapsave } = require("@bochilteam/scraper");
const express = require("express");
const axios = require("axios");
const tiktok = require("@tobyg74/tiktok-api-dl");
const router = express.Router();
const { youtube } = require("scrape-youtube");
const googleTTS = require("google-tts-api");
const alicia = require("./func/ai-alicia.js");
const gpt = require("./func/ai-gpt.js");
const google = require("./func/search-google.js");
const translate = require("./func/ai-translate.js");
const hari = require("./func/other-date.js");
const nueai = require("./func/other-quotes.js");
const googleImage = require("./func/search-image.js");
const ytdl = require("ytdl-core");

router.get('/play', async (req, res) => {
  const q = req.query.query;
  try {
    const response = await axios.get(`https://nue-api.vercel.app/api/yt-search?query=${q}`);
    const videos = response.data;

    const filteredVideos = videos.filter(video => video.duration < 600);
    const topVideo = filteredVideos.length > 0 ? filteredVideos[0] : null;

    const hasil = topVideo ? topVideo.link : null;

    if (hasil) {
      const result = await axios.get(`https://nue-api.vercel.app/api/ytdl?url=${hasil}`);
      res.json(result.data);
    } else {
      res.status(404).json({
        status: false,
        message: 'No videos found with a duration less than 10 minutes.'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
});
router.get('/ytdl', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ status: false, download:{}, info:{} });
  try {
    const info = await ytdl.getInfo(url);
    
    res.json({status: true, download : {audio:`https://tattered-classy-comic.glitch.me/yt-mp3?url=${url}`, video:`https://tattered-classy-comic.glitch.me/yt-mp4?url=${url}`}, info : info.videoDetails})
  } catch (error) {
    res.json({status: false, download:{}, info:{}})
  }
});

router.get('/snapsave', async (req, res) => {
  try {
    if (!req.query.url) {
      return res.status(400).json({
        status: 400,
        message: "Masukkan parameter url"
      });
    }

    const hasil = await snapsave(req.query.url);
    const response = await axios.head(hasil[0].url);
    let type = 'video';
    if (response.headers['content-type'].includes('image')) {
      type = 'image';
    } else if (response.headers['content-type'].includes('video')) {
      type = 'video';
    }
    res.status(200).json({
      status: 200,
      type, 
      result: hasil[0].url
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message
    });
  }
});


router.get('/gemini', async (req, res) => {
  try {
    if (!req.query.q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyB2tVdHido-pSjSNGrCrLeEgGGW3y28yWg', {
      contents: [{
        parts: [{
          text: req.query.q
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({status : 200, result : response.data.candidates[0].content.parts[0].text})
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
      res.status(error.response.status).json({ error: error.response.data.error.message });
    } else if (error.request) {
      console.error('No response received:', error.request);
      res.status(500).json({ error: 'No response received from the server' });
    } else {
      console.error('Error during request setup:', error.message);
      res.status(500).json({ error: 'Error during request setup' });
    }
  }
});

router.get("/date", async (req, res) => {
  res.json(await hari.get());
});
router.get("/translate", async (req, res) => {
  if (!req.query.text)
    return res
      .status(400)
      .json({ status: 400, message: "Masukkan parameter text" });
  try {
    const hasil = await translate.get(req.query.text, req.query.lang);
    res.status(200).json({ status: 200, result: hasil });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

router.get("/tts", async (req, res) => {
  try {
    const text = req.query.text;
    const lang = req.query.lang || "id";

    if (!text) {
      return res.status(400).send("Text parameter is required");
    }

    const audioDataArray = await googleTTS.getAllAudioBase64(text, {
      lang: lang,
      slow: false,
      host: "https://translate.google.com",
      timeout: 10000,
      splitPunct: ",.?",
    });

    if (!audioDataArray || audioDataArray.length === 0) {
      return res.status(500).send("Error generating audio");
    }

    // Concatenate audio data
    const concatenatedAudio = audioDataArray
      .map((audio) => audio.base64)
      .join("");

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(concatenatedAudio, "base64"));
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/yt-search", async (req, res) => {
  try {
    if (!req.query.query)
      return res
        .status(400)
        .json({ status: 400, message: "masukkan parameter query" });
    const results = await youtube.search(req.query.query);
    res.json(results.videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/acara", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const hasilAcara = await axios.get(
      `https://dayoffapi.vercel.app/api?year=${currentYear}`,
    );
    res.json(hasilAcara.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data acara." });
  }
});

router.get("/gpt", async (req, res) => {
  if (!req.query.model)
    return res.status(400).json({
      status: 400,
      message: "masukkan parameter model",
      list: `gpt-4
gpt-4-0613
gpt-4-32k
gpt-4-0314
gpt-4-32k-0314
gpt-3.5-turbo
gpt-3.5-turbo-16k
gpt-3.5-turbo-0613
gpt-3.5-turbo-16k-0613
gpt-3.5-turbo-0301
text-davinci-003
text-davinci-002
code-davinci-002
gpt-3
text-curie-001
text-babbage-001
text-ada-001
davinci
curie
babbage
ada
babbage-002
davinci-002`,
    });
  if (!req.query.prompt)
    return res
      .status(400)
      .json({ status: 400, message: "masukkan parameter prompt" });
  try {
    const hasil = await gpt.get(req.query.model, req.query.prompt);
    res.status(200).json({ status: 200, result: hasil });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "terjadi kesalahan" });
  }
});

router.get("/image", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Masukkan query" });
  try {
    const hasil = await googleImage.get(query);
    res.json(hasil);
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan" });
  }
});

router.get("/google", async (req, res) => {
  if (!req.query.query || !req.query.limit)
    return res
      .status(400)
      .json({ status: 400, message: "masukkan query dan limit" });
  try {
    const result = await google.get(req.query.query, req.query.limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/nueai", async (req, res) => {
  const { text, user } = req.query;

  try {
    const result = await nueai.get(text, user);
    res.json({ result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/alicia", async (req, res) => {
  const { text, user } = req.query;

  try {
    const result = await alicia.get(text, user);
    res.json({ model: "gpt-3", PrompterBy: "Ricky.P", result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/tt-dl", async (req, res) => {
  try {
    const tiktok_url = req.query.url;
    if (!tiktok_url)
      return res.json({ status: false, message: "masukan parameter url" });
    const result = await tiktok.TiktokDL(tiktok_url, {
      version: "v3", // version: "v1" | "v2" | "v3"
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error downloading TikTok video:", error.message);
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

module.exports = router;
