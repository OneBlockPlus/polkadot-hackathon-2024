#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(non_snake_case)]
#![allow(non_camel_case_types)]
#![allow(dead_code)]
#![allow(clippy::arithmetic_side_effects)]

#[ink::contract]
mod wavedata {

    use ink::{prelude::format, prelude::string::String, prelude::vec::Vec};

    use ink::storage::Mapping;
    use scale::{Decode, Encode};
    // region: All stucts
    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct user_struct {
        user_id: i32,
        name: String,
        email: String,
        password: String,
        walletaddress: String,
        image: String,
        credits: u128,
        accesstoken: String,
        fhirid: i32,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct survey_category_struct {
        name: String,
        image: String,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct study_struct {
        study_id: i32,
        user_id: i32,
        image: String,
        title: String,
        description: String,
        permission: String,
        contributors: i32,
        audience: i32,
        budget: u128,
        reward_type: String,
        reward_price: u128,
        total_spending_limit: u128,
        ages: String,
        titles: String,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct study_subject_struct {
        subject_id: i32,
        study_id: i32,
        subject_index_id: String,
        title: String,
        ages_ans: String,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct survey_struct {
        survey_id: i32,
        study_id: i32,
        user_id: i32,
        name: String,
        description: String,
        date: String,
        image: String,
        reward: u128,
        submission: i32,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct fhir_struct {
        user_id: i32,
        family_name: String,
        given_name: String,
        identifier: String,
        phone: String,
        gender: String,
        birth_date: String,
        about: String,
        patient_id: String,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct ongoing_struct {
        ongoing_id: i32,
        study_id: i32,
        user_id: i32,
        date: String,
        given_permission: String,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct survey_question_answer_struct {
        answer_id: i32,
        study_id: i32,
        user_id: i32,
        survey_id: i32,
        section_id: String,
        question_id: String,
        answer: String,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct completed_survey_struct {
        completed_survey_id: i32,
        study_id: i32,
        user_id: i32,
        survey_id: i32,
        date: String,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct completed_informed_consent_struct {
        completed_informed_consent_id: i32,
        study_id: i32,
        user_id: i32,
        date: String,
    }

    // endregion: All stucts

    // region: Initialize
    #[ink(storage)]
    pub struct Wavedata {
        //Variables
        _UserIds: i32,
        _FhirIds: i32,
        _StudyIds: i32,
        _StudySubjectsIds: i32,
        _SurveyIds: i32,
        _SurveyCategoryIds: i32,
        _OngoingIds: i32,
        _AnsweredIds: i32,
        _CompletedSurveyIds: i32,
        _CompletedInformedConsentIds: i32,
        _TotalAmounts:u128,
        //Variables Multiples
        _userMap: Mapping<i32, user_struct>,
        _studyMap: Mapping<i32, study_struct>,
        _studyAudienceMap: Mapping<i32, String>,
        _studySubjectMap: Mapping<i32, study_subject_struct>,
        _surveyMap: Mapping<i32, survey_struct>,
        _categoryMap: Mapping<i32, survey_category_struct>,
        _sectionsMap: Mapping<i32, String>,
        _fhirMap: Mapping<i32, fhir_struct>,
        _ongoingMap: Mapping<i32, ongoing_struct>,
        _questionanswerdMap: Mapping<i32, survey_question_answer_struct>,
        _completedsurveyMap: Mapping<i32, completed_survey_struct>,
        _completedinformedMap: Mapping<i32, completed_informed_consent_struct>,
    }

    impl Wavedata {
        /// Constructor that initializes
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                //Variables
                _UserIds: 0,
                _FhirIds: 0,
                _StudyIds: 0,
                _StudySubjectsIds: 0,
                _SurveyIds: 0,
                _SurveyCategoryIds: 0,
                _OngoingIds: 0,
                _AnsweredIds: 0,
                _CompletedSurveyIds: 0,
                _CompletedInformedConsentIds: 0,
                _TotalAmounts:0,
                //Variables Multiples
                _userMap: Mapping::new(),
                _studyMap: Mapping::new(),
                _studySubjectMap: Mapping::new(),
                _studyAudienceMap: Mapping::new(),
                _surveyMap: Mapping::new(),
                _categoryMap: Mapping::new(),
                _sectionsMap: Mapping::new(),
                _fhirMap: Mapping::new(),
                _ongoingMap: Mapping::new(),
                _questionanswerdMap: Mapping::new(),
                _completedsurveyMap: Mapping::new(),
                _completedinformedMap: Mapping::new(),
            }
        }

        /// Constructors can delegate to other constructors.
        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new()
        }
        // endregion: Initialize
        // region: Users
        #[ink(message)]
        pub fn CreateAccount(&mut self, full_name: String, email: String, password: String, accesstoken: String, walletaddress: String, birth_date: String) {
            let stuff = user_struct {
                user_id: self._UserIds,
                name: full_name,
                email: email,
                password: password,
                walletaddress: walletaddress,
                image: format!("{}", "https://i.postimg.cc/SsxGw5cZ/person.jpg"),
                credits: 0,
                accesstoken: accesstoken,
                fhirid: self._UserIds,
            };
            let fhir_stuff = fhir_struct {
                user_id: self._UserIds,
                family_name: format!("{}", ""),
                given_name: format!("{}", ""),
                identifier: format!("{}", ""),
                phone: format!("{}", ""),
                gender: format!("{}", ""),
                birth_date: birth_date,
                about: format!("{}", ""),
                patient_id: format!("{}", ""),
            };

            self._fhirMap.insert(self._UserIds, &fhir_stuff);

            self._userMap.insert(self._UserIds, &stuff);
            self._UserIds += 1;
        }

        #[ink(message)]
        pub fn CheckEmail(&mut self, email: String) -> String {
            for i in 0..(self._UserIds) {
                let v = self._userMap.get(i).unwrap();
                if format!("{}", v.email) == format!("{}", email) {
                    return format!("{}", i);
                }
            }

            return format!("{}", "False");
        }

        #[ink(message)]
        pub fn UpdateAccessToken(&mut self, userid: i32, accesstoken: String) {
            let mut user = self._userMap.get(userid).unwrap();
            user.accesstoken = accesstoken;
            self._userMap.insert(userid, &user);
        }

        #[ink(message)]
        pub fn Login(&mut self, email: String, password: String) -> String {
            for i in 0..(self._UserIds) {
                let v = self._userMap.get(i).unwrap();
                if format!("{}", v.email) == format!("{}", email) && format!("{}", v.password) == format!("{}", password) {
                    return format!("{}", i);
                }
            }

            return format!("{}", "False");
        }

        #[ink(message)]
        pub fn getUserDetails(&mut self, user_id: i32) -> Vec<String> {
            let mut result: Vec<String> = Vec::new();
            let user = self._userMap.get(user_id).unwrap();

            result.push(user.image);
            result.push(format!("{}", user.credits));
            result.push(user.name);
            result.push(user.email);
            result.push(String::from(&user.walletaddress));
            result.push(user.accesstoken);
            result.push(format!("{}", user.fhirid));

            return result;
        }

        // endregion: Users

        // region: Study
        #[ink(message)]
        pub fn CreateStudy(&mut self, user_id: i32, image: String, title: String, description: String, permission: String, contributors: i32, audience: i32, budget: u128) {
            let stuff = study_struct {
                study_id: self._StudyIds,
                user_id: user_id,
                image: image,
                title: title,
                description: description,
                permission: permission,
                contributors: contributors,
                audience: audience,
                budget: budget,
                reward_type: format!("{}", "SBY"),
                reward_price: 0,
                total_spending_limit: budget,
                ages: format!("{}", "[]"),
                titles: format!("{}", "[]"),
            };
            self._studyMap.insert(self._StudyIds, &stuff);
            self._StudyIds = self._StudyIds.clone() + 1;
        }

        #[ink(message)]
        #[ink(payable)]
        pub fn CreateSurvey(&mut self, study_id: i32, user_id: i32, name: String, description: String, date: String, image: String, reward: u128) {
            let stuff = survey_struct {
                survey_id: self._SurveyIds,
                study_id: study_id,
                user_id: user_id,
                name: name,
                description: description,
                date: date,
                image: image,
                reward: reward,
                submission: 0,
            };
            self._TotalAmounts += reward;
            self._surveyMap.insert(self._SurveyIds, &stuff);
            self._SurveyIds = self._SurveyIds.clone() + 1;
        }
        #[ink(message)]
        pub fn CreateSubject(&mut self, study_id: i32, subject_index_id: String, title: String, ages_ans: String) {
            let stuff = study_subject_struct {
                subject_id: self._StudySubjectsIds,
                study_id: study_id,
                subject_index_id: subject_index_id,
                title: title,
                ages_ans: ages_ans,
            };
            self._studySubjectMap.insert(self._StudySubjectsIds, &stuff);
            self._StudySubjectsIds = self._StudySubjectsIds.clone() + 1;
        }

        #[ink(message)]
        pub fn UpdateSubject(&mut self, subject_id: i32, title: String, ages_ans: String) {
            let mut stuff = self._studySubjectMap.get(subject_id).unwrap();
            stuff.title = title;
            stuff.ages_ans = ages_ans;

            self._studySubjectMap.insert(subject_id, &stuff);
        }

        #[ink(message)]
        pub fn CreateOrSaveStudyTitle(&mut self, studyId: i32, title_info: String) {
            let mut stuff = self._studyMap.get(studyId).unwrap();
            stuff.titles = title_info;
            self._studyMap.insert(studyId, &stuff);
        }
        #[ink(message)]
        pub fn CreateOrSaveSections(&mut self, survey_id: i32, metadata: String) {
            self._sectionsMap.insert(survey_id, &metadata);
        }

        #[ink(message)]
        pub fn CreateSurveyCategory(&mut self, name: String, image: String) {
            let stuff = survey_category_struct { name: name, image: image };
            self._categoryMap.insert(self._SurveyCategoryIds, &stuff);
            self._SurveyCategoryIds = self._SurveyCategoryIds.clone() + 1;
        }

        #[ink(message)]
        pub fn getAllSurveysIDByStudy(&mut self, study_id: i32) -> Vec<i32> {
            let mut result: Vec<i32> = Vec::new();

            for i in 0..(self._SurveyIds) {
                let v = self._surveyMap.get(i).unwrap();
                if format!("{}", v.study_id) == format!("{}", study_id) {
                    result.push(i);
                }
            }
            return result;
        }

        #[ink(message)]
        pub fn UpdateStudy(&mut self, study_id: i32, image: String, title: String, description: String, budget: u128) {
            let mut study = self._studyMap.get(study_id).unwrap();
            study.image = image;
            study.title = title;
            study.description = description;
            study.budget = budget;

            self._studyMap.insert(study_id, &study);
        }

        #[ink(message)]
        pub fn UpdateStudyAges(&mut self, study_id: i32, ages: String) {
            let mut study = self._studyMap.get(study_id).unwrap();
            study.ages = ages;

            self._studyMap.insert(study_id, &study);
        }

        #[ink(message)]
        pub fn UpdateSurvey(&mut self, survey_id: i32, name: String, description: String, image: String, reward: u128) {
            let mut survey = self._surveyMap.get(survey_id).unwrap();
            survey.name = name;
            survey.description = description;
            survey.image = image;
            survey.reward = reward;

            self._surveyMap.insert(survey_id, &survey);
        }

        #[ink(message)]
        pub fn UpdateReward(&mut self, study_id: i32, reward_type: String, reward_price: u128, total_spending_limit: u128) {
            let mut stuff = self._studyMap.get(study_id).unwrap();
            stuff.reward_type = reward_type;
            stuff.reward_price = reward_price;
            stuff.total_spending_limit = total_spending_limit;

            self._studyMap.insert(study_id, &stuff);
        }

        #[ink(message)]
        pub fn UpdateAudience(&mut self, study_id: i32, audience_info: String) {
            self._studyAudienceMap.insert(study_id, &audience_info);
        }

        #[ink(message)]
        pub fn UpdateUser(&mut self, user_id: i32, image: String, credits: u128) {
            let mut stuff = self._userMap.get(user_id).unwrap();
            stuff.image = image;
            stuff.credits = credits;

            self._userMap.insert(user_id, &stuff);
        }

        #[ink(message)]
        pub fn UpdateFhir(
            &mut self,
            user_id: i32,
            walletaddress: String,
            family_name: String,
            given_name: String,
            identifier: String,
            phone: String,
            gender: String,
            birth_date: String,
            about: String,
            patient_id: String,
        ) {
            let stuff = fhir_struct {
                user_id: user_id,
                family_name: family_name,
                given_name: given_name,
                identifier: identifier,
                phone: phone,
                gender: gender,
                birth_date: birth_date,
                about: about,
                patient_id: patient_id,
            };
            let mut user = self._userMap.get(user_id).unwrap();
            user.walletaddress = walletaddress;
            self._userMap.insert(user_id, &user);

            self._fhirMap.insert(user_id, &stuff);
        }

        // endregion: Study

        // region: OngoingStudy
        #[ink(message)]
        pub fn CreateOngoingStudy(&mut self, study_id: i32, user_id: i32, date: String, given_permission: String) {
            let stuff = ongoing_struct {
                ongoing_id: self._OngoingIds,
                study_id: study_id,
                user_id: user_id,
                date: date,
                given_permission: given_permission,
            };

            let mut study = self._studyMap.get(study_id).unwrap();
            study.contributors = study.contributors.clone() + 1;
            self._studyMap.insert(study_id, &study);

            self._ongoingMap.insert(self._OngoingIds, &stuff);
            self._OngoingIds = self._OngoingIds.clone() + 1;
        }

        #[ink(message)]
        pub fn GetOngoingStudy(&mut self, user_id: i32) -> String {
            for i in 0..(self._OngoingIds) {
                let v = self._ongoingMap.get(i).unwrap();
                if format!("{}", v.user_id) == format!("{}", user_id) {
                    return format!("{}", v.study_id);
                }
            }

            return format!("{}", "False");
        }

        // endregion: OngoingStudy

        // region: FromApp
        #[ink(message)]
        pub fn CreateQuestionAnswer(&mut self, study_id: i32, user_id: i32, survey_id: i32, section_id: String, question_id: String, answer: String) {
            let stuff = survey_question_answer_struct {
                answer_id: self._AnsweredIds,
                study_id: study_id,
                user_id: user_id,
                survey_id: survey_id,
                section_id: section_id,
                question_id: question_id,
                answer: answer,
            };
            self._questionanswerdMap.insert(self._AnsweredIds, &stuff);
            self._AnsweredIds = self._AnsweredIds.clone() + 1;
        }

        #[ink(message)]
        pub fn CreateCompletedSurveys(&mut self, survey_id: i32, user_id: i32, date: String, study_id: i32) {
            let stuff = completed_survey_struct {
                completed_survey_id: self._CompletedSurveyIds,
                study_id: study_id,
                user_id: user_id,
                survey_id: survey_id,
                date: date.clone(),
            };

            let mut survey = self._surveyMap.get(survey_id).unwrap();
            survey.submission = survey.submission.clone() + 1;
            survey.date = date.clone();
            self._surveyMap.insert(survey_id, &survey);

            self._completedsurveyMap.insert(self._CompletedSurveyIds, &stuff);
            self._CompletedSurveyIds = self._CompletedSurveyIds.clone() + 1;
        }

        #[ink(message)]
        pub fn getAllCompletedSurveysIDByUser(&mut self, user_id: i32) -> Vec<i32> {
            let mut result: Vec<i32> = Vec::new();

            for i in 0..(self._CompletedSurveyIds) {
                let v = self._completedsurveyMap.get(i).unwrap();
                if format!("{}", v.user_id) == format!("{}", user_id) {
                    result.push(i);
                }
            }
            return result;
        }
        #[ink(message)]
        pub fn CreateCompletedInformedConsent(&mut self, user_id: i32, date: String, study_id: i32) {
            let stuff = completed_informed_consent_struct {
                completed_informed_consent_id: self._CompletedSurveyIds,
                study_id: study_id,
                user_id: user_id,
                date: date.clone(),
            };

            self._completedinformedMap.insert(self._CompletedInformedConsentIds, &stuff);
            self._CompletedInformedConsentIds = self._CompletedInformedConsentIds.clone() + 1;
        }

        #[ink(message)]
        pub fn getCompletedInformedConsentId(&mut self, user_id: i32, study_id: i32) -> String {
            for i in 0..(self._CompletedInformedConsentIds) {
                let v = self._completedinformedMap.get(i).unwrap();
                if format!("{}", v.user_id) == format!("{}", user_id) && format!("{}", v.study_id) == format!("{}", study_id) {
                    return format!("{}", i);
                }
            }
            return format!("{}", "False");
        }

        #[ink(message)]
        pub fn WithDrawAmount(&mut self, user_id: i32, amount: u128, person:AccountId) {
            assert!(self.env().transfer(person, amount).is_ok());

            let mut user = self._userMap.get(user_id).unwrap();
            user.credits -= amount;        

            self._userMap.insert(user_id, &user);
        }

        
        #[ink(message)]
        pub fn getAmount(&self) -> u128 {
            self._TotalAmounts
        }

   
        #[ink(message)]
        pub fn transfer(&mut self, _amount:u128, person:AccountId) {
            assert!(self.env().transfer(person, _amount).is_ok());

            ()

        }

        
        // endregion: FromApp

        // regiion: GetAllVariables
        #[ink(message)]
        pub fn _UserIds(&mut self) -> i32 {
            return self._UserIds;
        }
        #[ink(message)]
        pub fn _StudyIds(&mut self) -> i32 {
            return self._StudyIds;
        }
        #[ink(message)]
        pub fn _StudySubjectsIds(&mut self) -> i32 {
            return self._StudySubjectsIds;
        }

        #[ink(message)]
        pub fn _SurveyIds(&mut self) -> i32 {
            return self._SurveyIds;
        }
        #[ink(message)]
        pub fn _SurveyCategoryIds(&mut self) -> i32 {
            return self._SurveyCategoryIds;
        }
        #[ink(message)]
        pub fn _OngoingIds(&mut self) -> i32 {
            return self._OngoingIds;
        }
        #[ink(message)]
        pub fn _AnsweredIds(&mut self) -> i32 {
            return self._AnsweredIds;
        }
        #[ink(message)]
        pub fn _CompletedSurveyIds(&mut self) -> i32 {
            return self._CompletedSurveyIds;
        }
        #[ink(message)]
        pub fn _CompletedInformedConsentIds(&mut self) -> i32 {
            return self._CompletedInformedConsentIds;
        }
        #[ink(message)]
        pub fn _TotalAmounts(&mut self) -> u128 {
            return self._TotalAmounts;
        }
        #[ink(message)]
        pub fn _userMap(&mut self, id: i32) -> user_struct {
            return self._userMap.get(id).unwrap();
        }
        #[ink(message)]
        pub fn _studyMap(&mut self, id: i32) -> study_struct {
            return self._studyMap.get(id).unwrap();
        }
        #[ink(message)]
        pub fn _studySubjectMap(&mut self, id: i32) -> study_subject_struct {
            return self._studySubjectMap.get(id).unwrap();
        }

        #[ink(message)]
        pub fn _studyAudienceMap(&mut self, id: i32) -> String {
            return self._studyAudienceMap.get(id).unwrap();
        }

        #[ink(message)]
        pub fn _surveyMap(&mut self, id: i32) -> survey_struct {
            return self._surveyMap.get(id).unwrap();
        }

        #[ink(message)]
        pub fn _categoryMap(&mut self, id: i32) -> survey_category_struct {
            return self._categoryMap.get(id).unwrap();
        }

        #[ink(message)]
        pub fn _sectionsMap(&mut self, id: i32) -> String {
            return self._sectionsMap.get(id).unwrap();
        }

        #[ink(message)]
        pub fn _fhirMap(&mut self, id: i32) -> fhir_struct {
            return self._fhirMap.get(id).unwrap();
        }

        #[ink(message)]
        pub fn _ongoingMap(&mut self, id: i32) -> ongoing_struct {
            return self._ongoingMap.get(id).unwrap();
        }

        #[ink(message)]
        pub fn _completedinformedMap(&mut self, id: i32) -> completed_informed_consent_struct {
            return self._completedinformedMap.get(id).unwrap();
        }
        #[ink(message)]
        pub fn _questionanswerdMap(&mut self, id: i32) -> survey_question_answer_struct {
            return self._questionanswerdMap.get(id).unwrap();
        }
        #[ink(message)]
        pub fn _completedsurveyMap(&mut self, id: i32) -> completed_survey_struct {
            return self._completedsurveyMap.get(id).unwrap();
        }

        // endregion: GetAllVariables

        // region: Delete
        #[ink(message)]
        pub fn delete_a_study(&mut self, study_id: i32) {
            self._studyMap.remove(study_id);
            self._studyAudienceMap.remove(study_id);

            for i in 0..(self._SurveyIds) {
                let v = self._surveyMap.get(i).unwrap();
                if format!("{}", v.study_id) == format!("{}", study_id) {
                    self.delete_a_servey(i);
                }
            }

            for i in 0..(self._OngoingIds) {
                let v = self._ongoingMap.get(i).unwrap();
                if format!("{}", v.study_id) == format!("{}", study_id) {
                    self._ongoingMap.remove(i);
                }
            }
        }
        #[ink(message)]
        pub fn delete_a_servey(&mut self, survey_id: i32) {
            self._surveyMap.remove(survey_id);
            self._sectionsMap.remove(survey_id);

            for i in 0..(self._AnsweredIds) {
                let v = self._questionanswerdMap.get(i).unwrap();
                if format!("{}", v.survey_id) == format!("{}", survey_id) {
                    self._questionanswerdMap.remove(i);
                }
            }

            for i in 0..(self._CompletedSurveyIds) {
                let v = self._completedsurveyMap.get(i).unwrap();
                if format!("{}", v.survey_id) == format!("{}", survey_id) {
                    self._completedsurveyMap.remove(i);
                }
            }
        }

        #[ink(message)]
        pub fn reset_all(&mut self) {
            self._UserIds = 0;
            self._FhirIds = 0;
            self._StudyIds = 0;
            self._SurveyIds = 0;
            self._SurveyCategoryIds = 0;
            self._OngoingIds = 0;
            self._AnsweredIds = 0;
            self._CompletedSurveyIds = 0;

            //Variables
            self._userMap = Mapping::new();
            self._studyMap = Mapping::new();
            self._studyAudienceMap = Mapping::new();
            self._surveyMap = Mapping::new();
            self._categoryMap = Mapping::new();
            self._sectionsMap = Mapping::new();
            self._fhirMap = Mapping::new();
            self._ongoingMap = Mapping::new();
            self._questionanswerdMap = Mapping::new();
            self._completedsurveyMap = Mapping::new();
        }

        #[ink(message)]
        pub fn reset_app(&mut self, user_id: i32) {
            self._UserIds = self._UserIds.clone() - 1;
            self._OngoingIds = 0;
            self._FhirIds = 0;
            self._AnsweredIds = 0;
            self._CompletedSurveyIds = 0;

            //Variables
            self._userMap.remove(user_id);
            self._fhirMap = Mapping::new();

            self._ongoingMap = Mapping::new();
            self._questionanswerdMap = Mapping::new();
            self._completedsurveyMap = Mapping::new();
        }

        // endregion: Delete
    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;
        use ink_env;

        fn create_account(mut wavedata: Wavedata) -> Wavedata {
            wavedata.CreateAccount(
                String::from("full_name"),
                String::from("email"),
                String::from("password"),
                String::from("accesstoken"),
                String::from("walletaddress"),
                String::from("birth_date"),
            );
            assert_eq!(wavedata._UserIds, 1);
            return wavedata;
        }

        #[ink::test]
        fn Study_Surveys() {
            let mut wavedata = Wavedata::new();
            // *----------------Study------------------*
            wavedata.CreateStudy(0, String::from("image"), String::from("title"), String::from("description"), String::from("permission"), 0, 0, 0);
            wavedata.CreateStudy(2, String::from("image"), String::from("title"), String::from("description"), String::from("permission"), 0, 0, 0);
            // assert_eq!(wavedata._StudyIds, 2);

            // *----------------Survey------------------*
            wavedata.CreateSurvey(0, 0, String::from("name"), String::from("description"), String::from("date"), String::from("image"), 0);
            wavedata.CreateSurvey(0, 0, String::from("name2"), String::from("description2"), String::from("date2"), String::from("image2"), 220);
            wavedata.CreateSurvey(1, 0, String::from("name2"), String::from("description2"), String::from("date2"), String::from("image2"), 220);
            // assert_eq!(wavedata._SurveyIds, 3);

            let found_surveys = wavedata.getAllSurveysIDByStudy(0);
            // assert_eq!(found_surveys.len(), 2);

            // *----------------Delete------------------*
            wavedata.delete_a_study(0);
            // assert_eq!(wavedata._studyMap.get(0), None);
        }
    }
}
