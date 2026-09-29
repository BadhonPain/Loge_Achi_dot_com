const OpenAI = require("openai");

const askAI = async (prompt) => {
    if (!process.env.OPENAI_API_KEY) {
        const error = new Error("Shopping assistant is not configured");
        error.code = "AI_NOT_CONFIGURED";
        throw error;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-6-luna",
        input: prompt,
        max_output_tokens: 450,
        text: { format: { type: "json_object" } }
    });

    return response.output_text;
};

module.exports = { askAI };