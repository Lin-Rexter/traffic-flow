'use client'
import useSWR from 'swr'
import Image from 'next/image'

const fetcher = (...args) => fetch(...args).then((res) => res.json())


// traffic
function Traffic() {
  const { data, error } = useSWR('https://api.github.com/users/facebook', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <Image
          src={data.avatar_url}
          alt={data.name}
          width={140}
          height={140}
          className="rounded-full"
        />
        <h1>{data.name}</h1>
        <p>{data.bio}</p>
      </div>
    </main>
  )
}

/*
async function getServerSideProps({context}) {
  Traffic()
}
*/


export const runtime = 'edge';
export default Traffic;

/*
export default function Home() {
    return (
        <p>Hello World!</p>
    );
}
*/