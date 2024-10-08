"use client";
import { Button, Drawer, Carousel } from "flowbite-react";
import { useState } from "react";
import { PiTrafficSignBold } from "react-icons/pi";
import Link from 'next/link';
import { useDrawer } from "@/context";


export const Info_Component = ({ coordinate, color, describe, id, name, travel_speed, travel_time, update_interval, update_time }) => {
    const { showDrawer, setShowDrawer } = useDrawer();
    //const [isOpen, setIsOpen] = useState(showDrawer);

    const handleClose = () => {
        //setIsOpen(false)
        setShowDrawer(false)
    };

    // 轉換座標正確順序
    coordinate = coordinate.sort().reverse()

    //console.log(`https://maps.google.com/maps?ll=${coordinate.join(",")}&t=&z=20&ie=UTF8&iwloc=B&output=embed`)

    return (
        <Drawer open={showDrawer} onClose={handleClose} position="bottom" className={`fixed border-t-2 border-b-2 border-r-2 border-l-0 border-gray-600 rounded-r-xl z-[99999] top-[8vh] bottom-[7vh] md:top-[67px] md:bottom-[54px] scroll-y py-0 my-2 ${showDrawer ? "w-[90vw] md:w-[50vw] lg:w-[40vw] opacity-100" : "w-[0px] opacity-0"} transition-transform ease-in-out duration-200`}>
            <div className={`flex justify-center flex-col pt-14 ${showDrawer ? 'w-full h-full' : 'w-0 h-0'}`}>
                <div className="google-map-code flex mx-0 mb-4 justify-center h-full p-auto">
                    <iframe
                            src={`https://maps.google.com/maps?ll=${coordinate.join(",")}&t=&z=20&ie=UTF8&iwloc=B&output=embed`} // 文字查詢: q=${name}
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            aria-hidden={false}
                            tabIndex="0"
                            loading="lazy"
                            className="h-full z-[99999]"
                        />

                    {/*
                    <Carousel slide={false} indicators={false} className="h-[25vh]">
                        <iframe
                            src={`https://maps.google.com/maps?ll=${coordinate.join(",")}&t=&z=20&ie=UTF8&iwloc=B&output=embed`} // 文字查詢: q=${name}
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            aria-hidden={false}
                            tabIndex="0"
                            loading="lazy"
                            className="h-full z-[99999]"
                        />
                    </Carousel>
                    */}
                </div>
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-auto">
                    {/*
                    <Link
                        href="#"
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-md font-bold text-gray-900 hover:bg-gray-100 hover:text-cyan-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                    >
                        CCTV
                    </Link>
                    */}
                    <Link
                        href={`https://maps.google.com/maps?ll=${coordinate.join(",")}&t=&z=20&ie=UTF8&iwloc=B`}
                        target="_blank"
                        className="inline-flex justify-center items-center rounded-lg bg-cyan-700 px-4 py-2 text-center text-md font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
                    >
                        Google Map&nbsp;
                        <svg
                            className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 10"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 5h12m0 0L9 1m4 4L9 9"
                            />
                        </svg>
                    </Link>
                </div>
                <div className="flex-none mb-4">
                    <Drawer.Header className="flex justify-center items-center border-t-2 rounded rounded-md" titleIcon={() => <PiTrafficSignBold />} title={` 路段代碼: ${id}`} />
                </div>
                <div className="flex-none">
                    <Drawer.Items>
                        <p className="mb-6 text-md text-gray-500 dark:text-gray-400">
                            路段名稱: {name}
                        </p>
                        <p className="mb-6 text-md text-gray-500 dark:text-gray-400">
                            座標: {coordinate[0]}, {coordinate[1]}
                        </p>
                        <p className="mb-6 text-md text-gray-500 dark:text-gray-400">
                            壅塞程度: {describe}
                        </p>
                        <p className="mb-6 text-md text-gray-500 dark:text-gray-400">
                            平均旅行速度: {travel_speed}
                        </p>
                        <p className="mb-6 text-md text-gray-500 dark:text-gray-400">
                            平均旅行時間: {travel_time}
                        </p>
                        <p className="mb-6 text-md text-gray-500 dark:text-gray-400">
                            更新頻率: {update_interval}
                        </p>
                        <p className="mb-6 text-md text-gray-500 dark:text-gray-400">
                            更新時間: {update_time}
                        </p>
                    </Drawer.Items>
                </div>
            </div>
        </Drawer>
    );
}
