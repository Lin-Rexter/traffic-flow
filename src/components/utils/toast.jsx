import { Button, Toast } from "flowbite-react";

export const Toast_Component = ({ icon_text, title, contents, showExit = true }) => {
    return (
        <div className="fixed top-40 right-4 z-[9999]">
            <Toast>
                <div className="flex items-center justify-center space-x-3">
                    <div className="flex flex-col justify-center item-center">
                        <div className="inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-900 dark:text-cyan-300">
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.147 15.085a7.159 7.159 0 0 1-6.189 3.307A6.713 6.713 0 0 1 3.1 15.444c-2.679-4.513.287-8.737.888-9.548A4.373 4.373 0 0 0 5 1.608c1.287.953 6.445 3.218 5.537 10.5 1.5-1.122 2.706-3.01 2.853-6.14 1.433 1.049 3.993 5.395 1.757 9.117Z" />
                            </svg>
                            <span className="sr-only">{icon_text}</span>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center item-center text-sm font-normal">
                        <div className="mb-1 text-lg font-semibold">
                            <p>{title}</p>
                        </div>
                        <div className="mb-1 text-base font-normal whitespace-pre-wrap">
                            <p>{contents}</p>
                        </div>
                    </div>
                    {showExit &&
                        (
                            <div className='flex justify-center item-center'>
                                <Toast.Toggle />
                            </div>
                        )
                    }
                </div>
            </Toast>
        </div>
    )
}