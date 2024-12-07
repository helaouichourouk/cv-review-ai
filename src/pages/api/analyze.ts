import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { fileContent } = req.body;

    if (!fileContent) {
        return res.status(400).json({ error: "Le contenu du fichier est requis." });
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Tu es un expert en analyse de CV." },
                    { role: "user", content: `Analyse ce CV : ${fileContent}` },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                timeout: 10000, // 10 seconds timeout
            }
        );

        res.status(200).json({ results: response.data });
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API OpenAI:", {
            message: (error as any)?.message,
            response: (error as any)?.response?.data,
        });

        const status = (error as any)?.response?.status || 500;
        res.status(status).json({
            error: "Erreur lors de l'analyse.",
            details: (error as any)?.response?.data || null,
        });
    }
};

export default handler;
