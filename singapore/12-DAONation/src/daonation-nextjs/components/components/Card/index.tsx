const Card = ({ children, height, width, className }: any) => {
  return (
    <div className={`${className} flex w-full p-6 border-1 border-beerus shadow-moon-lg rounded-moon-s-md bg-gohan text-bulma`} style={{ height, width }}>
      {children}
    </div>
  );
};

export default Card;
