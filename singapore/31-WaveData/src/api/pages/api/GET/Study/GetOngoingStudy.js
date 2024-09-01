
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}

  let useContract = await import("../../../../contract/useContract.ts");
	const {api, contract, signerAddress,ParseBigNum, sendTransaction, ReadContractByQuery, getMessage, getQuery} = await useContract.default();

	let study_id = await ReadContractByQuery(api, signerAddress, getQuery(contract,"GetOngoingStudy"), [Number(req.query.userid)]);
  if (study_id !== "False") {
    
    let study_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_studyMap"), [Number(study_id)]);
    var newStudy = {
      id: Number(study_element.studyId),
      title: study_element.title,
      image: study_element.image,
      description: study_element.description,
      contributors: Number(study_element.contributors),
      audience: Number(study_element.audience),
      budget: ParseBigNum(study_element.totalSpendingLimit) 
    };
    let all_surveys = await ReadContractByQuery(api, signerAddress, getQuery(contract,"getAllSurveysIDByStudy"), [Number(study_id)]);

    let all_study_surveys = [];
    for (let i = 0; i < all_surveys.length; i++) {
      let survey_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_surveyMap"), [Number(all_surveys[i])]);

      var new_survey = {
        id: Number(survey_element.surveyId),
        study_id: Number(survey_element.studyId),
        user_id: Number(survey_element.userId),
        name: survey_element.name,
        description: survey_element.description,
        date: survey_element.date,
        image: survey_element.image,
        reward: ParseBigNum(survey_element.reward),
        submission: Number(survey_element?.submission)
      };
      all_study_surveys.push(new_survey);
    }

    let all_completed_surveys = await ReadContractByQuery(api, signerAddress, getQuery(contract,"getAllCompletedSurveysIDByUser"), [Number(req.query.userid)]);
    let all_study_completed_surveys = [];

    for (let i = 0; i < all_completed_surveys.length; i++) {
      let completed_survey_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_completedsurveyMap"), [Number(all_completed_surveys[i])]);
      var new_completed_survey = {
        id: Number(completed_survey_element.completedSurveyId),
        study_id: Number(completed_survey_element.studyId),
        user_id: Number(completed_survey_element.userId),
        survey_id: Number(completed_survey_element.surveyId),
        date: completed_survey_element.date,
      };
      if (new_completed_survey.study_id === Number(study_id)){
        all_study_completed_surveys.push(new_completed_survey);
      }
    } 


    let completed_informed_consent = await ReadContractByQuery(api, signerAddress, getQuery(contract,"getCompletedInformedConsentId"), [Number(req.query.userid), Number(study_id)]);
   
    if (completed_informed_consent !== "False") {
      let new_completed_informed_consent = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_completedinformedMap"), [Number(completed_informed_consent)]);
   
      completed_informed_consent = {
        id: Number(new_completed_informed_consent.completedInformed_consentId),
        study_id: Number(new_completed_informed_consent.studyId),
        user_id: Number(new_completed_informed_consent.userId),
        date: new_completed_informed_consent.date,
      }
    }

    let finalObject={
      Study:newStudy,
      Survey: all_study_surveys,
      Completed: all_study_completed_surveys,
      CompletedInformed: completed_informed_consent
    }

    res.status(200).json({ status:200,value: JSON.stringify(finalObject) })
    return;
  }
  
  res.status(400).json({ status:400, value: "None" })

}
