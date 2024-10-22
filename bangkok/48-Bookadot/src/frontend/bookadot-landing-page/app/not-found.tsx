"use client";
import { ArrowLeft, NotFound } from "./components/Icon";
import Typography from "./components/Typography";
import { MdHome } from "react-icons/md";
import { useRouter } from "next/navigation";

const NotFoundPage = () => {
  const router = useRouter();
  return (
    <section className="min-h-main flex flex-col items-center">
      <div className="my-20 flex w-[700px] flex-col">
        <NotFound />
        <Typography component="h1" className="mb-3 mt-5 text-header font-bold">
          Opps! Page not found.
        </Typography>

        <Typography className="text-text-secondary-color">
          The page you are looking for doesn’t exist or might’ve been removed
        </Typography>

        <button
          className="mb-4 mt-12 flex w-max items-center rounded-[10px] bg-foreground-color p-[8px_16px] font-semibold hover:opacity-80"
          onClick={() => {
            router.back();
          }}
        >
          <ArrowLeft className="mr-3" />
          Go back
        </button>
        <button
          className="flex w-max items-center rounded-[10px] bg-accent-color p-[8px_16px]  text-black hover:opacity-80"
          onClick={() => {
            router.push("/");
          }}
        >
          <MdHome className="mr-3 size-[20px] fill-black" />
          Jump to the home page
        </button>
      </div>
    </section>
  );
};

export default NotFoundPage;
