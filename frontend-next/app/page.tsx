"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BounceLoader } from 'react-spinners';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-slate-700">
        <div className="text-center">
            <BounceLoader color="#36d7b7" />
        </div>
        <div className='mt-5 text-xl text-white'>Just a moment...</div>
    </div>
  )
}
