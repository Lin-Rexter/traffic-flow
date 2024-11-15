'use client'
import { useState, useEffect } from 'react';
import { IoIosRefreshCircle } from "react-icons/io";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from 'next/navigation'
import { Button } from "flowbite-react";
import Link from 'next/link';
import Image from 'next/image';
//import { cookies } from 'next/headers'
import ThemeSwitch from './themes/themeswitch'
import Collection_Dropdown from './collection';
import { Toast_Component } from "@/components/utils/toast";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton, SignUp } from '@clerk/nextjs'


function IsUrl(url_name) {
    const pathname = usePathname()

    //console.log("\n當前網址/: ", pathname)

    return true ? (pathname == url_name) : false
}


var isLoading = false;

// 互動式地圖的導覽連結
const MapHeader = () => {
    const router = useRouter()

    return (
        <div className='flex cursor-pointer text-5xl m-0 p-0 text-gray-900 rounded rounded-full border border-4 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 hover:bg-gray-700'>
            <IoIosRefreshCircle title="重新整理" onClick={() => {
                isLoading = true
                router.refresh()
                setTimeout(() => {
                    isLoading = false
                }, 1000)
            } /*router.refresh() && router.push('#')*/} />
        </div>
    )
}

const Navbar_Component = () => {
    const [isOpen, setIsOpen] = useState(false);
    //const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState('');

    const toggleMenu = () => setIsOpen(!isOpen);
    /*const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
        // Cookies儲存暗黑模式狀態 (尚未完成)
        //cookies().set('IsDarkMode', isDarkMode)
    };*/

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentDateTime(now.toLocaleString('zh-TW'));
        };
        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const isDarkMode = false

    /*
        nav: ${isDarkMode ? 'bg-gray-900' : 'bg-gray-500'}`
        div:
            - ${isDarkMode ? 'text-gray-300' : 'text-white'}
            -
    */

    //const router = useRouter()

    return (
        <nav className="relative w-full bg-white dark:bg-gray-900 py-4 lg:py-0">
            <div className={`max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-2 py-1`}>
                <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Image
                        src="/traffic_congestion.png"
                        alt="Traffic Logo"
                        width={0}
                        height={0}
                        className="h-8"
                        sizes="40px"
                        style={
                            {
                                maxWidth: '100%',
                                width: 'auto',
                                height: 'auto',
                                objectFit: "contain"
                            }
                        }
                        priority
                    />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">交通流量預測</span>
                </Link>

                <Button
                    data-collapse-toggle="navbar-default"
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    aria-controls="navbar-default"
                    aria-expanded="false">
                    <span className="sr-only">{isOpen ? '關閉' : '選單'}</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </Button>

                <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-default">
                    <ul className="flex justify-center md:items-center flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        {/*
                            <li>
                                <Link href="/contact" className={`block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 hover:bg-gray-700`}>
                                    我的收藏
                                </Link>
                            </li>
                        */}
                        <li className=''>
                            <span className={`block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700${isDarkMode ? 'text-gray-300' : 'text-white'}`}>
                                {currentDateTime}
                            </span>
                        </li>
                        <li className='flex justify-end items-start content-center p-0 pl-14 m-0 w-auto h-auto'>
                            <div className={`block cursor-pointer text-2xl py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 hover:bg-gray-700`}>
                                {/*
                                    <button onClick={toggleDarkMode} className={`ml-4`}>
                                        {isDarkMode ?  '🌙' : '☀️'}
                                    </button>
                                */}
                                <ThemeSwitch />
                            </div>
                        </li>
                        <li className='flex items-center md:order-2 space-x-3 md:space-x-6 rtl:space-x-reverse'>
                            {/*
                                <Link href="/" className="">
                                    <IoIosRefreshCircle title="重新整理" />
                                </Link>
                            */}
                            {IsUrl("/traffic") && <MapHeader />}

                            {/* 登入前狀態 */}
                            <SignedOut>
                                <Link href="/login" className="text-white py-3 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    登入/註冊
                                </Link>
                            </SignedOut>

                            {/* 登入後狀態 */}
                            <SignedIn>
                                <UserButton
                                    showName={false}
                                    appearance={{
                                        elements: {
                                            rootBox: `${IsUrl("/traffic") ? "px-3" : "mr-3"}`,
                                            avatarBox: 'w-10 h-10',
                                            userButtonPopoverFooter: 'hidden invisible',
                                            userButtonPopoverCard: 'font-Naikai',
                                        },
                                    }}
                                />
                            </SignedIn>

                            <Collection_Dropdown />
                        </li>
                    </ul>
                </div>
            </div>

            {isLoading && <Toast_Component
                icon_text={"系統訊息"}
                title={"系統訊息"}
                contents={"地圖更新中..."}
                showExit={false}
            />}
        </nav>
    );
};

export default Navbar_Component;