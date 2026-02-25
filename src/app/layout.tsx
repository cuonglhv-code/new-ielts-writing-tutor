import "./globals.css";

export const metadata = {
    title: "Jaxtina IELTS Writing Tutor",
    description: "AI-powered IELTS Writing practice and feedback by Jaxtina",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body style={{ fontFamily: "Inter, system-ui, sans-serif" }}>{children}</body>
        </html>
    );
}
