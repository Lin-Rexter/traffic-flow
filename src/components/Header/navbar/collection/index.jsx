'use client'
import dynamic from "next/dynamic";
import Link from 'next/link';
import { Button, Checkbox, Label, Modal, TextInput, Dropdown } from "flowbite-react";
import { useRef, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";


// 動態載入時間軸
const DynamicModal = dynamic(
    () => import("./add"),
    {
        ssr: true,
    }
);


export default function Collection_Dropdown({ location, date }) {
    const [openModal, setOpenModal] = useState(false);
    const emailInputRef = useRef(null)

    return (
        <div className="py-3">
            <Dropdown label="收藏">
                <Dropdown.Header>
                    <span className="block text-center truncate text-base font-bold">收藏之路段</span>
                </Dropdown.Header>

                <div className='grid grid-flow-row justify-center items-center space-y-1 p-2'>
                    <Dropdown.Item icon={FaMapMarkerAlt} className="z-20 w-full max-w-sm bg-white rounded-lg border-[3px] border-slate-300 border-dashed shadow dark:bg-gray-800">
                        <Link href="#" className="flex flex-col flex-nowrap justify-center content-center self-center border-[3px] border-green-300 shadow rounded-lg space-y-2 px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-700">
                            <div className="w-full flex justify-self-center content-center font-bold text-[16px] text-md text-left border-b-[3px] border-gray-300 dark:border-gray-400">
                                {/*<Image className="rounded-full w-11 h-11" src="" alt="Jese image" />*/}
                                快速公路88號(竹田交流道到新竹交流道)
                            </div>
                            <div className="w-full flex justify-self-center content-center text-left font-bold text-gray-600 text-base dark:text-gray-300">
                                壅塞程度:<span className="ml-1">順暢🟢</span>
                            </div>
                            <div className="w-full flex justify-end self-center items-center content-center font-bold text-right text-sm text-blue-600 dark:text-blue-500">
                                時間:<span className="ml-1 p-0">2024/08/01</span>
                            </div>
                        </Link>
                    </Dropdown.Item>
                </div>

                <Dropdown.Divider />

                <Dropdown.Item icon={IoIosAddCircle} className='flex justify-center text-base font-bold' onClick={() => setOpenModal(true)}>
                    新增收藏
                    {/*openModal && <DynamicModal hook={[openModal, setOpenModal]} />*/}
                </Dropdown.Item>
            </Dropdown>
            <div>
                {openModal && <DynamicModal hook={[openModal, setOpenModal]} emailRef={emailInputRef} />}
            </div>
        </div>
    )
}