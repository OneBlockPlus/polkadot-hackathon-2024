/* eslint-disable react/prop-types */

const ImageGallery = ({ imageLinks }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full  ">
      {imageLinks.map((link, index) => (
        <img
          key={index}
          className="w-full h-[172px] lg:h-[250px]  object-cover rounded-lg"
          alt={`Image ${index + 1}`}
          src={link}
        />
      ))}
    </div>
  );
};

export default ImageGallery;
