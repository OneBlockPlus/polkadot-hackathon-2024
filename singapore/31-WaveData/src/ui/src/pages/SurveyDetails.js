import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import React from "react";
import Select from "react-select";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { PlusSmIcon, ChevronRightIcon, PencilIcon, TrashIcon, PlusIcon, DocumentDuplicateIcon } from "@heroicons/react/solid";
import useContract from "../services/useContract";
import UpdateSurveyModal from "../components/modal/UpdateSurvey";

import "./SurveyDetails.css";
function SurveyDetails() {
	var Thisstate = {
		sectionsloaded: false,
		data: []
	};
	const { api, contract, signerAddress, sendTransaction, ReadContractValue, ReadContractByQuery, getMessage, getQuery } = useContract();
	const params = useParams();
	const navigate = useNavigate();
	let location = useLocation();
	const [tabIndex, setTabIndex] = useState(0);

	const [STUDY_DATA, setSTUDY_DATA] = useState({});
	const [SURVEY_DATA, setSURVEY_DATA] = useState({});
	const [UpdatemodalShow, setModalShow] = useState(false);
	const [status, setstatus] = useState("");
	const [screenSize, getDimension] = useState({
		dynamicWidth: window.innerWidth,
		dynamicHeight: window.innerHeight
	});

	const [sectionsdata, setsectionsdata] = useState([
		{
			category: "",
			description: "",
			id: 0,
			questions: [
				{
					id: 0,
					questiontype: "rating",
					question: "",
					questiontype2: "1-5",
					limited: [
						{
							answer: ""
						}
					]
				}
			]
		}
	]);

	const [dataCategory, setdataCategory] = useState([]);
	const [sectionsQuestionsdata, setsectionsQuestionsdata] = useState([
		{
			id: "",
			sectionid: "",
			questiontype: "",
			surveyid: "",
			question: "",
			questiontype2: ""
		}
	]);
	const [emptydata, setemptydata] = useState([]);

	const TABS = [
		{
			id: "questions",
			title: "Questions"
		},
		{
			id: "responses",
			title: "Responses"
		}
	];

	async function AddCategory(e, index) {
		setstatus("saving...");
		var BTN = e.currentTarget;
		BTN.disabled = true;
		BTN.classList.remove("hover:bg-white");
		BTN.classList.remove("cursor-pointer");
		var categoryname = document.getElementsByName("categoryName")[index];
		var categoryimagelink = document.getElementsByName("imagelink")[index];
		await sendTransaction(api, signerAddress, "CreateSurveyCategory", [categoryname.value, categoryimagelink.value]);
		setdataCategory((prevState) => [
			...prevState,
			{
				text: categoryname.value,
				value: categoryname.value,
				icon: <img className="w-6 h-6" src={categoryimagelink.value} />
			}
		]);
		categoryname.value = "";
		categoryimagelink.value = "";
		setstatus("saved!");
		BTN.disabled = false;
		BTN.classList.add("hover:bg-white");
		BTN.classList.add("cursor-pointer");
	}

	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	async function addSection(e) {
		setstatus("adding...");
		var addSectionBTN = e.currentTarget;
		addSectionBTN.classList.remove("hover:bg-gray-600");
		addSectionBTN.classList.remove("bg-black");
		addSectionBTN.classList.add("bg-gray-400");
		addSectionBTN.classList.add("cursor-default");
		addSectionBTN.disabled = true;
		setsectionsdata((prevState) => [
			...prevState,
			{
				category: "",
				description: "",
				id: Math.floor(Math.random() * Date.now()).toString(16),
				questions: [
					{
						id: 0,
						questiontype: "rating",
						question: "",
						questiontype2: "1-5",
						limited: [
							{
								answer: ""
							}
						]
					}
				]
			}
		]);
		addSectionBTN.classList.add("hover:bg-gray-600");
		addSectionBTN.classList.add("bg-black");
		addSectionBTN.classList.remove("bg-gray-400");
		addSectionBTN.classList.remove("cursor-default");
		addSectionBTN.disabled = false;
		setstatus("added!");
	}

	async function addQuestion(e, index) {
		setstatus("adding...");
		var addQuestionBTN = e.currentTarget;
		addQuestionBTN.classList.remove("hover:bg-gray-600");
		addQuestionBTN.classList.remove("bg-black");
		addQuestionBTN.classList.add("bg-gray-400");
		addQuestionBTN.classList.add("cursor-default");
		addQuestionBTN.disabled = true;

		sectionsdata[index].questions.push({
			id: Math.floor(Math.random() * Date.now()).toString(16),
			questiontype: "rating",
			question: "",
			questiontype2: "1-5",
			limited: [
				{
					answer: ""
				}
			]
		});
		removeElementFromArrayBYID(emptydata, 0, setemptydata);

		addQuestionBTN.classList.add("hover:bg-gray-600");
		addQuestionBTN.classList.add("bg-black");
		addQuestionBTN.classList.remove("bg-gray-400");
		addQuestionBTN.classList.remove("cursor-default");

		addQuestionBTN.disabled = false;
		setstatus("added!");
	}
	async function SaveSection(e) {
		setstatus("saving...");
		var SaveBTN = e.currentTarget;
		SaveBTN.classList.remove("hover:bg-gray-600");
		SaveBTN.classList.remove("bg-black");
		SaveBTN.classList.add("bg-gray-400");
		SaveBTN.classList.add("cursor-default");
		SaveBTN.disabled = true;
		try {
			await sendTransaction(api, signerAddress, "CreateOrSaveSections", [SURVEY_DATA.id, JSON.stringify(sectionsdata)]);
		} catch (error) {

		}
		SaveBTN.classList.add("hover:bg-gray-600");
		SaveBTN.classList.add("bg-black");
		SaveBTN.classList.remove("bg-gray-400");
		SaveBTN.classList.remove("cursor-default");

		SaveBTN.disabled = false;
		setstatus("saved!");
	}
	async function LoadDataStudy() {
		if (contract !== null && api !== null) {

			setstatus("loading...");

			let study_element = await ReadContractByQuery(api, signerAddress, getQuery("_studyMap"), [parseInt(location.state.studyID)]);
			var newStudy = {
				id: Number(study_element.studyId),
				title: study_element.title,
				image: study_element.image,
				description: study_element.description,
				contributors: Number(study_element.contributors),
				audience: Number(study_element.audience),
				budget: window.ParseBigNum(study_element.budget)
			};

			setSTUDY_DATA(newStudy);
			setstatus("loaded!");
		}


	}
	async function LoadSurveyData() {
		if (contract !== null && api !== null) {
			setstatus("loading...");

			let survey_element = await ReadContractByQuery(api, signerAddress, getQuery("_surveyMap"), [parseInt(params.id)]);
			var new_survey = {
				id: Number(survey_element.surveyId),
				study_id: Number(survey_element.studyId),
				user_id: Number(survey_element.userId),
				name: survey_element.name,
				description: survey_element.description,
				date: survey_element.date,
				image: survey_element.image,
				reward: window.ParseBigNum(survey_element.reward),
				submission: Number(survey_element?.submission)
			};
			setSURVEY_DATA(new_survey);

			setstatus("loaded!");
		}

	}

	async function LoadDataSections() {
		if (contract !== null && api !== null) {
			setstatus("loading...");
			setsectionsdata([]);
			sleep(100);

			try {
				let SectionsInfo =  JSON.parse(await ReadContractByQuery(api, signerAddress, getQuery("_sectionsMap"), [parseInt(0)]));
				setsectionsdata(SectionsInfo);
			} catch (error) { }

			Thisstate.sectionsloaded = true;
			setstatus("loaded!");
		}
	}
	async function LoadDataCategories() {
		try {
			if (contract !== null && api !== null) {
				setdataCategory([]);
				sleep(100);
				
			const totalSurveyCategory = await ReadContractByQuery(api,signerAddress, getQuery("_SurveyCategoryIds"))    
		
				for (let i = 0; i < Number(totalSurveyCategory); i++) {
					const element = await ReadContractByQuery(api, signerAddress, getQuery("_categoryMap"), [parseInt(i)]);
					setdataCategory((prevState) => [
						...prevState,
						{
							value: element.name,
							text: element.name,
							icon: <img className="w-6 h-6" src={element.image} />
						}
					]);
				}
			}
		} catch (error) {}
	}


	async function AddLimitedAnswer(e, item, indexSect, indexItem) {
		setstatus("saving...");
		var AddLimitedBTN = e.currentTarget;
		AddLimitedBTN.classList.remove("hover:bg-white");
		AddLimitedBTN.classList.add("bg-gray-300");
		AddLimitedBTN.classList.add("cursor-default");
		AddLimitedBTN.disabled = true;
		sectionsdata[indexSect].questions[Number(indexItem)].limited.push({ answer: "" });

		removeElementFromArrayBYID(emptydata, 0, setemptydata);
		AddLimitedBTN.classList.add("hover:bg-white");
		AddLimitedBTN.classList.remove("bg-gray-300");
		AddLimitedBTN.classList.remove("cursor-default");
		AddLimitedBTN.disabled = false;
		setstatus("saved!");
	}

	function RatingAnswer({ item, indexItem, index }) {
		return (
			<>
				<div className={`bg-white ${screenSize.dynamicWidth < 800 ? "" : ""}`} style={{ width: screenSize.dynamicWidth < 800 ? "100%" : "49%" }} id={`AnswerType${indexItem}`}>
					<select
						id="testID"
						defaultValue={item.questiontype2}
						onChange={(e) => {
							sectionsdata[index].questions[indexItem].questiontype2 = e.target.value;
							setsectionsdata(sectionsdata);
						}}
						className="h-10 px-1 rounded-md border border-gray-200 outline-none "
						style={{ "width": "100%" }}
					>
						<option value="1-3">Rating from 1 to 3</option>
						<option value="1-5">Rating from 1 to 5</option>
					</select>
				</div>
			</>
		);
	}

	function AnswerTypeJSX({ item, indexSect, indexItem }) {
		function Allanswer({ item, indexSect }) {
			var all = [];
			sectionsdata[indexSect].questions[indexItem].limited.map((itemQuestions, index) => {
				all.push(
					<div key={index} style={{ display: "flex", width: screenSize.dynamicWidth < 800 ? "100%" : "49%", alignItems: "center", fontSize: 19, justifyContent: "space-between" }} className="mt-3">
						<span style={{ fontWeight: 700, minWidth: "fit-content" }} className="mr-2">
							Answer {index + 1}
						</span>
						<input
							onKeyUp={(e) => {
								sectionsdata[indexSect].questions[indexItem].limited[index].answer = e.target.value;
							}}
							type="text"
							defaultValue={itemQuestions.answer}
							className="border py-1 px-2"
							placeholder="Answer"
							style={{ width: "69%" }}
						/>
						<button
							onClick={(e) => {
								DeleteLimitedAnswer(indexSect, indexItem, index);
							}}
							orderid={index}
							className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
						>
							<TrashIcon className="w-5 h-5" />
						</button>
					</div>
				);
			});

			return all;
		}
		return (
			<>
				<div className="w-full ml-0" id={`AnswerType${indexItem}`}>
					<div>
						<Allanswer item={item} indexSect={indexSect} />

						<button onClick={(e) => AddLimitedAnswer(e, item, indexSect, indexItem)} className="h-10 mt-3 rounded-md border-solid border bg-gray-100 flex py-2 px-4 items-center text-gray-700 hover:bg-white">
							<PlusSmIcon className="w-5 h-5 " />
							<p className="ml-2"> Answer</p>
						</button>
					</div>
				</div>
			</>
		);
	}


	async function removeElementFromArrayBYID(all, specificid, seting) {
		seting([]);
		var storing = [];
		for (let index = 0; index < all.length; index++) {
			const element = all[index];
			if (element.id === specificid) {
				continue;
			}
			storing.push(element);
		}

		seting(storing);

		console.log("done");
	}
	async function removeElementFromSectionBYIndex(specificid, type = "section", args = {}) {
		var storing = [];
		if (type === "section") {
			for (let index = 0; index < sectionsdata.length; index++) {
				const element = sectionsdata[index];
				if (index === specificid) {
					continue;
				}
				storing.push(element);
			}
			setsectionsdata(storing);
			return;
		}
		if (type === "question") {
			/*
		 args = {
			indexSect : 0
		 }
		 */
			for (let index = 0; index < sectionsdata[args.indexSect].questions.length; index++) {
				const element = sectionsdata[args.indexSect].questions[index];
				if (index === specificid) {
					continue;
				}
				storing.push(element);
			}
			sectionsdata[args.indexSect].questions = storing;
			return;
		}
		if (type === "LimitedQuestions") {
			/*
		 args = {
			indexSect : 0,
			indexQuestion : 0
		 }
		 */
			for (let index = 0; index < sectionsdata[args.indexSect].questions[args.indexQuestion].limited.length; index++) {
				const element = sectionsdata[args.indexSect].questions[args.indexQuestion].limited[index];
				if (index === specificid) {
					continue;
				}
				storing.push(element);
			}
			sectionsdata[args.indexSect].questions[args.indexQuestion].limited = storing;
			return;
		}
	}

	async function duplicateElementFromSectionBYIndex(specificid, type = "section", args = {}) {
		var storing = [];
		let found = 0;
		if (type === "section") {
			for (let index = 0; index < sectionsdata.length; index++) {
				const element = sectionsdata[index];
				if (index === specificid) {
					storing.push(element);
					found = 1;
				}
				var element2 = structuredClone(element);

				if (found === 1) {
					element2.id = Math.floor(Math.random() * Date.now()).toString(16);
				}
				storing.push(element2);
			}
			setsectionsdata(storing);
			return;
		}
		if (type === "question") {
			/*
		 args = {
			indexSect : 0
		 }
		 */
			for (let index = 0; index < sectionsdata[args.indexSect].questions.length; index++) {
				const element = sectionsdata[args.indexSect].questions[index];
				if (index === specificid) {
					storing.push(element);
					found = 1;
				}
				var element2 = structuredClone(element);
				if (found === 1) {
					element2.id = Math.floor(Math.random() * Date.now()).toString(16);
				}
				storing.push(element2);
			}
			sectionsdata[args.indexSect].questions = storing;
			return;
		}
		if (type === "LimitedQuestions") {
			/*
		 args = {
			indexSect : 0,
			indexQuestion : 0
		 }
		 */
			for (let index = 0; index < sectionsdata[args.indexSect].questions[args.indexQuestion].limited.length; index++) {
				const element = sectionsdata[args.indexSect].questions[args.indexQuestion].limited[index];
				if (index === specificid) {
					storing.push(element);
					found = 1;
				}
				if (found === 1) {
					element.id++;
				}
				storing.push(element);
			}
			sectionsdata[args.indexSect].questions[args.indexQuestion].limited = storing;
			return;
		}
	}

	async function deleteSection(indexSect) {
		setstatus("deleting...");
		removeElementFromSectionBYIndex(indexSect, "section");
		removeElementFromArrayBYID(emptydata, 0, setemptydata);
		setstatus("deleted!");
	}
	async function deleteQuestion(indexSect, index) {
		setstatus("deleting...");
		removeElementFromSectionBYIndex(index, "question", { indexSect: indexSect });
		removeElementFromArrayBYID(emptydata, 0, setemptydata);
		setstatus("deleted!");
	}
	async function DeleteLimitedAnswer(indexSect, questionid, index) {
		setstatus("deleting...");
		removeElementFromSectionBYIndex(index, "LimitedQuestions", { indexSect: indexSect, indexQuestion: questionid });
		removeElementFromArrayBYID(emptydata, 0, setemptydata);
		setstatus("deleted!");
	}

	async function duplicateQuestion(indexSect, index) {
		setstatus("duplicating...");
		duplicateElementFromSectionBYIndex(index, "question", { indexSect: indexSect });
		removeElementFromArrayBYID(emptydata, 0, setemptydata);
		setstatus("duplicated!");
	}
	async function duplicateSection(indexSect) {
		setstatus("duplicating...");
		duplicateElementFromSectionBYIndex(indexSect, "section");
		removeElementFromArrayBYID(emptydata, 0, setemptydata);
		setstatus("duplicated!");
	}

	useEffect(async () => {
		// const setDimension = () => {
		// 	getDimension({
		// 		dynamicWidth: window.innerWidth,
		// 		dynamicHeight: window.innerHeight
		// 	});
		// };

		// window.addEventListener("resize", setDimension);
		LoadSurveyData();
		LoadDataStudy();
		await LoadDataCategories();
		LoadDataSections();
	}, [contract,tabIndex,api]);
	async function loadGraph() {
	}

	return (
		<>
			<div style={{ zoom: screenSize.dynamicWidth < 760 ? 0.8 : 1 }} className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex mb-2 items-center">
				<div onClick={() => navigate(-2)} className="flex items-center hover:cursor-pointer hover:underline decoration-gray-400">
					<p className="text-gray-400">Studys</p>
					<ChevronRightIcon className="mx-1 w-5 h-5 text-gray-400" />
				</div>
				<div onClick={() => navigate(-1)} className="flex items-center hover:cursor-pointer hover:underline decoration-gray-400">
					<p className="text-gray-400">{STUDY_DATA?.title}</p>
					<ChevronRightIcon className="mx-1 w-5 h-5 text-gray-400" />
				</div>
				<div className="flex items-center">
					<p className="text-gray-400">{SURVEY_DATA?.name}</p>
				</div>
			</div>
			<div className={`bg-white border border-gray-400 rounded-lg overflow-hidden mb-2`}>
				{screenSize.dynamicWidth < 760 ? (
					<>
						<div className="container-Survey-Template">
							<div className="Title-Template">
								<p className="font-semibold">{SURVEY_DATA?.name}</p>
							</div>
							<div className="description-Template">
								<p className="mt-6">{SURVEY_DATA?.description}</p>
							</div>
							<div className="Image-Box">
								<img src={SURVEY_DATA?.image} alt="Study" style={{ width: "8rem" }} className="object-cover" />
							</div>
							<div className="Next-Button">
								<div className="flex">
									<button
										onClick={() => {
											setModalShow(true);
										}}
										className="flex w-[62px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
									>
										<PencilIcon className="w-5 h-5 text-gray-400" />
									</button>
									<button id="surveyDelete" className="flex w-[62px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center mx-1 hover:bg-white">
										<TrashIcon className="w-5 h-5 text-gray-400" />
									</button>
								</div>
								<button onClick={addSection} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-700 hover:text-gray-500">
									<PlusSmIcon className="w-5 h-5 " />
									<p className=" ml-2">Section</p>
								</button>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="flex p-6">
							<img src={SURVEY_DATA?.image} alt="Survey" className="w-[128px] h-[128px] object-cover" />
							<div className="mx-8 flex-1">
								<p className="text-3xl font-semibold">{SURVEY_DATA?.name}</p>
								<p className="mt-6">{SURVEY_DATA?.description}</p>
							</div>
							<div className="flex">
								<button
									onClick={() => {
										setModalShow(true);
									}}
									className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
								>
									<PencilIcon className="w-5 h-5 text-gray-400" />
								</button>
								<button id="surveyDelete" className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center mx-1 hover:bg-white">
									<TrashIcon className="w-5 h-5 text-gray-400" />
								</button>
								<button onClick={addSection} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-700 hover:text-gray-500">
									<PlusSmIcon className="w-5 h-5 " />
									<p className=" ml-2">Section</p>
								</button>
							</div>
						</div>
					</>
				)}
			</div>
			<div className="bg-white border border-gray-400 rounded-lg flex mt-4 px-4">
				{TABS.map(({ id, title }, index) => {
					const IS_LAST = index === TABS.length - 1;
					const ACTIVE = index === tabIndex;

					return (
						<div key={id}>
							<div className="self-stretch w-[1px] bg-gray-400" />
							<button key={id} onClick={() => setTabIndex(index)} className={`flex items-center h-14 p-4 ${ACTIVE ? "bg-gray-100" : "bg-white"}`}>
								<p className={`${ACTIVE ? "text-orange-500" : "text-black"} font-medium`}>{title}</p>
							</button>
							{IS_LAST && <div className="self-stretch w-[1px] bg-gray-400" />}
						</div>
					);
				})}
			</div>
			{tabIndex === 0 && (
				<>
					{sectionsdata.map((item, index) => {
						const sectindex = index;
						return (
							<div key={item.id} htmlFor={item.id} className="bg-white border border-gray-400 rounded-lg flex flex-col mt-4">
								<div className="bg-gray-100 py-4 px-6 border-b border-b-gray-400">
									<div className="flex mb-4 items-center">
										<p className="text-2xl font-semibold">{`Section ${index + 1}`}</p>
										<span className="text-gray-600 flex-1 ml-2">{status}</span>
										<button
											id={`Trash-sectionid-${sectindex}`}
											sectionid={sectindex}
											sectionindexid={index}
											onClick={(e) => {
												deleteSection(index);
											}}
											className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
										>
											<TrashIcon className="w-5 h-5 text-gray-400" />
										</button>
										<button className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center ml-1">
											<DocumentDuplicateIcon className="w-5 h-5 text-gray-400" onClick={(e) => {
												duplicateSection(sectindex);
											}} />
										</button>
									</div>
									<label htmlFor={`category-select${sectindex}`} className="font-semibold mr-4">
										Category:
									</label>
									<div className={`flex ${screenSize.dynamicWidth < 800 ? "flex-column" : ""}`}>
										<Select
											className={`rounded-md  outline-none ${screenSize.dynamicWidth > 800 ? "w-1/3" : ""}`}
											name={`category${sectindex}`}
											id={`category-select${sectindex}`}
											placeholder="Select Category"
											onChange={(e) => {
												sectionsdata[index].category = e.value;
												setsectionsdata(sectionsdata);
											}}
											options={dataCategory}
											isSearchable={true}
											defaultValue={(e) => {
												return dataCategory.filter((element) => element["value"] === sectionsdata[index].category)[0];
											}}
											getOptionLabel={(e) => (
												<div style={{ display: "flex", alignItems: "center" }}>
													{e.icon}
													<span style={{ marginLeft: 5 }}>{e.text}</span>
												</div>
											)}
										/>
										<input type="text" className="border py-1 px-2" name="categoryName" placeholder="Category name" />
										<input type="text" className="border py-1 px-2" name="imagelink" placeholder="Image link" />
										<button
											onClick={(e) => {
												AddCategory(e, index);
											}}
											className={`flex h-11 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white ${screenSize.dynamicWidth > 800 ? " w-[52px]" : ""}`}
										>
											<PlusIcon className="w-5 h-5 text-gray-400" />
										</button>
									</div>
									<label htmlFor={`section-description${sectindex}`} className="font-semibold mr-4">
										Section Description:
									</label>
									<div>
										<textarea
											className="border py-1 px-2 w-full"
											onChange={(e) => {
												sectionsdata[index].description = e.target.value;
												removeElementFromArrayBYID(emptydata, 0, setemptydata);
											}}
											sectionid={item.id}
											defaultValue={item.description}
											placeholder="Description"
										/>
									</div>
								</div>
								{sectionsdata[index].questions.map((itemQuestions, indexQ) => {
									return (
										<div htmlFor={itemQuestions.id} key={itemQuestions.id} className="border-b border-b-gray-400 p-4">
											<div className="flex mb-2 items-center">
												<p className="text-2xl font-semibold flex-1">{`Question ${indexQ + 1}`}</p>
												<button
													onClick={(e) => {
														deleteQuestion(sectindex, indexQ);
													}}
													className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
												>
													<TrashIcon className="w-5 h-5 text-gray-400" />
												</button>
												<button
													onClick={(e) => {
														duplicateQuestion(sectindex, indexQ);
													}}
													className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center ml-1"
												>
													<DocumentDuplicateIcon className="w-5 h-5 text-gray-400" />
												</button>
											</div>
											<input
												type="text"
												onChange={(e) => {
													sectionsdata[index].questions[indexQ].question = e.target.value;
													setsectionsdata(sectionsdata);
												}}
												defaultValue={itemQuestions.question}
												questionid={itemQuestions.id}
												sectionid={index}
												className="border py-1 px-2 w-full"
												placeholder="What is your question?"
											/>

											<div className="flex flex-wrap justify-content-between mt-2">
												<select
													name={`questiontype${indexQ}`}
													defaultValue={itemQuestions.questiontype}
													onChange={(e) => {
														sectionsdata[index].questions[indexQ].questiontype = e.target.value;
														removeElementFromArrayBYID(emptydata, 0, setemptydata);

													}}
													sectionid={sectindex}
													questionid={itemQuestions.id}
													id={`questiontype${indexQ}`}
													className="h-10 px-1 rounded-md border border-gray-200 outline-none "
													style={{ width: screenSize.dynamicWidth < 800 ? "100%" : "49%", "fontFamily": "FontAwesome" }}
												>
													<option value="rating" className="fa-solid">
														&#xf118; Rating question
													</option>
													<option value="yes/no">&#xf058; Yes/no question</option>
													<option value="limited">&#xf0c9; Limited question</option>
													<option value="open">&#xf059; Open question</option>
												</select>

												{itemQuestions.questiontype === "rating" && <RatingAnswer item={itemQuestions} indexItem={indexQ} index={index} />}
												{itemQuestions.questiontype === "limited" && <AnswerTypeJSX item={itemQuestions} indexItem={indexQ} indexSect={index} />}
											</div>
										</div>
									);
								})}
								<div className="p-4 d-flex">
									<button sectionsid={sectindex} onClick={(e) => addQuestion(e, index)} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-700 hover:text-gray-500">
										<PlusSmIcon className="w-5 h-5" />
										<p className=" ml-2">Question</p>
									</button>
									<button onClick={(e) => SaveSection(e)} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-700 hover:text-gray-500">
										<p>Save</p>
									</button>
								</div>
							</div>
						);
					})}
				</>
			)}
			{tabIndex === 1 && (
				<>
					{sectionsdata.map((item, sectindex) => {
						return (
							<div key={item.id} htmlFor={item.id} className="bg-white border border-gray-400 rounded-lg flex flex-col mt-4 overflow-hidden">
								<div className="bg-gray-100 py-4 px-6 border-b border-b-gray-400">
									<div className="flex mb-4 items-center">
										<p className="text-2xl font-semibold flex-1">{`Section ${sectindex + 1}: ${item.category}`}</p>
									</div>
								</div>
								{sectionsQuestionsdata
									.filter((eq) => eq.sectionid === item.id)
									.map((item, index) => {
										return (
											<div key={item.id} className="border-b border-b-gray-400 p-4">
												<p className="text-xl font-semibold">{`Question ${index + 1}: ${item.question}`}</p>
												<div id={`section${sectindex}container${index}`}></div>
											</div>
										);
									})}
							</div>
						);
					})}
				</>
			)}
			<UpdateSurveyModal
				show={UpdatemodalShow}
				onHide={() => {
					setModalShow(false);
					LoadSurveyData();
				}}
				id={params.id}
			/>
		</>
	);
}

export default SurveyDetails;

