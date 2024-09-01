
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}
  
  let useContract = await import("../../../../contract/useContract.ts");
  const {api, contract, signerAddress,ParseBigNum, sendTransaction, ReadContractByQuery, getMessage, getQuery} = await useContract.default();

  let Studies = [];
  let TotalStudies = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_StudyIds"));
  for (let i = 0; i < Number(TotalStudies); i++) {
    let study_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_studyMap"), [Number(i)]);
    let study_title = JSON.parse(study_element.titles);
    const totalSubjects = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_StudySubjectsIds"));
		let draft_subjects = [];
		try {
			for (let i = 0; i < Number(totalSubjects); i++) {
				let subject_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_studySubjectMap"), [i]);


				var new_subject = {
					subject_id: Number(subject_element.subjectId),
					study_id: Number(subject_element.studyId),
					subject_index_id: (subject_element.subjectIndexId),
					title: subject_element.title,
					ages_ans:  JSON.parse(subject_element.agesAns),
				};
				if (study_element.studyId === new_subject.study_id) {
					draft_subjects.push(new_subject)
				}
			}
		} catch (ex) { }

    var newStudy = {
      id: Number(study_element.studyId),
      title: study_element.title,
      image: study_element.image,
      description: study_element.description,
      contributors: Number(study_element.contributors),
      audience: Number(study_element.audience),
      budget: ParseBigNum(study_element.budget) ,
      permissions: study_element.permission,
      study_title:study_title,
      subjects:draft_subjects
    };
    Studies.push(newStudy);
  }
  res.status(200).json({ value: JSON.stringify(Studies) })
}
