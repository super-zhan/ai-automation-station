import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "AI 自动化工作站 - 在线工具 · 效率指南 · AI 赋能",
  description: "免费的 AI 在线工具集合：Excel 自动处理、PDF 数据提取、文档批量处理。用 AI 提升工作效率，释放生产力。",
  keywords: "AI工具, 在线Excel处理, PDF提取, 自动化办公, 效率工具",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AI 自动化工作站",
    description: "用 AI 提升工作效率，释放生产力",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="h-full antialiased flex flex-col" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif' }}>
        <ThemeProvider>
          <I18nProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
