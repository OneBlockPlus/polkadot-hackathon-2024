

const ProductCard = ({
    img, brand, model, 
    year, millage, gear,
    price, currency,
    from, charge,
    location
}) => {
  return (
    <div className="self-stretch bg-white  flex flex-col w-[230px] sm:w-[250px] items-start rounded-xl box-border shrink-0 overflow-hidden">
            <img
              src={img}
              alt=""
              className="self-stretch w-full rounded-t-xl object-cover "
            />
            <div className="self-stretch flex flex-col rounded-b-xl items-start gap-[20px] bg-[#FFF] p-[16px] ">
              <h1 className="font-manrope leading-normal font-bold min-[2000px]:text-xl text-[16px] text-[#003855]">
                {brand} - {model}
                <p className="font-[400]">{year} • {millage} • {gear}</p>
              </h1>

              <h1 className="font-manrope leading-normal font-bold text-[16px] min-[2000px]:text-xl text-[#003855]">
                {price} {currency}
                <p className="font-[400]">From {from} {currency}/{charge}</p>
              </h1>

              <div className="flex items-center justify-center gap-[8px]">
                <img
                  src="/images/MapPin.svg"
                  alt=""
                  className="w-[25px] h-[25px]"
                />
                <p className="font-bold text-base font-manrope leading-normal text-[#003855]">
                {location}
                </p>
              </div>
            </div>
          </div>
  )
}

export default ProductCard