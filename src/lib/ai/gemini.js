"use server"
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    GoogleSearchRetrievalTool
} = require("@google/generative-ai");


const apiKey = process.env.GEMINI_API_KEY;;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    tools: [
        {
            googleSearch: {},
        },
    ],
});

const generationConfig = {
    temperature: 0.3,
    topP: 0.5,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const chatSession = model.startChat({
    generationConfig,
    history: [
    ],
});


export async function gemini_ask(ask) {
    var response_dict = {
        data: null,
        error: null
    }

    try {
        const result = await chatSession.sendMessage(ask);

        response_dict.data = result.response.text()
    } catch (e) {
        console.log(e.message)
        response_dict.error = e.message
    }

    return response_dict
}