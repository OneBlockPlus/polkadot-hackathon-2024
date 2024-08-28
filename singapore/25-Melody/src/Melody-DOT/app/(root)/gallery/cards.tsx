import { Highlight } from "@/components/ui/card-stack";

export const CARDS = [
	{
		id: 0,
		name: "Manu Arora",
		designation: "Senior Software Engineer",
		content: (
			<p>
				These cards are incredible! 🌟 I’m excited to integrate them into our
				Web3 music and NFT projects. Framer Motion is an absolute game-changer
				for bringing our vision to life. 🙌
			</p>
		),
	},
	{
		id: 1,
		name: "Elon Musk",
		designation: "Senior Shitposter",
		content: (
			<p>
				I dont like this Twitter thing,{" "}
				<Highlight>deleting it right away</Highlight> because yolo. Instead, I
				would like to call it <Highlight>X.com</Highlight> so that it can easily
				be confused with adult sites.
			</p>
		),
	},
	{
		id: 2,
		name: "Tyler Durden",
		designation: "Manager Project Mayhem",
		content: (
			<p>
				The first rule of
				<Highlight>Fight Club</Highlight> is that you do not talk about fight
				club. The second rule of
				<Highlight>Fight club</Highlight> is that you DO NOT TALK about fight
				club.
			</p>
		),
	},
];