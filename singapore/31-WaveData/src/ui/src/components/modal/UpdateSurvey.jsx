import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { CurrencyDollarIcon } from "@heroicons/react/solid";
import useContract from '../../services/useContract'

export default function UpdateSurveyModal({
    show,
    onHide,
    id
}) {


    const { api, contract, signerAddress, sendTransaction, ReadContractValue, ReadContractByQuery, getMessage, getQuery, getTX } = useContract();


    async function UpdateSurveyHandle(e) {
        e.preventDefault();
        const { name, description, image, reward, updateBTN } = e.target;
        var notificationSuccess = e.target.children[0].firstChild;
        var notificationError = e.target.children[0].lastChild;
        updateBTN.children[0].classList.remove("hidden")
        updateBTN.children[1].innerText = ""
        updateBTN.disabled = true;
        try {
            await sendTransaction(api, signerAddress, "UpdateSurvey", [parseInt(id), name.value, description.value, image.value, (Number(reward.value) * 1e18).toFixed(0)]);
            notificationSuccess.style.display = "block";
            updateBTN.children[0].classList.add("hidden")
            updateBTN.children[1].innerText = "Update Survey"

            updateBTN.disabled = false;
            window.location.reload();

        } catch (error) {
            notificationError.style.display = "none";
            updateBTN.children[0].classList.add("hidden");
            updateBTN.children[1].innerText = "Update Survey";
            updateBTN.disabled = false;
        }
        updateBTN.children[0].classList.add("hidden")
        updateBTN.children[1].innerText = "Update Survey";
        updateBTN.disabled = false;
    }

    async function LoadData() {
        if (typeof window?.contract !== 'undefined' && api !== null) {
            try {
                let survey_element = await ReadContractByQuery(api, signerAddress, getQuery("_surveyMap"), [parseInt(id)]);
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
                document.getElementById("updatename").value = new_survey.name
                document.getElementById("updatedescription").value = new_survey.description
                document.getElementById("updateimage").value = new_survey.image
                document.getElementById("reward").value = new_survey.reward
            } catch (error) { }


        }

    }


    useEffect(async () => {
        await LoadData();
    }, [api])

    return (
        <Modal
            show={show}
            onHide={onHide}
            onShow={() => { LoadData() }}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header  >
                <Modal.Title id="contained-modal-title-vcenter">
                    Update Survey
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <Form onSubmit={UpdateSurveyHandle}>
                    <Form.Group className="mb-3 grid" controlId="formGroupName">
                        <div id='notificationSuccess' name="notificationSuccess" style={{ display: 'none' }} className="mt-4 text-center bg-gray-200 relative text-gray-500 py-3 px-3 rounded-lg">
                            Success!
                        </div>
                        <div id='notificationError' name="notificationError" style={{ display: 'none' }} className="mt-4 text-center bg-red-200 relative text-red-600 py-3 px-3 rounded-lg">
                            Error! Please try again!
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3 grid" controlId="formGroupName">
                        <Form.Label>Name</Form.Label>
                        <input required name="name" placeholder="Name" id="updatename" className="border rounded pt-2 pb-2 border-gray-400 pl-4 pr-4" />
                    </Form.Group>
                    <Form.Group className="mb-3 grid" controlId="formGroupName">
                        <Form.Label>Description</Form.Label>
                        <textarea required name="description" placeholder="Description" id="updatedescription" className="border rounded pt-2 pb-2 border-gray-400 pl-4 pr-4" />
                    </Form.Group>
                    <Form.Group className="mb-3 grid" controlId="formGroupName">
                        <Form.Label>Image</Form.Label>
                        <input required name="image" placeholder="Image link" id="updateimage" className="border rounded pt-2 pb-2 border-gray-400 pl-4 pr-4" />
                    </Form.Group>
                    <Form.Group className="mb-3 grid" controlId="formGroupName">
                        <Form.Label>Reward</Form.Label>
                        <div className="input-group">
                            <span className="input-group-addon text-sm pt-2 pb-2 pl-3 pr-3 font-normal -mr-1 leading-none text-gray-700 text-center bg-gray-200 border-gray-400 border rounded">
                                <CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
                            </span>
                            <input required name="reward" placeholder="Reward" id="reward" type='number' className="w-24 text-black pr-2 border-gray-400 border pl-2" />
                        </div>
                    </Form.Group>
                    <div className="d-grid">
                        <Button name="updateBTN" type='submit' style={{ 'display': 'flex' }} className='w-[128px] h-12 flex justify-center items-center' variant='outline-dark' >
                            <i id='LoadingICON' name='LoadingICON' className="select-none block w-12 m-0 fa fa-circle-o-notch fa-spin hidden"></i>
                            <span id='buttonText'>Update Survey</span>
                        </Button>
                    </div>
                </Form>
            </Modal.Body>

        </Modal>

    );
}