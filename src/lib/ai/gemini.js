import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";


const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-002",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95, 
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const chatSession = model.startChat({
    generationConfig,
    // safetySettings: Adjust safety settings
    // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
    ],
});


export async function gemini_ask(ask) {
    var response_dict = {
        data: null,
        error: null
    }

    
    try{
        const result = await chatSession.sendMessage(ask);

        response_dict.data = result.response.text()
    }catch(e){
        console.log(e.message)
        response_dict.error = e.message
    }
    
    /*

    // Llama 3.2
    const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B",
        {
            headers: {
                Authorization: "Bearer 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",
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ "inputs": ask }),
        }
    );

    const result = await response.json();

    if (result?.error) {
        response_dict.error = result.error
    }else{
        response_dict.data = result
    }
*/

    return response_dict
}