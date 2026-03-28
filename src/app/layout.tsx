import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
    title: "Colearn — Study Together",
    description: "Real-time collaborative study rooms",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>
                    {children}
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: "var(--bg-surface)",
                                color: "var(--text)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius)",
                                fontFamily: "var(--font-body)",
                                fontSize: "14px",
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}
