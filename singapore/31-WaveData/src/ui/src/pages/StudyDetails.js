import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRightIcon, UserIcon, CurrencyDollarIcon, GlobeAltIcon, ChevronRightIcon, PlusSmIcon, TrashIcon, DocumentDuplicateIcon, PencilIcon } from "@heroicons/react/solid";
import { formatDistance } from "date-fns";
import Form from "react-bootstrap/Form";
import "./StudyDetails.css";
import CreateSurveyModal from "../components/modal/CrateSurvey.jsx";
import useContract from "../services/useContract";
import { useDBContext } from "../contextx/DBContext.js";

import UpdateStudyModal from "../components/modal/UpdateStudy.jsx";
import ViewControbutiors from "../components/modal/ViewControbutiors.jsx";

function StudyDetails() {

	const params = useParams();
	const navigate = useNavigate();
	const {CreateSubject,UpdateSubject,base} = useDBContext();
	const { api, contract, signerAddress, sendTransaction, ReadContractValue, ReadContractByQuery, getMessage, getQuery } = useContract();
	const [tabIndex, setTabIndex] = useState(0);
	const [UpdatemodalShow, setModalShow] = useState(false);
	const [CreateSurveymodalShow, setSurveyModalShow] = useState(false);
	const [LoadingSurvey, setLoadingSurvey] = useState(false);
	const [LoadingInformed, setLoadingInformed] = useState(false);
	const [SelectedContributorId, setSelectedContributorId] = useState(0);
	const [Selected_ongoing_id, setSelected_ongoing_id] = useState(0);
	const [LoadingContributors, setLoadingContributors] = useState(false);
	const [screenSize, getDimension] = useState({
		dynamicWidth: window.innerWidth,
		dynamicHeight: window.innerHeight
	});

	const [agesData, setAgesData] = useState([]);

	const [emptydata, setemptydata] = useState([]);

	const [audiences, setAudiences] = useState([]);

	const [subjects, setSubjects] = useState([]);

	const [studyTitle, setStudyTitle] = useState({
		ages_ans: {}
	});

	const [data, setData] = useState([]);

	const [contributors, setContributors] = useState([]);

	let [STUDY_DATA, setSTUDY_DATA] = useState({});

	const TABS = [{ id: "settings", title: "Settings" }, { id: "informed-consent", title: "Informed Consent" }, { id: "surveys", title: "Surveys" }, { id: "clinical-outcome", title: "Clinical Outcomes" }, { id: "overview", title: "Overview" }];

	const TABLE_COLS = [{ id: "name", title: "Name" }, { id: "question", title: "Question" }, { id: "reward", title: "Reward" }, { id: "submission", title: "Submission" }, { id: "last submission", title: "Last submission" }];

	const Overview_COLS = [{ id: "id", title: "Participant No." }, { id: "date", title: "Registration Date" }, { id: "surveys", title: "Surveys" }, { id: "data", title: "Clinical Data" }, { id: "wearable", title: "Wearable Data" }, { id: "notification", title: "Notifications" }];

	const AUDIENCES_COLS = [{ id: "age_minimum", title: "Age minimum" }, { id: "age_maximum", title: "Age maximum" }, { id: "sex", title: "Sex" }];



	const addSurvey = () => {
		setSurveyModalShow(true);
	};
	const addAudiance = async () => {
		setAudiences((prevState) => [
			...prevState,
			{
				id: 0,
				ageMin: "",
				ageMax: "",
				race: "",
				sex: ""
			}
		]);
	};

	const addSubject = async () => {

		let ages_ans = {};
		for (let i = 0; i < agesData.length; i++) {
			const element = agesData[i];

			ages_ans[element.id] = {
				answer: "",
				type: "yes/no",
				limited: [],
				questiontype2: "",
				urlText: "",
				urlType: ""
			};
		}

		setSubjects((prevState) => [
			...prevState,
			{
				subject_id: -1,
				subject_index_id: Math.floor(Math.random() * Date.now()).toString(16),
				title: "",
				ages_ans: ages_ans
			}
		]);
	};
	async function UpdateAgesHandle(event) {
		DisableButton("AgeSave");
		await sendTransaction(api, signerAddress, "UpdateStudyAges", [Number(params.id), JSON.stringify(agesData)]);

		EnableButton("AgeSave");
	}

	async function CreateOrUpdateSubject(event, idx) {

		var SaveBTN = event.target;
		SaveBTN.classList.remove("hover:bg-gray-600");
		SaveBTN.classList.remove("bg-black");
		SaveBTN.classList.add("bg-gray-400");
		SaveBTN.classList.add("cursor-default");
		SaveBTN.disabled = true;

		let subject_data = subjects[idx];

		if (subject_data.subject_id === -1) {
			await CreateSubjectHandle(subject_data, idx);
		} else {
			await UpdateSubjectHandle(subject_data);
		}



		SaveBTN.disabled = false;
		SaveBTN.classList.add("hover:bg-gray-600");
		SaveBTN.classList.add("bg-black");
		SaveBTN.classList.remove("bg-gray-400");
		SaveBTN.classList.remove("cursor-default");
	}

	async function CreateSubjectHandle(subInfo, idx) {
		let subject_id = await CreateSubject(params.id, subInfo.subject_index_id, subInfo.title, JSON.stringify(subInfo.ages_ans));

		subjects[idx].subject_id = subject_id;
		updateState();
	}


	async function UpdateSubjectHandle(subInfo) {
		await UpdateSubject(subInfo.subject_id, subInfo.title, JSON.stringify(subInfo.ages_ans));

	}



	function DisableButton(buttonID) {
		var ButtonElm = document.getElementById(buttonID);
		ButtonElm.classList.remove("hover:bg-gray-600");
		ButtonElm.classList.remove("bg-black");
		ButtonElm.classList.add("bg-gray-400");
		ButtonElm.classList.add("cursor-default");

		ButtonElm.disabled = true;
	}
	function EnableButton(buttonID) {
		var ButtonElm = document.getElementById(buttonID);

		ButtonElm.disabled = false;
		ButtonElm.classList.add("hover:bg-gray-600");
		ButtonElm.classList.add("bg-black");
		ButtonElm.classList.remove("bg-gray-400");
		ButtonElm.classList.remove("cursor-default");
	}


	async function UpdateStudyTitleHandle() {
		DisableButton("StudyTitleSave");
		console.log("UpdateStudyTitleHandle");
		await sendTransaction(api, signerAddress, "CreateOrSaveStudyTitle", [Number(params.id), JSON.stringify(studyTitle.ages_ans)]);

		EnableButton("StudyTitleSave");
	}

	async function UpdateAudiences(event) {
		DisableButton("audienceSave");


		const createdObject = [];
		await audiences.forEach(async (element) => {
			createdObject.push({
				id: parseInt(element.id),
				AgeMin: Number(element.AgeMin),
				AgeMax: Number(element.AgeMax),
				Race: element.Race,
				Sex: element.Sex
			});
		});
		await sendTransaction(api, signerAddress, "UpdateAudience", [parseInt(params.id), JSON.stringify(createdObject)]);
		EnableButton("audienceSave");

	}
	async function UpdateRewarads(event) {
		event.preventDefault();
		const { rewardselect, rewardprice, totalspendlimit } = event.target;

		DisableButton("rewardsSave");

		try {
			await sendTransaction(api, signerAddress, "UpdateReward", [Number(parseInt(params.id)), rewardselect.value, (Number(rewardprice.value) * 1e18).toFixed(0), (parseInt(totalspendlimit.value)* 1e18).toFixed(0)]);
		} catch (error) {
			console.error(error);
		}

		EnableButton("rewardsSave");

	}

	async function removeElementFromArray(all, specific, seting) {
		seting([]);

		var storing = [];
		for (let index = 0; index < all.length; index++) {
			const element = all[index];
			if (index === specific) {
				continue;
			}
			storing.push(element);
		}

		seting(storing);
	}
	async function LoadStudyData() {


		let allAudiences = [];
		try {
			allAudiences = JSON.parse(await ReadContractByQuery(api, signerAddress, getQuery("_studyAudienceMap"), [Number(params.id)]));
		} catch (e) {
			allAudiences = [];
		}
		setAudiences(allAudiences)

		return allAudiences

	}
	async function LoadData() {

		if (contract !== null && api !== null) {
			setSTUDY_DATA({});
			let study_element = await ReadContractByQuery(api, signerAddress, getQuery("_studyMap"), [Number(params.id)]);


			let allAges = [];
			try {
				if (study_element.ages !== '[]')
					allAges = JSON.parse(study_element.ages);
			} catch (e) { }
			setAgesData(allAges)


			let allTitles = { ages_ans: {} };
			try {
				if (study_element.titles !== '[]')
					allTitles.ages_ans = JSON.parse(study_element.titles);
			} catch (e) { }

			setStudyTitle(allTitles)

			let allAudiences = await LoadStudyData()


			var newStudy = {
				id: Number(study_element.studyId),
				title: study_element.title,
				image: study_element.image,
				description: study_element.description,
				contributors: Number(study_element.contributors),
				audience: Number(allAudiences.length),
				budget: window.ParseBigNum(study_element.budget),
				reward_type: study_element.rewardType,
				reward_price: window.ParseBigNum(study_element.rewardPrice),
				total_spending_limit: window.ParseBigNum(study_element.totalSpendingLimit) 
			};
			setSTUDY_DATA(newStudy);
		}
	}


	async function LoadDataInformed() {
		const studyDataTable = base('study_subjects');
		const records = await studyDataTable.select({
			filterByFormula: `{study_id} = '${params.id}'`
		}).firstPage();


		let new_subjects = [];
		for (let i = 0; i < records.length; i++) {
			let element = records[i].fields;
			element['ages_ans'] = JSON.parse(element['ages_ans']);
			element['subject_id'] = records[i].id;
			new_subjects.push(element);
		}
		setSubjects(new_subjects);
	}



	function RatingAnswer({ item, indexItem, index }) {
		return (
			<>
				<div className={`bg-white ${screenSize.dynamicWidth < 800 ? "" : ""}`} style={{ width: screenSize.dynamicWidth < 800 ? "100%" : "49%" }} id={`AnswerType${indexItem}`}>
					<select
						id="testID"
						defaultValue={item.questiontype2}
						onChange={(e) => {
							subjects[index].ages_ans[indexItem].questiontype2 = e.target.value;
							updateState();
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

	async function DeleteLimitedAnswer(indexSect, questionid, index) {
		removeElementFromElementBYIndex(index, "LimitedQuestions", { indexSect: indexSect, indexQuestion: questionid });
		removeElementFromArrayBYID(emptydata, 0, setemptydata);
	}

	async function AddLimitedAnswer(e, item, indexSect, indexItem) {

		var AddLimitedBTN = e.currentTarget;
		AddLimitedBTN.classList.remove("hover:bg-white");
		AddLimitedBTN.classList.add("bg-gray-300");
		AddLimitedBTN.classList.add("cursor-default");
		AddLimitedBTN.disabled = true;
		subjects[indexSect].ages_ans[(indexItem)].limited.push({ answer: "" });

		removeElementFromArrayBYID(emptydata, 0, setemptydata);
		AddLimitedBTN.classList.add("hover:bg-white");
		AddLimitedBTN.classList.remove("bg-gray-300");
		AddLimitedBTN.classList.remove("cursor-default");
		AddLimitedBTN.disabled = false;
	}

	function AnswerTypeJSX({ item, indexSect, indexItem }) {
		function Allanswer({ item, indexSect }) {
			var all = [];
			subjects[indexSect].ages_ans[indexItem].limited.map((itemQuestions, index) => {
				all.push(
					<div key={index} style={{ display: "flex", width: screenSize.dynamicWidth < 800 ? "100%" : "49%", alignItems: "center", fontSize: 19, justifyContent: "space-between" }} className="mb-3">
						<span style={{ fontWeight: 700, minWidth: "fit-content" }} className="mr-2">
							Answer {index + 1}
						</span>
						<input
							onKeyUp={(e) => {
								subjects[indexSect].ages_ans[indexItem].limited[index].answer = e.target.value;
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

						<button onClick={(e) => AddLimitedAnswer(e, item, indexSect, indexItem)} className="h-10 mb-3 rounded-md border-solid border bg-gray-100 flex py-2 px-4 items-center text-gray-700 hover:bg-white">
							<PlusSmIcon className="w-5 h-5 " />
							<p className="ml-2"> Answer</p>
						</button>
					</div>
				</div>
			</>
		);
	}

	async function isSurveyCompleted(user_id, survey_id) {
		// let completed_survey_tables = base("completed_surveys");
		// let all_completed_surveys = await (completed_survey_tables.select({ filterByFormula: "{study_id} = '" + params.id + "'" })).firstPage()

		// for (let i = 0; i < all_completed_surveys.length; i++) {
		// 	let completed_survey_element = all_completed_surveys[i].fields;
		// 	if ((completed_survey_element.survey_id) === (survey_id) && user_id === completed_survey_element.user_id) {
		// 		return true;
		// 	}

		// }
		return false;
	}

	async function LoadDataSurvey(contributes = null) {
		if (contract !== null && api !== null) {
			if (!LoadingSurvey) {
				if (contributes === null) contributes = contributors;
				setLoadingSurvey(true);
				let survey_data = []
				setData([]);
				const totalSurveys = await ReadContractByQuery(api, signerAddress, getQuery("_SurveyIds"));

				try {
					for (let i = 0; i < Number(totalSurveys); i++) {
						let survey_element = await ReadContractByQuery(api, signerAddress, getQuery("_surveyMap"), [i]);

						var new_survey = {
							id: Number(survey_element.surveyId),
							study_id: Number(survey_element.studyId),
							user_id: Number(survey_element.userId),
							name: survey_element.name,
							description: survey_element.description,
							date: survey_element.date,
							image: survey_element.image,
							reward: window.ParseBigNum(survey_element.reward),
							submission: Number(survey_element?.submission),
							completed: {

							}
						};
						if (parseInt(params.id) === new_survey.study_id) {
							for (let iC = 0; iC < contributes.length; iC++) {
								const element = contributes[iC];
								new_survey.completed[element.user_id] = await isSurveyCompleted(element.user_id, new_survey.id);
							}
							survey_data.push(new_survey);
						}
					}
				} catch (ex) { }

				setData(survey_data);
				setLoadingSurvey(false);
			}
		}
	}

	async function LoadDataContributors() {
		if (contract !== null && api !== null) {
			setLoadingContributors(true);
			setContributors([]);
			let arr = [];

			const totalOngoing = await ReadContractByQuery(api, signerAddress, getQuery("_OngoingIds"));

			for (let i = 0; i < Number(totalOngoing); i++) {
				let element = await ReadContractByQuery(api, signerAddress, getQuery("_ongoingMap"), [parseInt(i)]);
				let user_element = await ReadContractByQuery(api, signerAddress, getQuery("getUserDetails"), [Number(element.userId)]);
				let fhir_element = await ReadContractByQuery(api, signerAddress, getQuery("_fhirMap"), [Number(user_element[6])]);

				if (Number(element.studyId) === parseInt(params.id)) {
					arr.push({
						id: i,
						user_id: Number(element.userId),
						name: user_element[2],
						family_name: fhir_element.familyName,
						givenname: fhir_element.givenName,
						identifier: fhir_element.identifier,
						phone: fhir_element.phone,
						gender: fhir_element.gender,
						about: fhir_element.about,
						patient_id: fhir_element.patientId,
						joined: element.date
					})

				}
			}
			setContributors(arr);
			setLoadingContributors(false);

			return arr;
		}
		return []

	}

	async function AddAge() {
		setAgesData((prevState) => [
			...prevState,
			{

				id: Math.floor(Math.random() * Date.now()).toString(16),
				from: 0,
				to: 0,
				older: false
			}
		]);
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

	}
	async function updateState() {
		removeElementFromArrayBYID(emptydata, 0, setemptydata);
	}

	function getAgesPlaceholder(from, to, older) {
		if (!older) {
			if (from === 0) {
				return `children upto ${to} years`
			}
			return `${from}-${to} years`
		} else {
			return `${from} years and older`
		}
	}

	async function removeElementFromElementBYIndex(specificid, type = "age", args = {}) {
		var storing = [];
		if (type === "age") {
			for (let index = 0; index < agesData.length; index++) {
				const element = agesData[index];
				if (index === specificid) {
					continue;
				}
				storing.push(element);
			}
			setAgesData(storing);
			return;
		}

		if (type === "subject") {
			for (let index = 0; index < subjects.length; index++) {
				const element = subjects[index];
				if (index === specificid) {
					continue;
				}
				storing.push(element);
			}
			setSubjects(storing);
			return;
		}
		if (type === "LimitedQuestions") {
			/*
		 args = {
			indexSect : 0,
			indexQuestion : 0
		 }
		 */
			for (let index = 0; index < subjects[args.indexSect].ages_ans[args.indexQuestion].limited.length; index++) {
				const element = subjects[args.indexSect].ages_ans[args.indexQuestion].limited[index];
				if (index === specificid) {
					continue;
				}
				storing.push(element);
			}
			subjects[args.indexSect].ages_ans[args.indexQuestion].limited = storing;
			return;
		}

	}

	async function duplicateElementFromElementBYIndex(specificid, type = "age", args = {}) {
		var storing = [];
		let found = 0;
		if (type === "age") {
			for (let index = 0; index < agesData.length; index++) {
				const element = agesData[index];
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
			setAgesData(storing);
			return;
		}

		if (type === "subject") {
			for (let index = 0; index < subjects.length; index++) {
				const element = subjects[index];
				if (index === specificid) {
					storing.push(element);
					found = 1;
				}
				var element2 = structuredClone(element);

				if (found === 1) {
					element2.subject_id = -1;
					element2.subject_index_id = Math.floor(Math.random() * Date.now()).toString(16);
				}
				storing.push(element2);
			}
			setSubjects(storing);
			return;
		}

	}

	async function loadOverview() {
		let contributes = await LoadDataContributors();
		LoadDataSurvey(contributes);
	}
	useEffect(() => {
		// const setDimension = () => {
		// 	getDimension({
		// 		dynamicWidth: window.innerWidth,
		// 		dynamicHeight: window.innerHeight
		// 	});
		// };

		// window.addEventListener("resize", setDimension);
		LoadData();
	}, [contract, api]);

	useEffect(() => {
		if (tabIndex === 4) {
			loadOverview();
		} else if (tabIndex === 1) {
			LoadDataInformed();
		} else if (tabIndex === 2) {
			LoadDataSurvey();
		} else if (tabIndex === 0) {
			LoadStudyData();
		}
	}, [tabIndex, api]);
	return (
		<>
			<div style={{ zoom: screenSize.dynamicWidth < 760 ? 0.8 : 1 }} className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex mb-2 items-center">
				<div onClick={() => navigate(-1)} className="flex items-center hover:cursor-pointer hover:underline decoration-gray-400">
					<p className="text-gray-400">Studies</p>
					<ChevronRightIcon className="mx-1 w-5 h-5 text-gray-400" />
				</div>
				<div className="flex items-center">
					<p className="text-gray-400">{STUDY_DATA?.title}</p>
				</div>
			</div>
			<div className={`bg-white border border-gray-400 rounded-lg overflow-hidden mb-2`}>
				{screenSize.dynamicWidth < 760 ? (
					<>
						<div className="container-Study-Template">
							<div className="Title-Template">
								<p className="font-semibold">{STUDY_DATA?.title}</p>
							</div>
							<div className="description-Template">
								<p className="mt-6">{STUDY_DATA?.description}</p>
							</div>
							<div className="Image-Box">
								<img src={STUDY_DATA?.image} alt="Study" style={{ width: "8rem" }} className="object-cover" />
							</div>
							<div className="Next-Button">
								<button
									onClick={() => {
										setModalShow(true);
									}}
									className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center"
								>
									<PencilIcon className="w-5 h-5 text-gray-400" />
								</button>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="flex p-6">
							<img src={STUDY_DATA?.image} alt="Study" className="object-cover max-w-xs" />
							<div className="mx-8 flex-1">
								<p className="text-3xl font-semibold">{STUDY_DATA?.title}</p>
								<p className="mt-6">{STUDY_DATA?.description}</p>
							</div>
							<button
								onClick={() => {
									setModalShow(true);
								}}
								className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center"
							>
								<PencilIcon className="w-5 h-5 text-gray-400" />
							</button>
						</div>
					</>
				)}

				<div className="flex p-6 border-t border-t-gray-400 bg-gray-200">
					<div className="flex items-center">
						<UserIcon className="w-5 h-5 text-gray-500" />
						{screenSize.dynamicWidth > 760 ? (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${STUDY_DATA?.contributors} contributor(s)`}</p>
							</>
						) : (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${STUDY_DATA?.contributors}`}</p>
							</>
						)}
					</div>
					<div className="flex items-center ml-6">
						<GlobeAltIcon className="w-5 h-5 text-gray-500" />
						{screenSize.dynamicWidth > 760 ? (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${audiences.length} audience(s)`}</p>
							</>
						) : (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${audiences.length}`}</p>
							</>
						)}
					</div>
					<div className="flex items-center ml-6">
						<CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
						{screenSize.dynamicWidth > 760 ? (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`Budget of ${STUDY_DATA?.budget} ${STUDY_DATA?.reward_type}`}</p>
							</>
						) : (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${STUDY_DATA?.budget} ${STUDY_DATA?.reward_type}`}</p>
							</>
						)}
					</div>
				</div>
			</div>
			<div className="bg-white border border-gray-400 rounded-lg flex mt-4">
				{TABS.map(({ id, title }, index) => {
					const IS_LAST = index === TABS.length - 1;
					const ACTIVE = index === tabIndex;

					return (
						<div key={index}>
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
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex items-center">
							<h2 className="text-2xl font-semibold flex-1">Audiences</h2>
							<button onClick={() => addAudiance()} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600">
								<PlusSmIcon className="w-5 h-5 text-white" />
								<p className="text-white ml-2">Audience</p>
							</button>
						</div>
						<table >
							<thead className="border-b border-b-gray-400">
								<tr>
									<th className="py-3 px-3">#</th>
									{AUDIENCES_COLS.map(({ id, title }) => {
										return (
											<th key={id} className="text-left font-normal py-3 px-3">
												{title}
											</th>
										);
									})}
									<th className="py-3 px-3" />
								</tr>
							</thead>
							<tbody>
								{audiences.map((item, index) => {
									const IS_LAST = index === audiences.length - 1;
									return (
										<tr key={index} className={`border-b-gray-400 ${!IS_LAST ? "border-b" : "border-0"}`}>
											<td className="flex py-3 px-3 items-center h-[72.5px]">{index + 1}</td>
											<td className="py-3 px-3">
												<input
													type="text"
													style={{ width: screenSize.dynamicWidth < 760 ? "7rem" : "100%" }}
													id="age-min"
													onChange={(e) => {
														audiences[index].AgeMin = e.target.value;
													}}
													name="age-min"
													defaultValue={item.AgeMin}
													className="mt-2 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400"
												/>
											</td>
											<td className="py-3 px-3">
												<input
													type="text"
													style={{ width: screenSize.dynamicWidth < 760 ? "7rem" : "100%" }}
													id="age-max"
													name="age-max"
													onChange={(e) => {
														audiences[index].AgeMax = e.target.value;
													}}
													defaultValue={item.AgeMax}
													className="mt-2 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400"
												/>
											</td>

											<td className="py-3 px-3" style={{ minWidth: "10rem" }}>
												<select
													name={`gender${index}`}
													id={`gender-select${index}`}
													onChange={(e) => {
														audiences[index].Sex = e.target.value;
													}}
													className="h-10 px-1 rounded-md border border-gray-200 outline-none w-full"
													defaultValue={item.Sex}
												>
													<option value="">Select a sex</option>
													<option value="male">Male</option>
													<option value="female">Female</option>
													<option value="everyone">Everyone</option>
												</select>
											</td>
											<td className="flex justify-end items-center h-[72.5px] py-3">
												<button
													onClick={(e) => {
														removeElementFromArray(audiences, index, setAudiences);
													}}
													className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
												>
													<TrashIcon className="w-5 h-5 text-gray-400" />
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
						<div className="flex mt-1 items-center">
							<h2 className="text-2xl font-semibold flex-1"></h2>
							<button id="audienceSave" className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600" onClick={UpdateAudiences}>
								Save
							</button>
						</div>
					</div>
					<Form onSubmit={UpdateRewarads} className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex flex-col">
							<h2 className="text-2xl font-semibold flex-1">Reward</h2>
							<div>
								<h4>Reward per survey</h4>
								<div className="flex gap-8 items-center ">
									<select name="rewardselect" value={STUDY_DATA?.reward_type ? STUDY_DATA?.reward_type : ""}
										onChange={(e) => { STUDY_DATA.reward_type = e.target.value; removeElementFromArrayBYID(emptydata, 0, setemptydata); }}

										id="rewardselect" className="mt-1 h-10 px-2 rounded-md border border-gray-200 outline-none w-6/12">
										<option value="">Select a reward</option>
										<option value="SBY">SBY</option>
									</select>
									<label className="flex flex-col font-semibold mt-1 w-6/12">
										<input
											type="text"
											value={STUDY_DATA?.reward_price ? `${STUDY_DATA?.reward_price}` : "0"}
											onChange={(e) => { STUDY_DATA.reward_price = e.target.value; removeElementFromArrayBYID(emptydata, 0, setemptydata); }}
											id="rewardprice"
											name="rewardprice"
											className="mt-1 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400 "
											placeholder="0"
										/>
									</label>
								</div>
							</div>
							<div>
								<h4>Total spending limit</h4>
								<div className="flex gap-8 justify-between items-center ">
									<label style={{ width: "47%" }} className="flex flex-col font-semibold mt-1">
										<input
											type="text"
											value={STUDY_DATA?.total_spending_limit ? `${STUDY_DATA?.total_spending_limit}` : "0"}
											onChange={(e) => { STUDY_DATA.total_spending_limit = e.target.value; removeElementFromArrayBYID(emptydata, 0, setemptydata); }}
											id="totalspendlimit"
											name="totalspendlimit"
											className="mt-1 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400 "
											placeholder="0"
										/>
									</label>
									<button type="submit" id="rewardsSave" className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600">
										Save
									</button>
								</div>
							</div>
						</div>
					</Form>


				</>
			)}


			{tabIndex === 1 && (
				<>
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex items-center">
							<h2 className="text-2xl font-semibold flex-1">Informed Consent</h2>
						</div>
					</div>
					<div className="bg-white border border-gray-400 rounded-lg flex flex-col mt-4">
						<div className="bg-gray-100 py-4 px-6 border-b border-b-gray-400">
							<h1 className="text-lg mb-2 font-semibold flex-1">Ages Groups</h1>
							<div className="">
								<>
									{agesData.map(({ id, from, to, older }, index) => {
										return (
											<div className="flex mb-2 gap-5 items-center" key={id}>
												<div className="flex items-center w-full">
													<div className="flex gap-5 align-items-center" >
														From
														<input
															type="number"
															className="border py-1 px-2 w-75"
															onInput={(e) => { agesData[index].from = Number(e.target.value); updateState(); }}
															defaultValue={from}
															min={0}
														/>
													</div>
													<div className={`flex gap-5 align-items-center ${agesData[index].older ? "d-none" : ""}`}>
														To
														<input
															type="number"
															onInput={(e) => { agesData[index].to = Number(e.target.value); updateState(); }}
															className="border py-1 px-2 w-75"
															defaultValue={to}
															min={0}
														/>
													</div>
													<div className="flex gap-2">
														<input type="checkbox" onChange={(e) => { agesData[index].older = e.target.checked; updateState(); }} checked={agesData[index].older} /> Older
													</div>
												</div>
												<div className="flex">
													<button
														id={`Trash`}
														onClick={() => { removeElementFromElementBYIndex(index, "age") }}
														className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
													>
														<TrashIcon className="w-5 h-5 text-gray-400" />
													</button>
													<button onClick={() => { duplicateElementFromElementBYIndex(index, "age") }} className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center ml-1 hover:bg-white">
														<DocumentDuplicateIcon className="w-5 h-5 text-gray-400" />
													</button>
												</div>
											</div>
										);
									})}
								</>
							</div>
						</div>

						<div className="p-4 gap-2 d-flex">
							<button onClick={() => { AddAge() }} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center">
								<PlusSmIcon className="w-5 h-5 text-white" />
							</button>
							<button id="AgeSave" onClick={(e) => { UpdateAgesHandle(e) }} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-700 hover:text-gray-500">
								Save
							</button>

						</div>
					</div>


					<div className="bg-white border border-gray-400 rounded-lg flex flex-col mt-4">
						<div className="bg-gray-100 py-4 px-6 border-b border-b-gray-400">

							<div className="">

								<div className="mb-2 flex gap-5">
									<h1 className="text-lg mb-2 font-semibold flex-1">Title of the study</h1>

								</div>
								<>
									{agesData.map(({ id, from, to, older }, index) => {
										return (

											<div className="flex mb-2 gap-5 items-center" key={id}>
												<div className="flex items-center w-full">
													<textarea
														className="border py-1 px-2 w-full"
														placeholder={getAgesPlaceholder(from, to, older)}
														onChange={(e) => {
															studyTitle.ages_ans[id] = e.target.value;
															removeElementFromArrayBYID(emptydata, 0, setemptydata);
														}}
														value={(studyTitle?.ages_ans[id] != null ? studyTitle?.ages_ans[id] : "")}
													></textarea>
												</div>

											</div>
										);
									})}
								</>

							</div>
						</div>

						<div className="p-4 gap-2 d-flex">

							<button onClick={() => { UpdateStudyTitleHandle() }} id="StudyTitleSave" className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-700 hover:text-gray-500">
								Save
							</button>

						</div>
					</div>


					{subjects.map(({ subject_id, subject_index_id, title, orderby, ages_ans }, idx) => {
						return <div key={subject_index_id} className="bg-white border border-gray-400 rounded-lg flex flex-col mt-4">
							<div className="bg-gray-100 py-4 px-6 border-b border-b-gray-400">

								<div className="">

									<div className="mb-2 flex gap-5">
										<input
											className="border py-1 px-2 w-full"

											placeholder="Information before consent"
											value={title}
											onChange={(e) => {
												subjects[idx].title = e.target.value;
												removeElementFromArrayBYID(emptydata, 0, setemptydata);
											}}
										/>
										<div className="flex">
											<button
												id={`Trash`}
												onClick={() => {
													removeElementFromElementBYIndex(idx, "subject")
												}}
												className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
											>
												<TrashIcon className="w-5 h-5 text-gray-400" />
											</button>
											<button onClick={(e) => {
												duplicateElementFromElementBYIndex(idx, "subject")
											}} className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center ml-1 hover:bg-white">
												<DocumentDuplicateIcon className="w-5 h-5 text-gray-400" />
											</button>
										</div>
									</div>
									<>
										{agesData.map(({ id, from, to, older }, index) => {
											return (

												<div className="border flex flex-wrap gap-2 mb-3 mt-3 p-3 position-relative" key={id}>
													<div className="d-flex w-full">
														<div className="w-75">
															<input
																className="border py-1 px-2 w-full"
																onChange={(e) => {
																	subjects[idx].ages_ans[id].urlText = e.target.value;
																	removeElementFromArrayBYID(emptydata, 0, setemptydata);
																}}
																value={subjects[idx].ages_ans[id].urlText}
																placeholder="Image or Video url"
															/>
														</div>
														<div className="align-items-center d-flex gap-5 ml-2">
															<div>
																<input type="radio" value="none"
																	onChange={(e) => {
																		subjects[idx].ages_ans[id].urlType = e.target.value;
																		removeElementFromArrayBYID(emptydata, 0, setemptydata);
																	}}
																	name={"urlType" + idx + id} checked={subjects[idx].ages_ans[id].urlType === "none"} /> None
															</div>
															<div>
																<input type="radio" value="image"
																	onChange={(e) => {
																		subjects[idx].ages_ans[id].urlType = e.target.value;
																		removeElementFromArrayBYID(emptydata, 0, setemptydata);
																	}}
																	name={"urlType" + idx + id} checked={subjects[idx].ages_ans[id].urlType === "image"} /> Image
															</div>
															<div>
																<input type="radio" value="video"
																	onChange={(e) => {
																		subjects[idx].ages_ans[id].urlType = e.target.value;
																		removeElementFromArrayBYID(emptydata, 0, setemptydata);
																	}}
																	name={"urlType" + idx + id} checked={subjects[idx].ages_ans[id].urlType === "video"} /> Video
															</div>
														</div>
													</div>




													<div style={{ top: '-14px' }} className="bg-gray-100 position-absolute text-gray-400">{getAgesPlaceholder(from, to, older)}</div>
													<div className="flex items-center w-75">
														<textarea
															className="border py-1 px-2 w-full"
															onChange={(e) => {
																subjects[idx].ages_ans[id].answer = e.target.value;
																removeElementFromArrayBYID(emptydata, 0, setemptydata);
															}}
															value={subjects[idx].ages_ans[id].answer}
															placeholder={getAgesPlaceholder(from, to, older)}
														> </textarea>
													</div>
													<div className="flex items-center w-56">
														<select
															onChange={(e) => {
																subjects[idx].ages_ans[id].type = e.target.value;
																removeElementFromArrayBYID(emptydata, 0, setemptydata);
															}}
															value={subjects[idx].ages_ans[id].type}
															className="h-10 px-1 rounded-md border w-full border-gray-200 outline-none "
															style={{ "fontFamily": "FontAwesome" }}
														>
															<option value="prev/next">&#8646; Prev/Next Button</option>

															<option value="rating" className="fa-solid">
																&#xf118; Rating question
															</option>
															<option value="yes/no">&#xf058; Yes/no question</option>
															<option value="limited">&#xf0c9; Limited question</option>
															<option value="open">&#xf059; Open question</option>
															<option value="upload">&#xf093; Image Upload</option>


														</select>

													</div>


													{subjects[idx].ages_ans[id].type === "rating" && <RatingAnswer item={subjects[idx].ages_ans[id]} indexItem={id} index={idx} />}
													{subjects[idx].ages_ans[id].type === "limited" && <AnswerTypeJSX item={subjects[idx].ages_ans[id]} indexItem={id} indexSect={idx} />}

												</div>
											);
										})}
									</>

								</div>
							</div>

							<div className="p-4 gap-2 d-flex">

								<button id="SubjectSave" onClick={(e) => { CreateOrUpdateSubject(e, idx) }} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-700 hover:text-gray-500">
									Save
								</button>

							</div>
						</div>
					})}
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex items-center">
							<h2 className="text-2xl font-semibold flex-1">Questions and Answers</h2>
							<button onClick={() => { addSubject() }} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center">
								<PlusSmIcon className="w-5 h-5 text-white" />
								<p className="text-white ml-2">Create</p>
							</button>
						</div>
					</div>
				</>
			)}
			{tabIndex === 2 && (
				<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
					<div className="flex items-center">
						<h2 className="text-2xl font-semibold flex-1">Surveys</h2>
						<button onClick={addSurvey} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center">
							<PlusSmIcon className="w-5 h-5 text-white" />
							<p className="text-white ml-2">Survey</p>
						</button>
					</div>
					<table>
						<thead className="border-b border-b-gray-400">
							<tr>
								{TABLE_COLS.map(({ id, title }) => {
									return (
										<th key={id} className="text-left font-normal py-3 px-3">
											{title}
										</th>
									);
								})}
								<th className="py-3 px-3" />
							</tr>
						</thead>
						<tbody>
							{data.length != 0 ? (
								<>
									{data.map(({ id, name, description, reward, submission, date, image }, index) => {
										const IS_LAST = index === data.length - 1;
										return (
											<tr key={id} className={`border-b-gray-400 ${!IS_LAST ? "border-b" : "border-0"}`}>
												<td className="py-3 px-3">
													<div style={{ display: "flex", alignItems: "center", flexDirection: "column", zoom: "0.8", minWidth: "9rem" }}>
														<img src={image} style={{ width: 50, height: 50, borderRadius: 5 }} />
														<span style={{ paddingLeft: 15 }}>{name.slice(0, 15)}</span>
													</div>
												</td>
												<td className="py-3 px-3" style={{ minWidth: "20rem" }}>
													{description.slice(0, 100)}...
												</td>
												<td className="py-3 px-3" style={{ minWidth: "8rem" }}>{`${reward} SBY`}</td>
												<td className="py-3 px-3">{`${Number(submission)}/24`}</td>
												<td className="py-3 px-3">{date && !isNaN(new Date(date).getTime()) ? formatDistance(new Date(date), new Date(), { addSuffix: true }) : "-"}</td>
												<td className="flex justify-end py-3">
													<button
														onClick={() => navigate(`/studies/${STUDY_DATA.id}/survey/${id}`, { state: { studyID: STUDY_DATA.id } })}
														className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
													>
														<ArrowRightIcon className="w-5 h-5 text-gray-400 " />
													</button>
												</td>
											</tr>
										);
									})}
								</>
							) : screenSize.dynamicWidth > 760 ? (
								LoadingSurvey === true ? (
									<tr>
										<td colSpan={6}>
											<p className="alert alert-info font-semibold text-3xl text-center">Loading...</p>
										</td>
									</tr>
								) : (
									<tr>
										<td colSpan={6}>
											<p className="alert alert-info font-semibold text-3xl text-center">No Surveys</p>
										</td>
									</tr>
								)
							) : (
								<></>
							)}
						</tbody>
					</table>
					{screenSize.dynamicWidth < 760 && data.length === 0 ? LoadingSurvey === true ? <p className="alert-info font-semibold text-center">Loading...</p> : <p className="alert-info font-semibold text-center">No Surveys</p> : <></>}
				</div>
			)}


			{tabIndex === 4 && (
				<>
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex items-center">
							<h2 className="text-2xl font-semibold flex-1">Overview</h2>
						</div>
						<table>
							<thead className="border-b border-b-gray-400">
								<tr>
									{Overview_COLS.map(({ id, title }) => {
										return (
											<th key={id} className="text-left font-normal py-3 px-3">
												{title}
											</th>
										);
									})}
								</tr>
							</thead>

							<tbody>
								{contributors.length != 0 ? (
									<>
										{contributors.map(({ id, user_id, joined }, index) => {
											const IS_LAST = index === data.length - 1;
											return (
												<tr key={id} className={`border-b-gray-400 ${!IS_LAST ? "border-b" : "border-0"}`}>
													<td className="py-3 px-3">{index + 1}</td>
													<td className="py-3 px-3">{joined ? formatDistance(new Date(joined), new Date(), { addSuffix: true }) : "-"}</td>
													<td className="py-3 px-3">
														<div className="flex flex-wrap gap-2">
															{data.map((item, idx) => {
																return <div key={idx} className={"survey-tag " + `${item.completed[user_id] === true ? "completed" : "not-completed"}`}>
																	{item.name}
																</div>
															})}
														</div>


													</td>
													<td className="py-3 px-3"></td>
													<td className="py-3 px-3">
														<div className="flex flex-wrap gap-2">
															<div className={"wearable-tag "}>Heart Rate</div>
														</div>

													</td>
													<td className="py-3 px-3">
														<img src="https://assets.yourlifechoices.com.au/2022/11/21150356/alarm-symbols.jpg" width={40} height={40} />
													</td>
												</tr>
											);
										})}
									</>
								) : screenSize.dynamicWidth > 760 ? (
									LoadingContributors === true ? (
										<tr>
											<td colSpan={6}>
												<p className="alert alert-info font-semibold text-3xl text-center">Loading...</p>
											</td>
										</tr>
									) : (
										<tr>
											<td colSpan={6}>
												<p className="alert alert-info font-semibold text-3xl text-center">No Contributors</p>
											</td>
										</tr>
									)
								) : (
									<></>
								)}
							</tbody>
						</table>
					</div>
				</>


			)}



			<UpdateStudyModal
				show={UpdatemodalShow}
				onHide={() => {
					setModalShow(false);
					LoadData();
				}}
				id={params.id}
			/>
			<CreateSurveyModal
				show={CreateSurveymodalShow}
				onHide={() => {
					setSurveyModalShow(false);
					LoadDataSurvey();
				}}
				Studyid={params.id}
			/>
		</>
	);
}

export default StudyDetails;

