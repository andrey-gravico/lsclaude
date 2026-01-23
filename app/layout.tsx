import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Курс по мобильной съёмке | Снимай. Монтируй. Удивляй — @littlesveta',
  description:
    'Офлайн-курс по мобильной съёмке в Крыму. Научись профессиональной режиссуре, цветокоррекции и монтажу за 4 дня интенсивной практики. Автор курса — @littlesveta',
  keywords: [
    'курс мобильная съёмка',
    'мобилография',
    'курс монтаж',
    'видеосъёмка на телефон',
    'обучение съёмке',
    'курс цветокоррекция',
    'контент мейкер',
    'Крым',
    'littlesveta',
  ],
  authors: [{ name: 'Света', url: 'https://instagram.com/littlesveta' }],
  creator: 'littlesveta',
  publisher: 'littlesveta',
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
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://littlesveta.ru',
    siteName: 'Курс по мобильной съёмке — littlesveta',
    title: 'Снимай. Монтируй. Удивляй — Курс по мобильной съёмке',
    description:
      'Научись снимать профессиональный контент на телефон за 4 дня. Режиссура, монтаж, цветокоррекция — всё в одном интенсиве в Крыму.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Курс по мобильной съёмке — littlesveta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Снимай. Монтируй. Удивляй — Курс по мобильной съёмке',
    description:
      'Научись снимать профессиональный контент на телефон за 4 дня. Режиссура, монтаж, цветокоррекция.',
    images: ['/images/og-image.jpg'],
    creator: '@littlesveta',
  },
  alternates: {
    canonical: 'https://littlesveta.ru',
  },
  category: 'education',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

// Яндекс.Метрика ID (замените на свой)
// TODO: Замените на реальный ID метрики перед запуском
const YM_ID = ''; // Временно отключено

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-inter antialiased bg-background text-text-primary">
        {children}

        {/* Яндекс.Метрика - активируется только при наличии реального ID */}
        {YM_ID && (
          <>
            <Script id="yandex-metrika" strategy="afterInteractive">
              {`
                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                ym(${YM_ID}, "init", {
                  clickmap:true,
                  trackLinks:true,
                  accurateTrackBounce:true,
                  webvisor:true
                });
              `}
            </Script>
            <noscript>
              <div>
                <img
                  src={`https://mc.yandex.ru/watch/${YM_ID}`}
                  style={{ position: 'absolute', left: '-9999px' }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}
