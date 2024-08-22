import Image from 'next/image';


export default function Loading() {
    return (
        <div className="relative flex h-screen justify-center items-center">
            <Image
                src="/deno_loading.gif"
                alt="載入中"
                className="flex h-full justify-center items-center rounded-2xl drop-shadow-lg dark:drop-shadow-[1__1.3rem_#ffffff70]"
                width={0}
                height={0}
                style={
                    {
                        width: 'auto',
                        height: '50%',
                        objectFit: "contain",
                    }
                }
                unoptimized
            />
        </div>
    )
} // good night 🆗