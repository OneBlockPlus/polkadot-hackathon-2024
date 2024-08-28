import React from 'react';
import Button from "../../Components/Common/Buttons/Button";
import { usePolkaContext } from '../../context/PolkaContext';

const MarketCard = () => {
  const { carDetails: carDetailsString, ownerInfo, imagesLinks } = usePolkaContext();

  // Convert carDetails from JSON string to an object
  let carDetails = {};
  try {
    carDetails = JSON.parse(carDetailsString);
  } catch (error) {
    console.error("Error parsing carDetails JSON:", error);
  }

  // Function to test and log the data
  const test = () => {
    console.log("Car Details:", carDetails);
    console.log("Owner Info:", ownerInfo);
    console.log("Images Links:", imagesLinks);
  };

  // Ensure carDetails and imagesLinks are defined
  if (!carDetails || !imagesLinks) {
    return <p>Loading...</p>;
  }

  return (
    <div className="self-stretch border border-black bg-white flex flex-col w-[700px] sm:w-[450px] items-start rounded-xl box-border shrink-0 overflow-hidden">
      <div className="flex flex-col items-center">
        {imagesLinks.imageUrls.length > 0  ? (
          imagesLinks.imageUrls.map((link, index) => (
            <img 
              key={index} 
              src={link} 
              alt={`Vehicle image ${index + 1}`} 
              className="w-full h-auto object-cover p-1" 
            />
          ))
        ) : (
          <p>No images available</p>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row self-stretch rounded-b-xl items-start gap-[20px] bg-[#FFF] p-[16px]">
        <div className="flex flex-col w-full gap-2">
          <h1 className="font-manrope leading-normal font-bold text-[16px] sm:text-xl text-[#003855]">
            {carDetails?.name || 'Vehicle Name'}
          </h1>
          <p className="font-[400] text-[#003855]">{carDetails?.description || 'No description available'}</p>
          <p className="font-[400] text-[#003855]">Status: {carDetails?.vehicleStatus || 'N/A'}</p>
          <p className="font-[400] text-[#003855]">Condition: {carDetails?.vehicleCondition || 'N/A'}</p>
          <p className="font-[400] text-[#003855]">License: {carDetails?.license || 'N/A'}</p>
          <p className="font-[400] text-[#003855]">VIN: {carDetails?.vin || 'N/A'}</p>
          <p className="font-[400] text-[#003855]">Country: {carDetails?.country || 'N/A'}</p>
          <p className="font-[400] text-[#003855]">Model: {carDetails?.model || 'N/A'}</p>
          <p className="font-[400] text-[#003855]">Make: {carDetails?.make || 'N/A'}</p>
          {/* <p className="font-[400] text-[#003855]">Mileage: {carDetails?.mileage || 'N/A'}</p>
          <p className="font-[400] text-[#003855]">Price: {carDetails?.price || 'N/A'}</p> */}
        </div>
        
        {/* <div className="flex flex-col w-full sm:w-1/2 gap-2">
          <h2 className="font-manrope leading-normal font-bold text-[16px] sm:text-xl text-[#003855]">Owner Info</h2>
          <p className="font-[400] text-[#003855]">Name: {ownerInfo?.firstName || 'N/A'} {ownerInfo?.lastName || 'N/A'}</p>
          <p className="font-[400] text-[#003855]">Address: {ownerInfo?.address || 'N/A'}</p>
          <p className="font-[400] text-[#003855]">Country: {ownerInfo?.country || 'N/A'}</p>
          <p className="font-[400] text-[#003855]">Zipcode: {ownerInfo?.zipcode || 'N/A'}</p>
        </div> */}
      </div>
      
      <div className="mx-auto mt-4">
        <Button onClick={test} cta="Test Data" Style="text-center" />
      </div>
    </div>
  );
};

export default MarketCard;
