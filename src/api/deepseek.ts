import axios from "axios";

const API_KEY = import.meta.env.VITE_DEEPSEEK_KEY;
const API_URL = "https://api.deepseek.com/v1/chat/completions";

interface AnalyzeTextParams {
  prompt: string;
  text: string;
}

export const analyzeText = async ({
  prompt,
  text,
}: AnalyzeTextParams): Promise<string> => {
  const response = await axios.post(
    API_URL,
    {
      model: "deepseek-chat",
      messages: [{ role: "user", content: `${prompt}\n\n${text}` }],
      temperature: 0.3,
    },
    {
      headers: { Authorization: `Bearer ${API_KEY}` },
    }
  );
  return response.data.choices[0].message.content as string;
};
