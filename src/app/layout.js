import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import config from "@/lib/config";
import theme from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: `${config.brandName} — Shop Everything`,
  description: `${config.brandName} — ${config.tagline}`,
};

const themeVars = `
  --bg: ${theme.bg};
  --bg-card: ${theme.bgCard};
  --bg-muted: ${theme.bgMuted};
  --bg-input: ${theme.bgInput};
  --text-primary: ${theme.textPrimary};
  --text-muted: ${theme.textMuted};
  --text-placeholder: ${theme.textPlaceholder};
  --text-light: ${theme.textLight};
  --accent: ${theme.accent};
  --accent-hover: ${theme.accentHover};
  --accent-light: ${theme.accentLight};
  --border: ${theme.border};
  --border-light: ${theme.borderLight};
  --shadow: ${theme.shadow};
  --btn-dark: ${theme.btnDark};
  --btn-dark-hover: ${theme.btnDarkHover};
  --background: ${theme.bg};
  --foreground: ${theme.textPrimary};
`

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <style precedence="default" href="dropez-theme">{`:root { ${themeVars} }`}</style>
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: theme.bg, color: theme.textPrimary }}
      >
        {children}
      </body>
    </html>
  );
}