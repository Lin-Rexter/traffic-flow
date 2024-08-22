import Image from "next/image";
import Link from 'next/link';


export default function Home() {
    return (
        <article className="grid grid-flow-row-dense grid-rows-auto auto-rows-min gap-y-8 h-full items-center justify-center m-auto py-3 px-2">
            <div className="flex flex-wrap z-10 w-full max-w-5xl justify-end md:flex-nowrap md:justify-between items-center font-mono text-sm">
                <p className="flex md:basis-1/2 w-full justify-center items-center py-6 font-bold text-base border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit md:w-auto md:rounded-xl md:border md:bg-gray-200 md:p-4 md:dark:bg-zinc-700/30">
                    點擊下方的交通壅塞預測，與AI互動並探索未來的壅塞狀況吧!!&nbsp;
                </p>
                <div className="flex md:basis-1/2 h-auto justify-end bg-gradient-to-t from-white via-white dark:from-black dark:via-black bg-none">
                    <Link
                        className="flex w-auto h-full justify-end pointer-events-none size-px place-items-center"
                        href=""
                        target="_Self"
                        rel="noopener noreferrer"
                    >
                        By{" "}
                        <Image
                            src="/Logo.svg"
                            alt="第九組 Logo"
                            className="object-cover rounded-2xl dark:text-sky-500"
                            width={0}
                            height={0}
                            style={
                                {
                                    width: 'auto',
                                    height: '7rem',
                                    objectFit: "contain",
                                }
                            }
                            priority
                        />
                    </Link>
                </div>
            </div>

            <div className="flex w-full max-w-5xl place-items-center justify-center items-center z-[-1]">
                <Image
                    className="flex border-[3.5px] border-slate-800 dark:border-emerald-200 rounded-2xl drop-shadow-lg dark:drop-shadow-[1__1.3rem_#ffffff70]"
                    src="/welcome_bg.png"
                    alt="交通壅塞預測 Logo"
                    width={0}
                    height={0}
                    sizes="52rem" //1920px
                    style={
                        {
                            width: 'auto',
                            height: '100%',
                            objectFit: "cover"
                        }
                    }
                    priority
                />
            </div>

            {/* lg:grid-cols-1 */}
            <div className="flex justify-center items-center text-center lg:max-w-5xl lg:w-full lg:text-left">
                <Link
                    href="/traffic"
                    className="group rounded-lg px-5 py-4 transition-colors shadow-lg bg-gray-100 dark:bg-gray-800 border-[3px] border border-sky-300 hover:border-teal-300/80 hover:bg-gray-100 hover:shadow hover:shadow-cyan-200 hover:dark:border-teal-500 hover:dark:bg-neutral-800/30"
                    target="_self"
                    rel="noopener noreferrer"
                    scroll={false}
                >
                    <h2 className={`mb-3 text-2xl font-semibold`}>
                        交通壅塞預測{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className={`m-0 max-w-[30ch] text-sm opacity-60`}>
                        查看各地點未來壅塞狀況
                    </p>
                </Link>
            </div>
        </article>
    );
}
