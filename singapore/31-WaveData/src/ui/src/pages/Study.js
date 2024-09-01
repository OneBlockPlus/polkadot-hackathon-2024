import { PlusSmIcon, ArrowRightIcon, UserIcon, CurrencyDollarIcon, GlobeAltIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import CreateStudyModal from "../components/modal/CreateStudy.jsx";
import { useDBContext } from '../contextx/DBContext.js'
import useContract from "../services/useContract";
import "./Study.css";

let isLoadingData = false;
function Studies() {
	const [data, setData] = useState([]);
	const [CreatemodalShow, setModalShow] = useState(false);
	const [Loading, setLoading] = useState(true);
	const {  api,contract, signerAddress, ReadContractValue,ReadContractByQuery,getMessage,getQuery } = useContract();
	const { base } = useDBContext();
	const addStudy = () => {
		setModalShow(true);
	};

	const [screenSize, getDimension] = useState({
		dynamicWidth: window.innerWidth,
		dynamicHeight: window.innerHeight
	});

	async function LoadData() {
		if (!isLoadingData && contract !=null) {
			isLoadingData = true;
			setLoading(true);

			const totalStudys = await ReadContractByQuery(api,signerAddress, getQuery("_StudyIds"))
    
			let arr = [];
			for (let i = 0; i < Number(totalStudys); i++) {
				let study_element = await ReadContractByQuery(api,signerAddress, getQuery("_studyMap"),[i])
				let allAudiences = [];
				try {
					allAudiences = JSON.parse( await ReadContractByQuery(api,signerAddress, getQuery("_studyAudienceMap"),[i]) );
				} catch (e) {}
				var newStudy = {
					id: Number(study_element.studyId),
					title: study_element.title,
					image: study_element.image,
					description: study_element.description,
					contributors: Number(study_element.contributors),
					audience: Number(allAudiences.length),
					budget: window.ParseBigNum(study_element.budget) ,
					rewardtype: study_element.rewardType
				};
				arr.push(newStudy)
			}

			setData(arr);
			isLoadingData = false;
			setLoading(false);
		}

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
	}, [contract]);

	return (
		<>
			<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex mb-2 items-center">
				<h1 className="text-2xl m-0  font-semibold flex-1 text-gray-500">Study Overview</h1>
				<button onClick={addStudy} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center">
					<p className="text-white ml-2">Add Study</p>
				</button>
			</div>
			{data.length !=0 ? (
				<>
					{data.map(({ id, title, image, description, contributors, audience, budget, rewardtype }, index) => {
						const IS_LAST = index + 1 ===data.length;
						return (
							<div key={index} className={`bg-white border border-gray-400 rounded-lg study-container overflow-hidden ${!IS_LAST && "mb-2"}`}>
								<div className="flex p-6">
									<img src={image} alt="Study" className="w-[128px] h-[128px] object-cover max-w-xs" />
									<div className="mx-8 flex-1">
										<p className="text-xl font-semibold">{title}</p>
										<p className="mt-6">{`${screenSize.dynamicWidth < 800 ? description.slice(0, 100) : description.slice(0, 180)}...`}</p>
									</div>
									<button onClick={() => (window.location.href = `/studies/${id}`)} className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center">
										<ArrowRightIcon className="w-5 h-5 text-gray-400" />
									</button>
								</div>
								<div className="flex p-6 border-t border-t-gray-400 bg-gray-200">
									<div className="flex items-center">
										<UserIcon className="w-5 h-5 text-gray-500" />
										{screenSize.dynamicWidth > 760 ? <p className="text-gray-500 font-semibold ml-1">{`${contributors} contributor(s)`}</p> : <p className="text-gray-500 font-semibold ml-1">{`${contributors}`}</p>}
									</div>
									<div className="flex items-center ml-6">
										<GlobeAltIcon className="w-5 h-5 text-gray-500" />
										{screenSize.dynamicWidth > 760 ? <p className="text-gray-500 font-semibold ml-1">{`${audience} audience(s)`}</p> : <p className="text-gray-500 font-semibold ml-1">{`${audience}`}</p>}
									</div>
									 <div className="flex items-center ml-6">
										<CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
										{screenSize.dynamicWidth > 760 ? <p className="text-gray-500 font-semibold ml-1">{`Budget of ${budget} ${rewardtype}`}</p> : <p className="text-gray-500 font-semibold ml-1">{`${budget} ${rewardtype}`}</p>}
									</div> 
								</div>
							</div>
						);
					})}
				</>
			) : Loading ===true ? (
				<p className="alert alert-info font-semibold text-3xl text-center">Loading...</p>
			) : (
				<p className="alert alert-info font-semibold text-3xl text-center">No Studies</p>
			)}
			<CreateStudyModal
				show={CreatemodalShow}
				onHide={() => {
					setModalShow(false);
					LoadData();
				}}
			/>
		</>
	);
}

export default Studies;

