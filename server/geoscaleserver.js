require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { Ollama } = require('ollama');

// ── Config ───────────────────────────────────────────────
const RF_API_KEY   = process.env.RF_API_KEY;
const PORT         = 3000;
const OLLAMA_MODEL = 'llama3.2';
const ollama       = new Ollama({ host: 'http://127.0.0.1:11434' });

// Validate required env vars on startup
if (!process.env.RF_API_KEY) {
    console.error('ERROR: RF_API_KEY is not set in your .env file');
    process.exit(1);
}

// Map detection types to Roboflow model IDs
const MODEL_MAP = {
    building: 'geoscope-v2/1',
    hvac: 'hvac-detection-ujree/1'
};
const DEFAULT_MODEL = MODEL_MAP.building;

const BASE_DIR     = __dirname;
const CAPTURES_DIR = path.join(BASE_DIR, 'captures');

(async () => {
    try {
        await fs.mkdir(CAPTURES_DIR, { recursive: true });
    } catch (err) {
        console.error('Failed to create captures directory:', err);
    }
})();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Health check ─────────────────────────────────────────
app.get('/ping', (req, res) => {
    res.json({ ok: true });
});

// ── SAVE IMAGE ───────────────────────────────────────────
app.post('/save', async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'No image provided' });
    }

    try {
        const base64Data = image.split(',')[1] || image;
        const buffer = Buffer.from(base64Data, 'base64');

        const timestamp = Date.now();
        const filename = `map_${timestamp}.jpg`;
        const filepath = path.join(CAPTURES_DIR, filename);

        await fs.writeFile(filepath, buffer);
        console.log(`[SAVE] ${filename}`);

        res.json({ saved: `captures/${filename}` });
    } catch (err) {
        console.error('Error saving image:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── DETECT (uses type to select model) ───────────────────
app.post('/detect', async (req, res) => {
    const { path: relPath, type } = req.body;
    let modelId = DEFAULT_MODEL;

    if (type && MODEL_MAP[type]) {
        modelId = MODEL_MAP[type];
    }

    console.log(`[DETECT] Received type: ${type || 'none'}, using model: ${modelId}`);

    if (!relPath) {
        return res.status(400).json({ error: 'No path provided' });
    }

    const filepath = path.join(BASE_DIR, relPath);

    try {
        await fs.access(filepath);
        console.log(`[DETECT] Sending ${filepath} using model ${modelId}`);

        const imageBuffer = await fs.readFile(filepath);
        const base64Image = imageBuffer.toString('base64');

        const response = await axios({
            method: 'POST',
            url: `https://serverless.roboflow.com/${modelId}`,
            params: { api_key: RF_API_KEY },
            data: base64Image,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 60000
        });

        const result = response.data;
        console.log('[RF STATUS]', response.status);
        console.log('[RF RAW]', JSON.stringify(result).slice(0, 300));

        res.json({
            predictions: result.predictions || [],
            image_width: result.image?.width,
            image_height: result.image?.height,
        });
    } catch (err) {
        console.error('Error in /detect:', err);
        if (err.response) {
            return res.status(500).json({
                error: `Roboflow error ${err.response.status}`,
                details: err.response.data
            });
        }
        res.status(500).json({ error: err.message });
    }
});

// ── KELLY CHAT (Ollama) ──────────────────────────────────
app.post('/chat', async (req, res) => {
    const { message, context } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'No message provided' });
    }

    const systemPrompt = `You are Kelly, a helpful assistant for the GeoScope map viewer.
Current map context:
- Center: lat ${context.lat}, lon ${context.lon}
- Zoom: ${context.zoom}
- Last detection: ${context.detectionType} (${context.detectionCount} objects, avg confidence ${context.avgConfidence}%)
- Model used: ${context.modelId}

You can help the user navigate to cities, explain the map, and give details about detections. 
If the user asks to go to a city or location, respond with a special command: "NAVIGATE:city_name".
If the user asks about detection counts, you can answer based on the context.
Keep responses concise and friendly.`;

    try {
        const response = await ollama.chat({
            model: OLLAMA_MODEL,
            options: { temperature: 0.7, num_predict: 300 },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ]
        });

        const reply = response.message.content;
        res.json({ reply });
    } catch (err) {
        console.error('Ollama error:', err);
        res.status(500).json({ error: 'AI service unavailable. Is Ollama running? Try: ollama serve' });
    }
});

// ── STATIC FILES ─────────────────────────────────────────
app.use('/captures', express.static(CAPTURES_DIR));

// ✅ FIXED PATHS (IMPORTANT)
app.use(express.static(path.join(BASE_DIR, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(BASE_DIR, '../public/index.html'));
});

// ── RUN ──────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Using Ollama model: ${OLLAMA_MODEL}`);
    console.log(`Make sure Ollama is running: ollama serve`);
});