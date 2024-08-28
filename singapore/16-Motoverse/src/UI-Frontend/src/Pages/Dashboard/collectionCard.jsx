const CollectionCard = ({ metadata }) => {
  return (
    <div className="self-stretch border border-black bg-white flex flex-col w-[230px] sm:w-[250px] items-start rounded-xl box-border shrink-0 overflow-hidden">
      <p className="font-light text-[#003855] px-4 py-2">Collection Id: {metadata.id}</p>
      <img
        src={metadata.image}
        alt={metadata.name}
        className="w-full h-[200px] p-3 rounded-t-xl object-cover"
      />
      <div className="flex flex-col items-start gap-4 bg-white p-4 w-full">
        <p className="font-light text-[#003855]">Name: {metadata.name}</p>
        <p className="font-light text-[#003855]">Description: {metadata.description}</p>
        <p className="font-light text-[#003855]">Owner: {metadata.owner.slice(0, 4)}...</p>
      </div>
    </div>
  );
};

export default CollectionCard;
