import { twMerge } from "tailwind-merge";

interface IAboutItemProps extends React.PropsWithChildren {
  icon: React.ReactNode;
  direction: "left" | "right";
}

const AboutItem = ({ children, icon, direction }: IAboutItemProps) => {
  return (
    <div
      className={twMerge(
        "flex w-full items-center justify-between",
        direction === "right" && "flex-row-reverse",
      )}
    >
      <div className="max-w-[69.2%]">{children}</div>
      {icon}
    </div>
  );
};

export default AboutItem;
