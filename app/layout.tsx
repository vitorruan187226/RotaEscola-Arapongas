import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rota Escola Arapongas",
  description: "Sistema de controle de rotas de transporte escolar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: radial-gradient(circle at top left, #0d1117, #07090e);
            color: #f0f6fc;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow-x: hidden;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
