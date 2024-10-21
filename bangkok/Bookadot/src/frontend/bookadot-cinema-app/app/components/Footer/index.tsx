import { Footer } from "flowbite-react";
import { BsDiscord, BsGithub, BsTwitter } from "react-icons/bs";

export function TCBFooter() {
  return (
      <Footer container>
        <div className="w-full">
          <Footer.Divider />
          {/*<Container className="flex flex-wrap items-center justify-evenly">*/}
          {/*  <div className={"w-full md:w-auto"}>*/}
          {/*    <Footer.Brand*/}
          {/*      href={process.env.NEXT_PUBLIC_URL || "/"}*/}
          {/*      src="https://cdn.connectto.world/logo.svg"*/}
          {/*      width={"300px"}*/}
          {/*      height={"400px"}*/}
          {/*      className={"justify-center"}*/}
          {/*    ></Footer.Brand>*/}
          {/*    <br />*/}
          {/*    <h1 className={"text-center text-5xl text-[#59C3DC]"}>Bookadot</h1>*/}
          {/*  </div>*/}
          {/*  <div className="mt-14 grid w-full grid-cols-2 gap-0 sm:gap-6 md:w-auto">*/}
          {/*    <div>*/}
          {/*      <Footer.Title title="Menu" />*/}
          {/*      <Footer.LinkGroup col>*/}
          {/*        <Footer.Link href="#" className={"text-sm sm:text-lg"}>*/}
          {/*          Marketplace*/}
          {/*        </Footer.Link>*/}
          {/*        <Footer.Link href="#" className={"text-sm sm:text-lg"}>*/}
          {/*          Channel*/}
          {/*        </Footer.Link>*/}
          {/*        <Footer.Link href="#" className={"text-sm sm:text-lg"}>*/}
          {/*          About Us*/}
          {/*        </Footer.Link>*/}
          {/*      </Footer.LinkGroup>*/}
          {/*    </div>*/}
          {/*    <div>*/}
          {/*      <Footer.Title title="Legal" />*/}
          {/*      <Footer.LinkGroup col>*/}
          {/*        <Footer.Link href="#" className={"text-sm sm:text-lg"}>*/}
          {/*          Privacy Policy*/}
          {/*        </Footer.Link>*/}
          {/*        <Footer.Link href="#" className={"text-sm sm:text-lg"}>*/}
          {/*          Terms &amp; Conditions*/}
          {/*        </Footer.Link>*/}
          {/*        <Footer.Link href="#" className={"text-sm sm:text-lg"}>*/}
          {/*          License*/}
          {/*        </Footer.Link>*/}
          {/*      </Footer.LinkGroup>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</Container>*/}
          {/*<Footer.Divider />*/}
          <div className="w-full justify-center max-sm:flex-col sm:flex sm:items-center sm:justify-between">
            <div className={"flex justify-center"}>
              <Footer.Copyright
                  href="https://thecosmicblock.com"
                  by="The Cosmic Block Labs™"
                  year={2024}
              />
            </div>
            <div className="mt-3 flex justify-center space-x-6 sm:mt-0 sm:justify-center">
              <Footer.Icon
                  href={process.env.NEXT_DISCORD_URL || "#"}
                  icon={BsDiscord}
                  target={"_blank"}
              />
              <Footer.Icon
                  href={process.env.NEXT_X_URL || "#"}
                  icon={BsTwitter}
                  target={"_blank"}
              />
              <Footer.Icon
                  href={process.env.NEXT_GITHUB_URL || "#"}
                  icon={BsGithub}
                  target={"_blank"}
              />
            </div>
          </div>
        </div>
      </Footer>
  );
}
