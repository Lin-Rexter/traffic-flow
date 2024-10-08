/*
import dynamic from "next/dynamic";

// 動態載入註冊介面組件
const Dynamic_SignUp = dynamic(
    () => import("@/components/Main/auth/signup"),
    {
        ssr: true,
    }
);

export default function Page() {
    return (
        <Dynamic_SignUp />
    )
}
*/

import { SignUp } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='flex justify-center items-center font-Naikai'>
            <SignUp
                appearance={{
                    elements: {},
                }} />
        </div>
    )
}
