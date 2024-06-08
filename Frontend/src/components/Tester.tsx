import React from 'react'
import { BounceLoader } from 'react-spinners';

export default function Tester(): JSX.Element {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-slate-700">
            <div className="text-center">
                <BounceLoader color="#36d7b7" />
            </div>
            <div className='mt-5 text-xl text-white'>Just a moment...</div>
        </div>
    );
}
