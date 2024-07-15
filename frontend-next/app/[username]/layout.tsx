"use client"

import { usePathname } from "next/navigation";
import Player from "../_components/Player";
import Sidebar from "../_components/Sidebar";

type LayoutProps = {
    children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname();
    const paths = pathname.split("/"); 

    if (paths.length===2 || (paths.length===3 && paths[2] !== "aigen")) {
        return (
            <div className="flex h-screen overflow-none">
                <Sidebar/>
                {children}
                <Player/>
            </div> 
        );
    }    
    
    return (
        <>
            {children}
        </>
    )
}
