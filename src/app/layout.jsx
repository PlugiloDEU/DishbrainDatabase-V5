import './globals.css';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        />
      </head>
      <body className="h-full">
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

export const metadata = {
  title: 'AI Expert DB',
  description: 'Database of AI Experts and Companies',
}; 