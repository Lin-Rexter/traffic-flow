"use client";
import { Button, Drawer } from "flowbite-react";
import { useState } from "react";
import { PiTrafficSignBold } from "react-icons/pi";
import Link from 'next/link';
import { useDrawer } from "@/context";


export const Info_Component = ({ coordinate, color, describe, id, name, travel_speed, travel_time, update_interval, update_time }) => {
    const { showDrawer, setShowDrawer } = useDrawer();
    const [isOpen, setIsOpen] = useState(true);

    const handleClose = () => {
        setIsOpen(false)
        setShowDrawer(false)
    };

    // 轉換座標正確順序
    coordinate = coordinate.sort().reverse()

    //console.log(`https://maps.google.com/maps?ll=${coordinate.join(",")}&t=&z=20&ie=UTF8&iwloc=B&output=embed`)

    return (
        <div>
            <Drawer open={isOpen} onClose={handleClose} position="left" className="w-auto overflow-y-scroll">
                <div className="flex h-full w-auto justify-center flex-col">
                    <div className="flex-none google-map-code h-auto mb-4">
                        <iframe
                            src={`https://maps.google.com/maps?q=${name}&ll=${coordinate.join(",")}&t=&z=20&ie=UTF8&iwloc=B&output=embed`}
                            width="600"
                            height="300"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            aria-hidden="false"
                            tabIndex="0"
                            loading="lazy"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                        <Link
                            href="#"
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-cyan-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                        >
                            Learn more
                        </Link>
                        <Link
                            href="#"
                            className="inline-flex justify-center items-center rounded-lg bg-cyan-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
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
        </div>
    );
}
