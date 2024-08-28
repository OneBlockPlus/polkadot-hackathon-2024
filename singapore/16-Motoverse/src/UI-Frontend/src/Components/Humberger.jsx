import { useState } from 'react';

const Hamburger = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        className="border border-gray-400 p-2 rounded-md hover:bg-gray-200"
        onClick={handleToggle}
      >
        <div className="w-6 h-0.5 bg-gray-400 mb-1"></div>
        <div className="w-6 h-0.5 bg-gray-400 mb-1"></div>
        <div className="w-6 h-0.5 bg-gray-400"></div>
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 z-10 bg-white p-4">
          <ul>
            <li>
              <a href="#">Link 1</a>
            </li>
            <li>
              <a href="#">Link 2</a>
            </li>
            <li>
              <a href="#">Link 3</a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Hamburger;