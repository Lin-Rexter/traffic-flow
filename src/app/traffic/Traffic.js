'use client';
import useSWR from 'swr';
import Image from 'next/image';
import { fetcher } from './page';
// traffic
export function Traffic() {
  const { data, error } = useSWR('https://api.github.com/users/facebook', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <Image
          src={data.avatar_url}
          alt={data.name}
          width={140}
          height={140}
          className="rounded-full" />
        <h1>{data.name}</h1>
        <p>{data.bio}</p>
      </div>
    </main>
  );
}
