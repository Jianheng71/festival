import './globals.css';
import type { Metadata } from 'next';
import { Inter, Noto_Serif_SC } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const notoSerifSC = Noto_Serif_SC({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-serif' });
export const metadata: Metadata = { title: '节日日历 · Festival Calendar', description: '每一天，都值得被记住' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="zh-CN"><body className={`${inter.variable} ${notoSerifSC.variable} font-sans antialiased`}>{children}</body></html>);
}
