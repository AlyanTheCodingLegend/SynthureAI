import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "./_components/ToastProvider";
import { Provider } from "react-redux"
import { store } from "./_states/store";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SynthureAI",
  description: "The only music app you'll ever need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Provider>    
      </body>
    </html>
  );
}
