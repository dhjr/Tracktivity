import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Tractivity",
  description: "Track your activity with style",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <main className="pt-24">{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
