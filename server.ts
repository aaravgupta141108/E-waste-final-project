import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini API proxy route
app.post('/api/compliance-insight', async (req, res) => {
  try {
    const {
      compositeScore,
      scoreRatingLabel,
      flaggedCount,
      totalDevices,
      avgStateAttainment,
      highRiskStates,
      surplusStates,
      wipeSuccessPct
    } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        text: null,
        message: 'No GEMINI_API_KEY configured on server. Falling back to local regulatory engine.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the lead Central Pollution Control Board (CPCB) Regulatory AI Auditor under the E-Waste (Management) Rules 2022.
Analyze the following live platform compliance telemetry:
- Composite Regional Audit Risk Score: ${compositeScore || 92}/100 (${scoreRatingLabel || 'Operational'})
- Open Quarantined / Flagged Units: ${flaggedCount || 0} out of ${totalDevices || 0} total registered devices
- Average State EPR Quota Attainment: ${avgStateAttainment || 88}%
- High-Risk Lagging States (<85% attainment): ${highRiskStates || 'None'}
- Surplus Performing States (>=95% attainment): ${surplusStates || 'None'}
- NIST SP 800-88 Data Scrub Integrity: ${wipeSuccessPct || 99.8}%

Provide a concise, 3-paragraph executive regulatory assessment explaining:
1. The primary causes driving the current regional risk score.
2. An analysis of the gap between surplus hubs and lagging states with informal leakage risk.
3. 2-3 specific, actionable CPCB regulatory steps the auditor should execute immediately.
Keep the tone authoritative, government-grade, and statutory.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    return res.json({ text: response.text || '' });
  } catch (error: any) {
    console.warn('Server Gemini generation error:', error?.message);
    return res.status(200).json({
      text: null,
      error: error?.message || 'Error executing Gemini analysis'
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
