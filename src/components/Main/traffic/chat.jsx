"use client"
import { useState, useEffect, useRef } from 'react';
import { FaSmile, FaSearch, FaPaperclip } from 'react-icons/fa';
import { gemini_ask } from '@/app/api/ai/gemini'

const ChatBubble = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [test, settest] = useState('')
    const messagesEndRef = useRef(null);
    const [geminiMsg, setgeminiMsg] = useState('');

    const toggleChat = () => setIsOpen(!isOpen);
    const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() === '') return;

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
    async function Gemini_Output() {
        //console.log(message)
        if (message) {
            const result = await gemini_ask(message)
            setgeminiMsg(result)
            setMessage('');
        }
    }
    useEffect(() => { Gemini_Output() }, [isTyping])

    // 當有儲存AI回應時，觸發此函數(將AI回應顯示在聊天室裡)
    async function Gemini_Append() {
        if (geminiMsg) {
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
    }
    useEffect(() => { Gemini_Append() }, [geminiMsg])

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
            console.log(newMessages)
            return newMessages;
        });
    };

    // 過濾搜尋訊息結果
    function searchMsgFilter() {
        /*const res = messages.flatMap(group => group.messages.filter(m =>
            m.text.toLowerCase().includes(searchTerm.toLowerCase())))*/
        const res = messages.filter(
            msg_group => msg_group.messages[0].text.toLowerCase().includes(searchTerm.toLowerCase())
        )
        console.log(res)
        return res
    }

    // 返回訊息結果
    const filteredMessages = searchTerm
        ? searchMsgFilter()
        : messages;

    return (
        <div className="z-50 relative">
            {!isOpen ? (
                <button
                    onClick={toggleChat}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
                >
                    AI助手
                </button>
            ) : (
                <div className={`bg-gray-100 rounded-lg shadow-xl w-[90vw] sm:w-[350px] md:w-[400px] lg:w-[450px] max-w-[500px] h-[62vh] flex flex-col ${isOpen ? 'opacity-100' : 'opacity-0'} transition-all delay-200 ease-in-out duration-200`}>
                    <div className="bg-blue-500 text-white p-2 sm:p-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold text-sm sm:text-base">AI助手</h3>
                        <div>
                            <button onClick={toggleSearch} className="mr-2 p-2">
                                <FaSearch />
                            </button>
                            <button onClick={toggleChat} className="text-xl">&times;</button>
                        </div>
                    </div>
                    {isSearchOpen && (
                        <div className="p-2 border-b">
                            <input
                                type="text"
                                placeholder="搜尋訊息..."
                                /*value={searchTerm}*/
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                }}
                                className="w-full p-2 rounded border text-black"
                            />
                        </div>
                    )}
                    <div className="flex-1 p-2 sm:p-4 overflow-y-auto bg-black">
                        {filteredMessages.map((group, groupIndex) => (
                            <div key={groupIndex} className={`mb-4 ${group.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                {group.messages.map((msg, msgIndex) => (
                                    <div key={msg.id} className="mb-1">
                                        <div className={`inline-block px-2 py-1 rounded-lg ${group.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}>
                                            <p>{msg.text}</p>
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
                                        </div>
                                        {msgIndex === (group.messages.length - 1) && (
                                            <p className="text-xs mt-1 opacity-80 text-white">
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
                                    AI助手正在輸入...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSubmit} className="p-2 sm:p-4 border-t bg-white">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="輸入訊息..."
                                className="flex-grow p-2 border rounded bg-white text-black"
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ml-2"
                            >
                                發送
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBubble;