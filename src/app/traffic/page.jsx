import dynamic from "next/dynamic";

// 動態載入地圖
const Dynamic_Map = dynamic(
  () => import("@/components/Main/traffic"),
  {
    ssr: true,
  }
);

export function generateMetadata({ params, searchParams }, parent) {
  // read route params
  const id = params.id

  return {
    title: "交通流量預測",
    description: "採用TDX資料的互動式交通流量預測地圖",
  }
}

export default async function TrafficPage() {
  return (
    <Dynamic_Map />
  )
}