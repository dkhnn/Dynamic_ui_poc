import { pipeline } from '@huggingface/transformers';

let generator = null;
const MODEL_ID = 'google/functiongemma-270m-it'; // Or a compatible quantized version if available

// Simple Singleton pattern
export const loadModel = async () => {
    if (generator) return generator;

    console.log('Loading model...');
    // We use the text-generation pipeline
    // Note: transformers.js runs in the browser. It usually requires ONNX weights.
    // If 'google/functiongemma-270m-it' doesn't have ONNX weights on HF, this might fail or fallback.
    // In a real scenario, we would use 'Xenova/functiongemma-270m-it' if it exists.
    // I will try to load it. If it fails, I'll provide a fallback.

    try {
        generator = await pipeline('text-generation', 'Xenova/functiongemma-270m-it', {
             device: 'webgpu', // Try to use WebGPU if available, otherwise WASM
             // If webgpu is not supported or fails, it falls back to wasm
        });
    } catch (e) {
        console.warn("Could not load FunctionGemma 270M (Xenova version). Falling back to Qwen1.5-0.5B-Chat for demo purposes or trying google repo directly if supported.", e);
         try {
             // Fallback to a known working model for function calling if the specific one isn't converted yet
             // Qwen 0.5B is good at instruction following and small.
             generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat');
         } catch (e2) {
             console.error("Failed to load fallback model", e2);
             throw e2;
         }
    }

    console.log('Model loaded!');
    return generator;
};

// This function constructs the prompt and parses the output
export const parsePrompt = async (userPrompt) => {
    const pipe = await loadModel();

    // Tools definition for the model context
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

    // Construct the prompt based on the model's expected format.
    // Since we might be using Qwen or FunctionGemma, we try a generic function calling prompt structure
    // or the specific chat template if available.

    const messages = [
        { role: "system", content: `You are a helpful assistant. You have access to the following functions:\n${JSON.stringify(tools)}` },
        { role: "user", content: `Please call the function to satisfy this request: ${userPrompt}` }
    ];

    // transformers.js v3 apply_chat_template usage (if available) or manual construction
    // We'll stick to a manual prompt for simplicity and robustness across models if the tokenizer isn't fully loaded with template

    // For Qwen/FunctionGemma:
    // We want it to output a JSON object or a function call string.

    const prompt = `System: You are an AI assistant that helps users configure a dashboard.
You have access to the following tool:
- addWidget(type: "table" | "bar" | "pie", filter_status?: string, filter_priority?: string)

Instructions:
1. Analyze the user's request.
2. If the user wants to see tasks, decide the best widget type ("table" is default, "bar" or "pie" for charts).
3. Extract any filters (status or priority).
4. Output ONLY a valid JSON object representing the function call arguments. Do not output any other text.

Example 1:
User: "Show me a list of high priority tasks"
Output: {"type": "table", "filter_priority": "high"}

Example 2:
User: "I want a pie chart of done tasks"
Output: {"type": "pie", "filter_status": "done"}

User: "${userPrompt}"
Output:`;

    const output = await pipe(prompt, {
        max_new_tokens: 100,
        temperature: 0.1, // Low temperature for deterministic output
        return_full_text: false,
    });

    const generatedText = output[0].generated_text.trim();
    console.log("LLM Output:", generatedText);

    // Extract JSON from the output (it might wrap it in markdown code blocks)
    try {
        const jsonMatch = generatedText.match(/\{.*\}/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(generatedText);
    } catch (e) {
        console.error("Failed to parse LLM output", e);
        // Fallback for demo if LLM fails
        return { type: "table" };
    }
};
