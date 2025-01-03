"use client"
import { useState, useEffect, useRef } from 'react';
import { FaSmile, FaSearch, FaPaperclip } from 'react-icons/fa';
import { Button, Popover } from "flowbite-react";
import { IoMdClose } from "react-icons/io";
import { MdKeyboardVoice } from "react-icons/md";
//import { gemini_ask } from '@/lib/ai/gemini'
import { langchain_ask } from '@/lib/ai/langchain';
import { Effect } from 'deck.gl';
import { marked } from 'marked';



const ChatBubble = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    //const [test, setTest] = useState('')
    const messagesEndRef = useRef(null);
    const [geminiMsg, setGeminiMsg] = useState('');

    // 語音設置
    const [recognition_T, setRecognition] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const language = 'zh-TW';

    const toggleChat = () => setIsOpen(!isOpen);
    const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);


    // 語音處理 - 錄音開始
    const startRecording = () => {
        // 停止錄音 (初始化)
        if (isActive) {
            stopRecording();
            return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        //recognition.lang = language;

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
        }

        recognition.onspeechend = () => {
            return null;
        };

        recognition.start();
        setRecognition(recognition)
        setIsActive(true)
    }

    // 語音處理 - 錄音結束
    const stopRecording = () => {
        recognition_T.stop();
        setRecognition(recognition_T)
        setIsActive(false);
    };

    const handleSubmit = (e) => {
        // 停止錄音 (初始化)
        if (isActive) {
            stopRecording();
        }

        e.preventDefault();
        if ((message.trim() === '') || isTyping) return;

        // 使用者訊息包裝
        const newMessage = {
            id: Date.now(),
            text: message,
            time: new Date(),
            sender: 'user',
        };
        addMessageToGroup(newMessage);

        setIsTyping(true);
    };

    // 當顯示打字中時，觸發此函數(取得AI回應)
    useEffect(() => {
        if (isTyping) {
            const Gemini_Output = async () => {
                if (message) {
                    //let result = await gemini_ask(message)
                    let result = await langchain_ask(message)

                    setMessage('');

                    if (result?.error) {
                        result.data = result?.error || '[系統錯誤] 次數過於頻繁，請稍後再次與AI互動!'
                        setGeminiMsg(result.data)
                    } else {
                        setGeminiMsg(result.data) //[0].generated_text
                    }
                }
            }

            Gemini_Output()
        }
    }, [isTyping, message])

    // 當有儲存AI回應時，觸發此函數(將AI回應顯示在聊天室裡)
    useEffect(() => {
        if (geminiMsg) {
            const Gemini_Append = async () => {
                // 顯示正在輸入中...
                setTimeout(() => {
                    // AI訊息包裝
                    const botReply = {
                        id: Date.now(),
                        text: geminiMsg, //`您好，我收到了您的訊息："${}"`, // 這裡放AI訊息回應函式
                        time: new Date(),
                        sender: 'bot',
                        reactions: []
                    };
                    addMessageToGroup(botReply);

                    // 關閉顯示正在輸入中...
                    setIsTyping(false);
                }, 100);
            }

            Gemini_Append()

            setGeminiMsg("")
        }
    }, [geminiMsg])

    // 訊息包裝
    const addMessageToGroup = (newMessage) => {
        setMessages(prevMessages => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage &&
                lastMessage.sender === newMessage.sender &&
                (newMessage.time - lastMessage.time) / 1000 < 60) {
                // Add to existing group
                return [...prevMessages.slice(0, -1),
                { ...lastMessage, messages: [...lastMessage.messages, newMessage] }
                ];
            } else {
                // Create new group
                return [...prevMessages, { messages: [newMessage], sender: newMessage.sender }];
            }
        });
    };

    // 添加表情Reaction
    /*
    const addReaction = (groupIndex, messageId, reaction) => {
        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const group = newMessages[groupIndex];
            const messageIndex = group.messages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
                const message = group.messages[messageIndex];
                const newReactions = message.reactions.includes(reaction)
                    ? message.reactions.filter(r => r !== reaction)
                    : [...message.reactions, reaction];
                group.messages[messageIndex] = { ...message, reactions: newReactions };
            }
            return newMessages;
        });
    };
    */

    // 過濾搜尋訊息結果
    function searchMsgFilter() {
        /*const res = messages.flatMap(group => group.messages.filter(m =>
            m.text.toLowerCase().includes(searchTerm.toLowerCase())))*/
        const res = messages.filter(
            msg_group => msg_group.messages[0].text.toLowerCase().includes(searchTerm.toLowerCase())
        )
        return res
    }

    // 返回訊息結果
    const filteredMessages = searchTerm
        ? searchMsgFilter()
        : messages;



    return (
        <div className="z-[99999] relative">
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="text-stone-100 transition-all transform-gpu ease-in-out duration-300 active:duration-200 bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-110 active:scale-75 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-bold py-2 px-4 rounded-full shadow-lg select-none"
                >
                    AI助手
                </button>
            )}
            {isOpen &&
                (<div className='z-[99998] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full backdrop-blur-sm bg-white/5'></div>)
            }
            <div className={`z-[99999] fixed flex flex-col rounded-lg py-6 w-[90vw] sm:w-3/4 lg:w-2/4 max-w-[600px] mt-[2vh] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isOpen ? 'opacity-100 h-[80vh] visible' : 'opacity-0 h-[0vh] invisible'} transition-all ease-in-out duration-300`}>
                <div className="bg-teal-500 h-fit text-white p-2 sm:p-4 rounded-t-lg flex justify-between items-center">
                    <p className="font-bold text-sm sm:text-lg flex justify-center items-center">AI助手</p>
                    <div className='flex justify-center items-center'>
                        <button onClick={toggleSearch} className="mr-2 p-1 rounded-md hover:bg-blue-600">
                            <FaSearch className="h-4 w-4" />
                        </button>
                        <button onClick={toggleChat} className="rounded-md hover:bg-red-400">
                            <IoMdClose className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className={`p-2 border-b bg-teal-300 ${isSearchOpen ? "h-fit opacity-100 visible top-5 mt-0" : "h-0 opacity-0 invisible mt-[-20]"} transition-all ease-in-out duration-100`}>
                    <input
                        type="text"
                        placeholder="搜尋訊息..."
                        /*value={searchTerm}*/
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                        }}
                        className="w-full p-2 rounded border text-black font-bold"
                    />
                </div>

                <div className="flex-1 p-1 sm:p-2 h-full bg-slate-200 dark:bg-neutral-800 transition-all ease-in-out duration-200 overflow-y-auto">
                    <div className='border-4 border-slate-200 dark:border-neutral-800 bg-slate-200 dark:bg-neutral-800 shadow-[inset_0_0_6px_1px_rgba(100,100,100,0.8)] rounded-xl w-full h-full p-4 m-0 overflow-y-auto'>
                        {filteredMessages.map((group, groupIndex) => (
                            <div key={groupIndex} className={`mb-4 ${group.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                {group.messages.map((msg, msgIndex) => (
                                    <div key={msg.id} className="mb-1 font-Naikai text-base">
                                        <div className={`inline-block px-2 py-1 rounded-lg ${group.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}>
                                            <div className='max-w-sm flex flex-wrap flex-auto text-ellipsis overflow-hidden' dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}></div>
                                            {/*
                                                <div className="text-right">
                                                    {group.sender === 'bot' && (
                                                        <div className="inline-flex mt-2 space-x-2 bg-orange-100 rounded-lg px-2 py-0.5">
                                                            {['👍', '❤️', '👎'].map(reaction => (
                                                                <button
                                                                    key={reaction}
                                                                    onClick={() => addReaction(groupIndex, msg.id, reaction)}
                                                                    className={`text-xs bg-orange-400 p-1 rounded-full hover:opacity-100 ${msg.reactions && msg.reactions.includes(reaction) ? 'opacity-100' : 'opacity-50'}`}
                                                                >
                                                                    {reaction}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            */}
                                        </div>
                                        {msgIndex === (group.messages.length - 1) && (
                                            <p className="text-sm mt-1 opacity-80">
                                                {new Date(msg.time).toLocaleTimeString()}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="text-left mb-4">
                                <div className="inline-block p-2 rounded-lg bg-gray-300 text-black">
                                    AI助手正在思考中...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-b-lg p-2 sm:p-4 h-fit bg-gray-100">
                    <div className="flex flex-wrap space-y-2 md:space-y-0 justify-end md:justify-center items-center h-fit">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="輸入訊息..."
                            className="flex-grow p-2 text-base border rounded bg-white text-black font-Naikai w-full md:w-auto caret-blue-500"
                        />
                        <button
                            onMouseDown={startRecording}
                            className={`
                                rounded-full flex items-center ml-2 border border-transparent
                                text-center text-sm transition-all  hover:bg-blue-200
                                ${isActive ? 'text-white bg-red-500' : 'text-zinc-400 bg-zinc-900'} 
                            `}
                            type="button"
                            data-tooltip-target="tooltip-animation"
                        >
                            <MdKeyboardVoice className="h-10 w-10" />
                        </button>
                        <div id="tooltip-animation" role="tooltip" className={`absolute z-10 invisible inline-block px-3 py-2 text-md font-bold ${isActive ? 'text-red-400' : 'text-white'} transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700`}>
                            {isActive ? '結束語音辨識' : '開始語音輸入'}
                            <div className="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ml-2"
                        >
                            發送
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatBubble;