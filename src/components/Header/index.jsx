import dynamic from "next/dynamic";


const DynamicNavbar = dynamic(
    () => import('@/components/Header/navbar'),
    {
        ssr: true
    }
);

const Header = () => {
    return (
        <header className="sticky top-0 z-50 h-fit shadow border-b border-gray-200 dark:border-gray-600 z-[999999]">
            <DynamicNavbar />
        </header>
    )
}

export default Header;