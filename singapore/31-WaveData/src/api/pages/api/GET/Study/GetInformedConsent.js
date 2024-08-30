
export default async function handler(req, res) {
    try {
        let FixCors = await import("../../../../contract/fixCors.js");
        await FixCors.default(res);
    } catch (error) { }

    let useContract = await import("../../../../contract/useContract.ts");
    const { api, contract, signerAddress, sendTransaction, ReadContractByQuery, getMessage, getQuery } = await useContract.default();
    const { study_id, user_id } = req.query;

    //Current Age
    let fhir_element = await ReadContractByQuery(api, signerAddress, getQuery(contract, "_fhirMap"), [Number(user_id)]);

    var bDate = new Date(fhir_element.birthDate);
    var nDate = new Date()
    let currentAge = nDate.getFullYear() - bDate.getFullYear(); //36

    let study_element = await ReadContractByQuery(api, signerAddress, getQuery(contract, "_studyMap"), [Number(study_id)]);

    //Load Ages
    let ages_Data_element = study_element.ages
    let ages_groups = (ages_Data_element == "" ? [] : JSON.parse(ages_Data_element));


    //Elligible Age
    let eligible_age_group = ages_groups.filter((val) => {
        if (!val.older) {
            //20 < 36 && 36 < 25
            if (val.from < currentAge && currentAge < val.to) {
                return true;
            }
        } else {
            // 25 < 36 
            if (val.from < currentAge) return true;
        }
        return false;
    });

    //Load Study Title
    let study_title = {};

    let study_Data_element = study_element.titles
    let parsed_study = JSON.parse(study_Data_element);
    try {

        if (study_Data_element == "") {
            study_title = {};
        } else {
            study_title = parsed_study;
        }
    } catch (e) {
        study_title = {};
    }


    //Elligible 
    let study_title_elligible = "";
    if (eligible_age_group.length > 0) {
        study_title_elligible = study_title[eligible_age_group[0]?.id];
    }


    //Load Subjects

    const totalSubjects = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_StudySubjectsIds"));
    let draft_subjects = [];
    try {
        for (let i = 0; i < Number(totalSubjects); i++) {
            let subject_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_studySubjectMap"), [i]);
            if (Number(study_element.studyId) === Number(subject_element.studyId)) {
                let elligible_ages_ans = {};
                if (eligible_age_group.length > 0) {
                    elligible_ages_ans = JSON.parse(subject_element.agesAns)[eligible_age_group[0]?.id];
                }

                var new_subject = {
                    subject_id: Number(subject_element.subjectId),
                    study_id: Number(subject_element.studyId),
                    subject_index_id: (subject_element.subjectIndexId),
                    title: subject_element.title,
                    ages_ans: elligible_ages_ans,
                };

                draft_subjects.push(new_subject)
            }
        }
    } catch (ex) { }



    var newStudy = {
        id: Number(study_id),
        title: study_element.title,
        image: study_element.image,
        description: study_element.description,
        contributors: Number(study_element.contributors),
        audience: Number(study_element.audience),
        budget: Number(study_element.budget),
        permissions: (study_element.permission),
        study_title: study_title_elligible,
        subjects: draft_subjects,
        ages_groups: ages_groups,
        eligible_age_group: eligible_age_group
    };



    res.status(200).json({ status: 200, value: JSON.stringify(newStudy) })
    return;

}
