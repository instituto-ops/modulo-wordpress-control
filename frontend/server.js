const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); // Lê o seu .env da pasta raiz
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = 3001; // Servidor backend do Gemini vai rodar na 3001

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configuração do Multer para receber a imagem em memória (Screenshot)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Instância do SDK atualizado do Gemini 2.x
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const VISION_MODEL = 'gemini-2.5-flash';

app.post('/api/chat', upload.single('screenshot'), async (req, res) => {
    try {
        const { message, htmlContext } = req.body;
        
        let contents = [];
        let promptText = `
Você é Jules, o Assistente de Engenharia Headless (AntiGravity CMS).
Sua função é auxiliar o Dr. Victor Lawrence a criar e otimizar páginas no WordPress usando o 'Método Abidos' (Foco profundo em E-A-T, Cópias orientadas à Dor/Solução, Velocidade e Alta Conversão para Psicoterapia e TEA em Adultos).

O usuário enviou a seguinte mensagem/pedido:
"${message}"

Aqui está o código HTML atual da página que ele está editando (retorne apenas as alterações no HTML ou CSS necessárias se ele pedir, ou responda às dúvidas com foco em marketing local/SEO):
\`\`\`html
${htmlContext ? htmlContext.substring(0, 15000) : "Nenhum código atual fornecido."}
\`\`\`
`;

        // Se uma screenshot foi enviada (botão 'Ver Erro Visual')
        if (req.file) {
             const base64Image = req.file.buffer.toString('base64');
             const mimeType = req.file.mimetype;
             
             promptText += `\n[ATENÇÃO: O usuário anexou uma captura de tela da página. Analise a imagem para entender problemas de formatação, layout quebrado ou UX ruim no mobile. Dê instruções de CSS ou HTML para corrigir o erro que você está vendo.]`;
             
             contents.push({
                 role: 'user',
                 parts: [
                     { text: promptText },
                     { inlineData: { data: base64Image, mimeType: mimeType } }
                 ]
             });
        } else {
             contents.push({
                 role: 'user',
                 parts: [{ text: promptText }]
             });
        }

        const response = await ai.models.generateContent({
             model: VISION_MODEL,
             contents: contents,
             config: {
                 temperature: 0.3,
                 maxOutputTokens: 2500,
             }
        });

        res.json({ reply: response.text });

    } catch (error) {
        console.error("Erro no servidor IA:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`🧠 NeuroEngine AI Chatbot rodando na porta ${port}`);
});
