import './globals.css';

export const metadata = {
  title: 'PodWave Editor Dashboard',
  description: 'PodWave Editor System - Review and manage podcasts',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
