import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const Products = () => {
  return (
    <section className="self-stretch flex flex-col items-start gap-[40px] sm:gap-[10px] bg-[#ECEDFF] w-full px-6 md:px-12 py-[50px]">
      <div className="self-stretch flex flex-col w-full items-start gap-[40px] sm:gap-[60px] ">
        <div className="flex max-sm:flex-col gap-2 justify-between sm:items-center w-full">
          <h1 className=" font-karla min-[2000px]:text-4xl text-[#003855] text-[27px] tracking-[-0.5px] md:tracking-[-0.78px] leading-[120%] font-bold">
            Cars for Sales in Mexico
          </h1>
          <Link
            to="/addmycar"
            className="max-md:w-fit rounded-full min-[2000px]:text-2xl bg-[#4E7FFF] flex items-center justify-center py-[5px] px-[15px] md:px-[16px] text-center text-base text-green-0 font-manrope"
          >
            <p className="">Add to Car</p>
          </Link>
        </div>

        <div className="w-full sm:gap-[16px] self-stretch h-fit flex gap-4 items-stretch overflow-x-scroll hide-scroll-bar scrollbar-none max-w-full">
          {dummyData.map((item, index) => (
            <ProductCard key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;

const dummyData = [
  {
    img: "/images/car1.svg",
    brand: "Hyundai",
    model: "Model 3",
    year: "2020",
    millage: "44559km",
    price: "23582",
    currency: "EUR",
    from: "11132",
    charge: "month",
    location: "Salta",
  },
  {
    img: "/images/car2.svg",
    brand: "Audi",
    model: "Sonata",
    year: "2018",
    millage: "68763km",
    price: "22222",
    currency: "CAD",
    from: "7177",
    charge: "week",
    location: "Mexico",
  },
  {
    img: "/images/car3.svg",
    brand: "Chevrolet",
    model: "Camry",
    year: "2022",
    millage: "74133km",
    price: "30254",
    currency: "USD",
    from: "10747",
    charge: "month",
    location: "Nigeria",
  },
  {
    img: "/images/car4.svg",
    brand: "Ford",
    model: "Silverado",
    year: "2019",
    millage: "36840km",
    price: "45154",
    currency: "USD",
    from: "14064",
    charge: "week",
    location: "USA",
  },
  {
    img: "/images/car4.svg",
    brand: "Mercedes-Benz",
    model: "Sonata",
    year: "2018",
    millage: "41426km",
    price: "18185",
    currency: "CAD",
    from: "7305",
    charge: "week",
    location: "Salta",
  },
  {
    img: "/images/car1.svg",
    brand: "Hyundai",
    model: "Model 3",
    year: "2020",
    millage: "44559km",
    price: "23582",
    currency: "EUR",
    from: "11132",
    charge: "month",
    location: "Mexico",
  },
  {
    img: "/images/car2.svg",
    brand: "Audi",
    model: "Sonata",
    year: "2018",
    millage: "68763km",
    price: "22222",
    currency: "CAD",
    from: "7177",
    charge: "week",
    location: "China",
  },
  {
    img: "/images/car3.svg",
    brand: "Chevrolet",
    model: "Camry",
    year: "2022",
    millage: "74133km",
    price: "30254",
    currency: "USD",
    from: "10747",
    charge: "month",
    location: "Brazil",
  },
  {
    img: "/images/car4.svg",
    brand: "Ford",
    model: "Silverado",
    year: "2019",
    millage: "36840km",
    price: "45154",
    currency: "USD",
    from: "14064",
    charge: "week",
    location: "USA",
  },
  {
    img: "/images/car4.svg",
    brand: "Mercedes-Benz",
    model: "Sonata",
    year: "2018",
    millage: "41426km",
    price: "18185",
    currency: "CAD",
    from: "7305",
    charge: "week",
    location: "Ghana",
  },
];
