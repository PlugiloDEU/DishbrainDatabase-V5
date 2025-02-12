"use client";
import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="font-cabin min-h-screen flex">
      <aside className="w-64 bg-gray-100 p-4">
        <nav className="space-y-2">
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-200">Home</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-200">About</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-200">Services</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-200">Contact</a>
        </nav>
      </aside>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="Logo" className="h-8" />
              <h1 className="text-xl font-semibold">AI Expert Database</h1>
            </div>
            <nav className="flex space-x-4">
              <a href="#" className="hover:text-blue-500">Home</a>
              <a href="#" className="hover:text-blue-500">About</a>
              <a href="#" className="hover:text-blue-500">Services</a>
              <a href="#" className="hover:text-blue-500">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 mt-16 ml-64">
        {children}
      </main>

      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <p>&copy; 2025 AI Expert Database. All rights reserved. | <a href="#" className="hover:text-blue-400">Terms</a> | <a href="#" className="hover:text-blue-400">Privacy</a> | <a href="#" className="hover:text-blue-400">Contact</a></p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400">Terms</a>
              <a href="#" className="hover:text-blue-400">Privacy</a>
              <a href="#" className="hover:text-blue-400">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
