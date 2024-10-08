'use server'
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { Get_TDX_Live } from '@/lib/tdx/live_data'



const chatPrompt = ChatPromptTemplate.fromMessages([
    ("system", "你是一位對台灣高速公路非常了解的專家，會回答使用者所要查詢的路段壅塞資訊及路段名稱等資訊，並且知道以下資訊，以繁體中文回答: {traffic_info}"),
    ("human", "國道一號是哪個路段?"),
    ("ai", "五堵交流道到汐止交流道"),
    ("human", "{user_input}")
]);

const llm = new ChatOllama({
    model: "llama3.2:3b",
    temperature: 5,
    maxRetries: 2,
    // other params...
});

const chain = chatPrompt.pipe(llm);

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

        const live_data = TDX_Live_Result.data

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


