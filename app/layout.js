import './globals.css';

export const metadata = {
  title: 'TechnoJagad — Service Center',
  description: 'Sistem Kalkulator & Generator Chat Service Laptop',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}