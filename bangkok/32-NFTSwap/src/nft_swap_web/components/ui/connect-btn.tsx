import { motion } from "framer-motion";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const Menu = ({
  setDropdownVisible,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  setDropdownVisible: (item: boolean) => void;
}) => {
  return (
    <nav
      onMouseLeave={() => setDropdownVisible(false)} // resets the state
      className="relative flex justify-center space-x-4 px-4 py-6 "
    >
      {children}
    </nav>
  );
};

export const MenuItem = ({
  handleConnect,
  active,
  title,
  isConnect,
  item,
  children,
  dropdownVisible,
  setDropdownVisible,
}: {
  setActive: (item: string) => void;
  handleConnect: () => void;
  active: string | null;
  title: React.ReactNode;
  item: string;
  isConnect: boolean;
  dropdownVisible: boolean;
  setDropdownVisible: (item: boolean) => void;
  children?: React.ReactNode;
}) => {
  return (
    <div
      onClick={() => {
        handleConnect();
      }}
      onMouseEnter={() => {
        console.log("MenuItem", active);
        if (isConnect) {
          setDropdownVisible(true);
        } else {
          setDropdownVisible(false);
        }
      }}
      className="relative "
    >
      <motion.p
        transition={{ duration: 0.3 }}
        // className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
        className="cursor-pointer shadow-[0_0_0_3px_#000000_inset] bg-transparent border border-black dark:border-white dark:text-white text-black rounded-2xl font-bold transform hover:-translate-y-1 transition duration-400 px-6 py-2"
      >
        {title}
      </motion.p>
      {dropdownVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {isConnect && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const HoveredLi = ({ children, ...rest }: any) => {
  return (
    <p
      className="text-neutral-200 dark:text-neutral-200 hover:text-purple-200 hover:font-semibold cursor-pointer"
      {...rest}
    >
      {children}
    </p>
  );
};
