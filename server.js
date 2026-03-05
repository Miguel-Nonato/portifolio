import "dotenv/config";
import express from "express";
import { Groq } from "groq-sdk";

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.GROQ_API_KEY) {
  console.warn("GROQ_API_KEY nao definida. Configure no arquivo .env.");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static("."));

app.post("/api/ia", async (req, res) => {
  try {
    const pergunta = (req.body?.pergunta || "").trim();
    if (!pergunta) {
      return res.status(400).json({ error: "Pergunta vazia." });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Voce e o assistente do portfolio de Miguel Nonato. Responda em portugues, de forma curta e clara, apenas sobre o Miguel. Dados: nome Miguel Nonato; desenvolvedor front-end em evolucao; sabe HTML, CSS, JavaScript basico e integracao com IA; esta aprendendo PHP e ingles; GitHub: https://github.com/Miguel-Nonato; LinkedIn: https://www.linkedin.com/in/miguel-nonato-9880223a4; contato: mrnonato2014@gmail.com e (18) 99818-0026."
        },
        {
          role: "user",
          content: pergunta
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null
    });

    let answer = "";
    for await (const chunk of chatCompletion) {
      answer += chunk.choices?.[0]?.delta?.content || "";
    }

    return res.json({ answer: answer || "Nao consegui responder agora." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno ao consultar a IA." });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
