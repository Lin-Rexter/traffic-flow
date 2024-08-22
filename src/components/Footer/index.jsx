import Link from 'next/link';


const Footer = () => {
    return (
        <footer className="sticky bottom-0 z-50 h-fit shadow-[0_-1px_3px_0_rgba(0,0,0,0.1),0_-1px_2px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 dark:border-gray-600">
            <div className='relative w-full bg-white dark:bg-gray-900'>
                <div className='max-w-screen-2xl flex flex-wrap items-center justify-between space-y-1 md:space-y-0 mx-auto px-2 py-5'>
                    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
                        © 2024
                        <Link href="#" className="ml-1 hover:underline">
                            第九組
                        </Link>
                        . All Rights Reserved.
                    </span>
                    <ul className="flex flex-wrap items-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
                        <li>
                            <Link href="#" className="hover:underline me-4 md:me-6">關於我們</Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:underline">聯絡</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}

export default Footer;