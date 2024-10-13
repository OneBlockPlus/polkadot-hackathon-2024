import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="dashboard-bg min-h-screen flex items-center justify-center px-4">
      <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 p-8 rounded-xl border border-gray-200 border-opacity-20 shadow-lg max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;