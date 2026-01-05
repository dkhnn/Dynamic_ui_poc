import { pipeline, env } from '@huggingface/transformers';

// Skip local checks for demo purposes if needed, but usually defaults are fine.
// env.allowLocalModels = false;
// env.useBrowserCache = false;

let generator = null;
const MODEL_ID = 'google/functiongemma-270m-it';

export const loadModel = async (accessToken) => {
    if (generator) return generator;

    if (!accessToken) {
        throw new Error("Hugging Face Access Token is required for this gated model.");
    }

    console.log(`Loading model ${MODEL_ID}...`);

    try {
        // Note: usage of 'dtype' or specific quantization might be needed depending on the converted weights availability.
        // If the official repo does not have ONNX weights, this call will fail unless a converted repo is used.
        // However, per user request, we are targeting this specific model ID.

        generator = await pipeline('text-generation', MODEL_ID, {
            device: 'webgpu', // Prefer WebGPU
            dtype: 'q4',      // 4-bit quantization is common for browser usage
            use_auth_token: accessToken,
        });
        console.log('Model loaded!');
    } catch (e) {
        console.error("Failed to load FunctionGemma 270M.", e);
        throw e;
    }

    return generator;
};

export const parsePrompt = async (userPrompt, accessToken) => {
    const pipe = await loadModel(accessToken);

    // FunctionGemma specific prompt structure would go here.
    // Based on docs, it might expect specific special tokens or a schema.
    // For this demo, we will use a generic instruction prompt but targeted at the model's capability.

    const tools = [
        {
            name: "addWidget",
            description: "Adds a widget to the dashboard. Widgets display tasks.",
            parameters: {
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        enum: ["table", "bar", "pie"],
                        description: "The type of widget to display."
                    },
                    filter_status: {
                        type: "string",
                        enum: ["todo", "in_progress", "done"],
                        description: "Filter tasks by status. Optional."
                    },
                    filter_priority: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        description: "Filter tasks by priority. Optional."
                    }
                },
                required: ["type"]
            }
        }
    ];

    const prompt = `You are a helpful assistant.
User Request: ${userPrompt}

Available Tool:
${JSON.stringify(tools[0])}

Call the function if applicable. Output JSON only.
`;

    const output = await pipe(prompt, {
        max_new_tokens: 128,
        temperature: 0.1,
        return_full_text: false,
    });

    const generatedText = output[0].generated_text.trim();
    console.log("LLM Output:", generatedText);

    try {
        const jsonMatch = generatedText.match(/\{.*\}/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(generatedText);
    } catch (e) {
        console.error("Failed to parse LLM output", e);
        // Fallback
        return { type: "table" };
    }
};
