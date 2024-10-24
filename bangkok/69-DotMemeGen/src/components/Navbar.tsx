import { Layout, Button, Skeleton } from "antd";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const ConnectWallet = dynamic(() => import("./ConnectWallet"), {
  ssr: false,
  loading: () => <Skeleton.Button active />,
});

const { Header } = Layout;

function Navbar() {
  return (
    <div>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#E5007A",
          padding: "0 32px",
        }}
      >
        <Link href="/">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              color: "#fff",
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            MemeGen
          </motion.h1>
        </Link>
        <div
          className="flex gap-3"
          style={{ display: "flex", alignItems: "center" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Button className="text-primaryButton" type="default">
              Polkadot
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="w-full"
          >
            <div className=" flex items-end justify-end">
              <ConnectWallet />
            </div>
          </motion.div>
        </div>
      </Header>
    </div>
  );
}

export default Navbar;
