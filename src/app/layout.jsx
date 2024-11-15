import { Suspense } from "react";
import dynamic from "next/dynamic";
import Script from 'next/script'
import Link from 'next/link'
import { Inter } from "next/font/google";
import localFont from 'next/font/local'
import "@/styles/globals.css";
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader';
import { Providers } from './providers'
import Loading from "./loading";
import { ClerkProvider } from '@clerk/nextjs'
import { zhTW } from '@clerk/localizations'
import 'react-loading-skeleton/dist/skeleton.css'

const DynamicHeader = dynamic(
    () => import('@/components/Header'),
    {
        ssr: true
    }
);

const DynamicMain = dynamic(
    () => import('@/components/Main'),
    {
        ssr: true
    }
);

const DynamicFooter = dynamic(
    () => import('@/components/Footer'),
    {
        ssr: true
    }
);

const myFont = localFont({
    src: '../../public/fonts/NaikaiFont-Regular-Lite.ttf',
    display: 'swap',
    preload: true
})

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "智慧智慧公路壅塞預測",
    description: "利用時序模型預測全台高速公路交通壅塞狀況，並呈現於互動式地圖上，再結合LLM幫助使用者輕鬆快速查詢所需地點的未來壅塞數據與視覺化預測結果呈現。",
};


export default function RootLayout({ children }) {
    return (
        <ClerkProvider dynamic localization={zhTW}>
            <html lang="zh-Hant-TW" className={myFont.className} suppressHydrationWarning>
                <head>
                    <link href="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.css" rel="stylesheet" />
                </head>
                <body className="h-screen">
                    <Suspense fallback={<Loading />} className={inter.className}>
                        <Providers>
                            {/* 載入進度條 */}
                            <NextTopLoader
                                color="#2299DD"
                                initialPosition={0.08}
                                crawlSpeed={200}
                                height={7}
                                crawl={true}
                                showSpinner={true}
                                easing="ease"
                                speed={200}
                                shadow="0 0 10px #2299DD,0 0 5px #2299DD"
                                template='
                                    <div class="bar" role="bar">
                                        <div class="peg">
                                    </div>
                                    </div> 
                                        <div class="spinner" role="spinner">
                                        <div class="spinner-icon"></div>
                                    </div>'
                                zIndex={1600}
                                showAtBottom={false}
                            />

                            <div className="h-full grid grid-flow-row-dense grid-rows-auto grid-cols-auto">
                                <DynamicHeader />

                                <div className="grid grid-flow-row-dense grid-rows-1 h-full">
                                    <DynamicMain children={children} />

                                    <DynamicFooter />
                                </div>
                            </div>
                        </Providers>
                    </Suspense>
                    <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.js" crossOrigin="anonymous"></script>
                </body>
            </html>
        </ClerkProvider>
    );
}

export const runtime = 'nodejs' // 'nodejs' (default) | 'edge'
