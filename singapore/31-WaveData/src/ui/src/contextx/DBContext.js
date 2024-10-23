'use client';
import { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import Airtable from 'airtable';
import { error } from 'jquery';


const Token = "patQvXPSOwdPxJ37f.246be6a5d6659407e4e40a4dc35095c7c9ddc312fd981f2d5b0305dc8dd48e12";
var base = new Airtable({ apiKey: Token }).base('appdP1KvBGkbsess3');

const AppContext = createContext({
    CheckEmail: async () => { },
    CreateAccount: async () => { },
    Login: async () => { },
    CreateStudy: async () => { },
    UpdateStudy: async () => { },
    UpdateAudience: async () => { },
    UpdateReward: async () => { },
    UpdateAges: async () => { },
    UpdateStudyTitle: async () => { },
    CreateSubject: async () => { },
    UpdateSubject: async () => { },
    createSurvey: async () => { },
    updateSurvey: async () => { },
    createSurveyCategory: async () => { },
    CreateOrSaveSections: async () => { },
    base: base
});


export function DBProvider({ children }) {

    async function CheckEmail(email) {
        try {
            const usersTable = base('users'); // Replace 'users' with your actual table name

            // Use Airtable's select method to find records that match the email
            const records = await usersTable.select({
                filterByFormula: `{email} = "${email}"`
            }).firstPage();

            // If there are records, return the user ID as a string
            if (records.length > 0) {
                return records[0].id;
            } else {
                // Return 'False' if the email is not found
                return 'False';
            }
        } catch (error) {
            console.error('Error checking email:', error);
            return 'Error checking email';
        }
    }
    // Function to create a new user account in Airtable
    async function CreateAccount(full_name, email, password) {
        try {
            const usersTable = base('users');
            await usersTable.create({
                "name": full_name,
                "email": email,
                "password": password,
                "image": "https://i.postimg.cc/SsxGw5cZ/person.jpg",
                "credits": 0,
            });
            console.log('User record created successfully in Airtable!');
        } catch (error) {
            console.error('Error creating user record in Airtable:', error);
        }
    }
    async function Login(email, password) {
        const usersTable = base('users'); // Replace 'users' with your actual table name

        try {
            const records = await usersTable.select({
                filterByFormula: `AND({email} = '${email}', {password} = '${password}')`,
                maxRecords: 1,
            }).firstPage();

            if (records.length ===1) {
                return records[0].getId();
            } else {
                return 'False'; // User not found or credentials are incorrect
            }
        } catch (error) {
            throw error;
        }
    }
    // Function to create a new study in Airtable
    async function CreateStudy(userId, image, title, description, permission, contributors, audience, budget) {
        
        
        const studiesTable = base('studies');

        try {
            const record = await studiesTable.create({
                "user_id": userId,
                "image": image,
                "title": title,
                "description": description,
                "permission": permission,
                "contributors": contributors,
                "audience": audience,
                "budget": budget,
                "reward_type": "Points",
                "reward_price": 0,
                "total_spending_limit": budget,
            });

            return record.getId();
        } catch (error) {
            throw error;
        }
    }

    async function createSurvey(studyId, userId, name, description, date, image, reward) {
        try {
            const surveysTable = base('surveys');
            // Create a new survey record in Airtable
            await surveysTable.create({
                'study_id': (studyId),
                'user_id': (userId),
                'name': name,
                'description': description,
                'date': date,
                'image': image,
                'reward': Number(reward),
                'submission': 0
            });


            console.log('Survey created successfully.');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function UpdateStudy(studyId, image, title, description, budget) {
        const studiesTable = base('studies');

        try {
            const record = await studiesTable.update(studyId, {
                "image": image,
                "title": title,
                "description": description,
                "budget": budget,
            });

            return record.getId();
        } catch (error) {
            throw error;
        }
    }


    async function UpdateAudience(studyId, audience_info) {

        const studyDataTable = base('study_data');
        const existingRecords = await studyDataTable.select({
            filterByFormula: `{study_id} = '${studyId}'`
        }).firstPage();

        if (existingRecords.length > 0) {
            let oldRecord = {};
            oldRecord.audiences = audience_info;

            // Update the existing record
            const existingRecordId = existingRecords[0].id;
            await studyDataTable.update(existingRecordId, oldRecord);
        } else {
            // Create a new record
            await studyDataTable.create({
                study_id: studyId,
                audiences: audience_info
            });
        }

        const studyTable = base('studies');

        studyTable.update(studyId,{
            "audience":JSON.parse(audience_info).length
        });

    }


    async function UpdateAges(studyId, ages_info) {

        const studyDataTable = base('study_data');
        const existingRecords = await studyDataTable.select({
            filterByFormula: `{study_id} = '${studyId}'`
        }).firstPage();

        if (existingRecords.length > 0) {
            let oldRecord = {};
            oldRecord.ages = ages_info;

            // Update the existing record
            const existingRecordId = existingRecords[0].id;
            await studyDataTable.update(existingRecordId, oldRecord);
        } else {
            // Create a new record
            await studyDataTable.create({
                study_id: studyId,
                ages: ages_info
            });
        }
    }
    async function UpdateStudyTitle(studyId, title_info) {

        const studyDataTable = base('study_data');
        const existingRecords = await studyDataTable.select({
            filterByFormula: `{study_id} = '${studyId}'`
        }).firstPage();

        if (existingRecords.length > 0) {
            let oldRecord = {};
            oldRecord.Titles = title_info;

            // Update the existing record
            const existingRecordId = existingRecords[0].id;
            await studyDataTable.update(existingRecordId, oldRecord);
        } else {
            // Create a new record
            await studyDataTable.create({
                study_id: studyId,
                Titles: title_info
            });
        }
    }
    async function UpdateReward(studyId, rewardType, rewardPrice, totalSpendingLimit) {
        const studiesTable = base('studies');

        const updatedFields = {
            'reward_type': rewardType,
            'reward_price': rewardPrice,
            'total_spending_limit': totalSpendingLimit
        };

        await studiesTable.update(studyId, updatedFields);
    }
    async function CreateSubject(studyId, subjectIndexId, title, agesAns) {
        const newSubject = {
            'study_id': studyId,
            'subject_index_id': subjectIndexId,
            'title': title,
            'ages_ans': agesAns
        };
        const study_subject_Table = base('study_subjects');

        try {
            const record = await study_subject_Table.create(newSubject);

            return record.getId();
        } catch (error) {
            throw error;
        }
    }
    async function UpdateSubject(subject_id, title, agesAns) {
        const newSubject = {
            'title': title,
            'ages_ans': agesAns
        };
        const study_subject_Table = base('study_subjects');

        try {
            await study_subject_Table.update(subject_id, newSubject);

        } catch (error) {
            throw error;
        }
    }
    async function updateSurvey(surveyId, name, description, image, reward) {
        try {

            const surveysTable = base('surveys');
            // Update the survey record in Airtable
            await surveysTable.update(surveyId, {
                'name': name,
                'description': description,
                'image': image,
                'reward': Number(reward),
            });
        } catch (e) {
            error(e)
        }

    }
    async function createSurveyCategory(name, image) {
        try {
            const surveyCategoriesTable = base('survey_categories');
            // Create a new survey category record in Airtable
            await surveyCategoriesTable.create({
                'name': name,
                'image': image,
            });

            console.log('Survey category created successfully.');
        } catch (error) {
            console.error('Error:', error);
        }
    }


    async function CreateOrSaveSections(surveyId, metadata) {

        const surveyDataTable = base('survey_data');
        const existingRecords = await surveyDataTable.select({
            filterByFormula: `{survey_id} = '${surveyId}'`
        }).firstPage();

        if (existingRecords.length > 0) {
            let oldRecord = {};
            oldRecord.sections = metadata;

            // Update the existing record
            const existingRecordId = existingRecords[0].id;
            await surveyDataTable.update(existingRecordId, oldRecord);
        } else {
            // Create a new record
            await surveyDataTable.create({
                survey_id: surveyId,
                sections: metadata
            });
        }
    }

    return <AppContext.Provider value={{ CheckEmail: CheckEmail, CreateAccount: CreateAccount, base: base, Login: Login,CreateOrSaveSections:CreateOrSaveSections, CreateStudy,createSurveyCategory:createSurveyCategory, UpdateStudy, UpdateAudience: UpdateAudience, UpdateReward: UpdateReward, UpdateAges: UpdateAges, UpdateStudyTitle: UpdateStudyTitle, CreateSubject: CreateSubject, UpdateSubject: UpdateSubject, createSurvey: createSurvey, updateSurvey: updateSurvey }}>{children}</AppContext.Provider>;

}

export const useDBContext = () => useContext(AppContext);
