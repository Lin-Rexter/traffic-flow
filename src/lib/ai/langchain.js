'use server'
import { ChatOllama } from "@langchain/ollama";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { ChatPromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { Get_TDX_Live } from '@/lib/tdx/live_data'


// 提示
const chatPrompt = ChatPromptTemplate.fromMessages([
    ["ai", "你是一位對台灣高速公路非常了解的專家，使用繁體中文回答，會回答使用者所要查詢的路段壅塞資訊及路段名稱等資訊，也會跟使用者聊天，但不要跟使用者胡說以及提及用戶未回答的問題，並且知道以下資訊，: {traffic_info}"],
    ["human", "國道一號是哪個路段?"],
    ["system", "五堵交流道到汐止交流道"],
    ["human", "{user_input}"]
]);

/*
try {
    var llm = new HuggingFaceInference({
        model: "shenzhi-wang/Llama3-8B-Chinese-Chat-GGUF-f16",
        apiKey: "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", // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
    });
} catch (err) {
    console.log(err)
}
*/


const llm = new ChatOllama({
    model: "llama3.2:3b",
    temperature: 0,
    maxRetries: 3,
});


const chain = chatPrompt.pipe(llm);

// 暫時
export const langchain_ask = async (ask) => {
    var response_dict = {
        data: null,
        error: null
    }

    try {
        const TDX_Live_Result = await Get_TDX_Live({
            useExistToken: false
        })

        if (TDX_Live_Result.error) {
            response_dict['error'] = TDX_Live_Result.error
            return response_dict
        }

        const live_data = JSON.stringify(TDX_Live_Result.data.features)
        //console.log(live_data)

        const formattedChatPrompt = await chain.invoke({
            user_input: ask,
            traffic_info: live_data
        });

        response_dict.data = formattedChatPrompt.content

        return response_dict
    } catch (err) {
        response_dict.error = err.message
        return response_dict
    }
}


