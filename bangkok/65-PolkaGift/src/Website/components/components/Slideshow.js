import React from "react";
//These are Third party packages for smooth slideshow
import { Zoom } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

const Slideshow = (images = []) => {

	function Slider(each, index) {
		if (each.type.includes("image") == true) {
			return <>
				<div key={index} style={{
					display: "flex",
					justifyContent: "center",
					width: "100%",
					height: "100%"
				}}>
					<img style={{maxWidth: 'max-content', objectFit: 'contain'}} src={each.url} />
				</div>
			</>
		}
		if (each.type.includes("video") == true) {
			return <>
				<div key={index} style={{
					display: "flex",
					justifyContent: "center",
					width: "100%",
					height: "100%"
				}}>
					<video width="100%" height="100%" controls>
						<source src={each.url} />
					</video>
				</div>
			</>
		}
		return <>
			<div key={index}
				style={{
					display: "flex",
					justifyContent: "center",
					width: "100%",
					height: "100%",
					alignItems: "center"
				}}>
				<a href={each.url} target="_blank" rel="noreferrer"  style={{ wordBreak: "break-all" }}>
					<span>
						{each.url}
					</span>
					<img src="https://cdn1.iconfinder.com/data/icons/web-page-and-iternet/90/Web_page_and_internet_icons-10-512.png" style={{ height: 325, width: "100%" }} />
				</a>
			</div>
		</>
	}


	//These are custom properties for zoom effect while slide-show
	const zoomInProperties = {
		indicators: true,
		scale: 1.2,
		duration: 5000,
		transitionDuration: 500,
		infinite: true,
		prevArrow: (
			<div style={{ width: "30px", marginRight: "-30px", cursor: "pointer" }}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
					fill="#2e2e2e"
				>
					<path d="M242 180.6v-138L0 256l242 213.4V331.2h270V180.6z" />
				</svg>
			</div>
		),
		nextArrow: (
			<div style={{ width: "30px", marginLeft: "-30px", cursor: "pointer" }}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
					fill="#2e2e2e"
				>
					<path d="M512 256L270 42.6v138.2H0v150.6h270v138z" />
				</svg>
			</div>
		),
	};
	console.log("slideShow")
	if (images['images'].length !== 0 & images !== undefined) {

		return (
			<div className="m-10">
				<Zoom {...zoomInProperties}>
					{images['images'].map((each, index) => (
						Slider(each, index)
					))}
				</Zoom>
			</div>
		);
	}
	return <></>

};

export default Slideshow;
