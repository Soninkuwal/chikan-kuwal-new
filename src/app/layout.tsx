
'use client';
import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { app } from '@/lib/firebase';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

// We can't use generateMetadata in a client component, 
// so we'll manage the title and icon dynamically.
// export const metadata: Metadata = {
//   title: 'Chicken Road Riches',
//   description: 'A fun online game by yaar tera badmas hai jaanu',
//   icons: [{ rel: "icon", url: "https://chickenroad.rajmines.com/images/chicken.png" }]
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [siteTitle, setSiteTitle] = useState('Chicken Road Riches');
  const [siteIcon, setSiteIcon] = useState('https://chickenroad.rajmines.com/images/chicken.png');

  const updateMetadata = (settings: any) => {
    if (settings.siteTitle) {
      setSiteTitle(settings.siteTitle);
      document.title = settings.siteTitle;
    }
    if (settings.siteIcon) {
      setSiteIcon(settings.siteIcon);
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.siteIcon;
    }
  };

  useEffect(() => {
    // Initial update from local storage if available
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      updateMetadata(JSON.parse(savedSettings));
    }
    
    // Listen for real-time updates from Firebase
    const db = getDatabase(app);
    const settingsRef = ref(db, 'settings');
    const listener = onValue(settingsRef, (snapshot) => {
        if(snapshot.exists()) {
            const dbSettings = snapshot.val();
            localStorage.setItem('adminSettings', JSON.stringify(dbSettings));
            updateMetadata(dbSettings);
        }
    });

    // Also listen for storage events to sync across tabs
    const handleStorageChange = () => {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            updateMetadata(JSON.parse(savedSettings));
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      off(settingsRef, 'value', listener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
          <title>{siteTitle}</title>
          <link rel="icon" href={siteIcon} />
      </head>
      <body className={`${poppins.variable} font-body antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
