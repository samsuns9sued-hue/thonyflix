import type { Metadata } from "next";
import "./globals.css"; // Verifique se o globals.css está na mesma pasta, senão remova essa linha

export const metadata: Metadata = {
  title: "Meu Flix",
  description: "Site de filmes pessoal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}