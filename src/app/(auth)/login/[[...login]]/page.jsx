/*
import dynamic from "next/dynamic";

// 動態載入註冊介面組件
const Dynamic_Login = dynamic(
    () => import("@/components/Main/auth/login"),
    {
        ssr: true,
    }
);

export default function Page() {
    return (
        <Dynamic_Login />
    )
}
*/

import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='flex justify-center items-center font-Naikai'>
            <SignIn />
        </div>
    )
}