import type { Metadata } from "next";
import Head from "next/head";
import Info from "./components/Info/Info";
import ProviderWrapper from "./providers/ProviderWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Login",
  description: "Welcome to Login",
  keywords: "",
  authors: [
    { name: "Login" }
  ],
  openGraph: {
    title: "Login",
    description: "Welcome to Login",
    url: 'https://login.machinename.dev',
    siteName: 'Login',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const id = process.env.GOOGLE_AD_SENSE_ID as string;
const url = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body>
        <Head>
          <script
            async
            src={url}
            crossOrigin="anonymous"
          />
        </Head>
        <ProviderWrapper>
          {children}
          <Info />
        </ProviderWrapper>
      </body>
    </html>
  );
}
