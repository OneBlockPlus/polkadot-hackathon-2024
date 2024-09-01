import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { CurrencyDollarIcon } from "@heroicons/react/solid";
import useContract from '../../services/useContract'

export default function UpdateStudyModal({
    show,
    onHide,
    id
}) {
    const {  api,contract, signerAddress, sendTransaction,ReadContractValue,ReadContractByQuery,getMessage,getQuery,getTX } = useContract();
 

   
    async function UpdateStudyHandle(e) {
        e.preventDefault();
        const { title, description, image, updateBTN, budget } = e.target;
        var notificationSuccess = e.target.children[0].firstChild;
        var notificationError = e.target.children[0].lastChild;
        updateBTN.children[0].classList.remove("hidden")
        updateBTN.children[1].innerText = ""
        updateBTN.disabled = true;

        try {
            await sendTransaction(api,signerAddress, "UpdateStudy",[Number(id),image.value,title.value,description.value, (parseInt(budget.value) * 1e18).toFixed(0)]);
            
            notificationSuccess.style.display = "block";
            updateBTN.children[0].classList.add("hidden")
            updateBTN.children[1].innerText = "Update Study"

            updateBTN.disabled = false;
            window.location.reload();


        } catch (error) {
            notificationError.style.display = "none";
            updateBTN.children[0].classList.add("hidden");
            updateBTN.children[1].innerText = "Update Study";
            updateBTN.disabled = false;
        }
        updateBTN.children[0].classList.add("hidden")
        updateBTN.children[1].innerText = "Update Study";
        updateBTN.disabled = false;
    }

    async function LoadData() {
        if (typeof window?.contract !== 'undefined' && api !== null) {
            try {
                let study_element = await ReadContractByQuery(api, signerAddress, getQuery("_studyMap"), [parseInt(id)]);
                var newStudy = {
                    id: Number(study_element.studyId),
                    title: study_element.title,
                    image: study_element.image,
                    description: study_element.description,
                    contributors: Number(study_element.contributors),
                    audience: Number(study_element.audience),
                    budget: window.ParseBigNum(study_element.budget) 
                };
                document.getElementById("updatetitle").value = newStudy.title
                document.getElementById("updatedescription").value = newStudy.description
                document.getElementById("updateimage").value = newStudy.image
                document.getElementById("updatebudget").value = newStudy.budget
            }catch(e){}

           
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
                    Update Study
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <Form onSubmit={UpdateStudyHandle}>
                    <Form.Group className="mb-3 grid" controlId="formGroupName">
                        <div id='notificationSuccess' name="notificationSuccess" style={{ display: 'none' }} className="mt-4 text-center bg-gray-200 relative text-gray-500 py-3 px-3 rounded-lg">
                            Success!
                        </div>
                        <div id='notificationError' name="notificationError" style={{ display: 'none' }} className="mt-4 text-center bg-red-200 relative text-red-600 py-3 px-3 rounded-lg">
                            Error! Please try again!
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3 grid" controlId="formGroupName">
                        <Form.Label>Title</Form.Label>
                        <input required name="title" placeholder="Title" id="updatetitle" className="border rounded pt-2 pb-2 border-gray-400 pl-4 pr-4" />
                    </Form.Group>
                    <Form.Group className="mb-3 grid" controlId="formGroupName">
                        <Form.Label>Description</Form.Label>
                        <textarea rows={10} required name="description" placeholder="Description" id="updatedescription" className="border rounded pt-2 pb-2 border-gray-400 pl-4 pr-4" />
                    </Form.Group>
                    <Form.Group className="mb-3 grid" controlId="formGroupName">
                        <Form.Label>Image</Form.Label>
                        <input required name="image" placeholder="Image link" id="updateimage" className="border rounded pt-2 pb-2 border-gray-400 pl-4 pr-4" />
                    </Form.Group>
                    <Form.Group className="mb-3 grid" controlId="formGroupName">
                        <Form.Label>Budget</Form.Label>
                        <div className="input-group">
                            <span className="input-group-addon text-sm pt-2 pb-2 pl-3 pr-3 font-normal -mr-1 leading-none text-gray-700 text-center bg-gray-200 border-gray-400 border rounded">
                                <CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
                            </span>
                            <input required name="budget" placeholder="Budget" id="updatebudget" type='number' className="w-24 text-black pr-2 border-gray-400 border pl-2" />
                        </div>
                    </Form.Group>
                    <div className="d-grid">
                        <Button name="updateBTN" type='submit' style={{ 'display': 'flex' }} className='w-[128px] h-12 flex justify-center items-center' variant='outline-dark' >
                            <i id='LoadingICON' name='LoadingICON' className="select-none block w-12 m-0 fa fa-circle-o-notch fa-spin hidden"></i>
                            <span id='buttonText'>Update Study</span>
                        </Button>
                    </div>
                </Form>
            </Modal.Body>

        </Modal>

    );
}