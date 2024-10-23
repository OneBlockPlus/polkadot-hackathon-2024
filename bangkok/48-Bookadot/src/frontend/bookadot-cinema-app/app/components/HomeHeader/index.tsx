import { Button, Navbar } from "flowbite-react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { shortenWalletAddress } from "@/app/utils/helper";
import Image from "next/image";

export const HomeHeader = () => {
    const { open } = useAppKit()
    const { isConnected, address } = useAccount()
    return (
        <Navbar fluid rounded>
            <Navbar.Brand href={process.env.NEXT_PUBLIC_SITE_URL!}>
                <Image
                    src={"https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png"}
                    width={65}
                    height={65}
                    alt="Bookadot"
                />
            </Navbar.Brand>
            <div>
                <Button
                    className="w-full mt-4" color="bookadot-primary"
                    onClick={() => open()}
                >
                    {isConnected ? shortenWalletAddress(address || "") : "Connect Wallet"}
                </Button>
            </div>
        </Navbar>
    );
};
