import React from 'react';
import { Link } from 'react-router-dom';
import "../App.css"
const ComingSoon = () => {
  return (
    <div className="dashboard-bg min-h-screen flex items-center justify-center px-4">
      <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 p-8 rounded-xl border border-gray-200 border-opacity-20 shadow-lg max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Coming Soon...</h1>
        <p className="text-gray-300 mb-8">
          We're working hard to bring you something amazing. Stay tuned!
        </p>
       
        <div className="mt-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 transition duration-300">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;