import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import RenderInProvider from "@/components/Global/RenderInProvider";
import ProgressBar from "@/components/Global/ProgressBar";
import SafeNavigationGuard from "@/components/Global/SafeNavigationGuard";
import GoogleGtag from "@/components/Global/GoogleGtag";
import GoogleTagManager from "@/components/Global/GoogleTagManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'suneditor/dist/css/suneditor.min.css'
import { getDir, isRtlLocale } from "@/lib/localeDirection";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  metadataBase: appUrl ? new URL(appUrl) : undefined,
  title: {
    default: "ENSMENU",
    template: "%s",
  },
  description:
    "ENSmenu is a platform for creating digital menus for restaurants and cafes",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
};

// Light by default; dark only when user explicitly chose it via the navbar toggle
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      var isDark = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      if (!isDark) {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      document.documentElement.classList.remove('dark');
    }
  })();
`;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const dir = getDir(locale);
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="text-start antialiased" suppressHydrationWarning>
        <Suspense fallback={null}>
          <GoogleTagManager />
          <GoogleGtag />
        </Suspense>
        <ProgressBar />
        <ToastContainer
          position={isRtlLocale(locale) ? "top-left" : "top-right"}
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={isRtlLocale(locale)}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SafeNavigationGuard />
          <RenderInProvider>{children}</RenderInProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
