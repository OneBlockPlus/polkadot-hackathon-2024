"use client";
import {Button} from "flowbite-react";
import Typography from "./components/Typography";
import {useState} from "react";
import HomePageSearch from "./components/HomePageSearch";

export default function Home() {
    const [value, setValue] = useState(undefined);
    return (
        <main className="min-h-screen">
            <section className="hero mt-28 grid grid-cols-12 bg-opacity-10 p-5">
                <div className="col-span-8 flex flex-col">
                    <Typography component="h1" className="pt-12 text-header font-bold">
                        Book tickets
                    </Typography>
                    <Typography component="label" className="mt-1 text-header font-bold">
                        anywhere, all in{" "}
                        <span className="text-accent-color">one place</span>
                    </Typography>
                    <Typography
                        component="p"
                        className="mb-2 mt-24 text-normal text-text-secondary-color"
                    >
                        What, when, where?
                    </Typography>

                    <HomePageSearch/>
                    <a href={'https://bookadot.thecosmicblock.com/cinema'} target={"_blank"}
                    >
                        <Button
                            color="bookadot-primary"
                            className="mt-8 w-[300px] hover:opacity-80"
                        >

                            Launch App --&gt;
                        </Button>
                    </a>

                </div>
                {/*<div className="col-span-4">*/}
                {/*  <HomeTicket />*/}
                {/*</div>*/}
            </section>
        </main>
    );
}
