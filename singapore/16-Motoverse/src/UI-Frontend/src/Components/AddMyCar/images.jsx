import ImageGallery from "./UploadImages/ImageGallery";
import { usePolkaContext } from "../../context/PolkaContext";

const Images = () => {
  const {imagesLinks}= usePolkaContext()

  
  return (
    <div className="">
      <ImageGallery imageLinks={imagesLinks} />
    </div>
  );
};

export default Images;
