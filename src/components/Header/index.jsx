import dynamic from "next/dynamic";


const DynamicNavbar = dynamic(
    () => import('@/components/Header/navbar'),
    {
        ssr: true
    }
);

const Header = () => {
    return (
        <header className="sticky top-0 h-fit shadow border-b border-gray-200 dark:border-gray-600 z-[50]">
            <DynamicNavbar />
        </header>
    )
}

export default Header;