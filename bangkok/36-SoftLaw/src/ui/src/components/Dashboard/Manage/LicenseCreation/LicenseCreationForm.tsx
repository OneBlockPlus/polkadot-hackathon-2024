import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LicenseFormData } from "./types";
import TypesComponent from "@/components/TypesProps";

interface LicenseCreationFormProps {
  formData: LicenseFormData;
  onSubmit: (data: LicenseFormData) => void;
  onBack: () => void;
  onChange: (data: LicenseFormData) => void;
}

export function LicenseCreationForm({
  formData,
  onChange,
  onSubmit,
  onBack,
}: LicenseCreationFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (updates: Partial<LicenseFormData>) => {
    const updatedData = { ...formData, ...updates };
    onChange(updatedData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-6 bg-[#1C1A11] gap-[60px] min-[2000px]:max-w-7xl">
      <TypesComponent
        text="LICENSE CREATION FORM"
        className="text-[#EFF4F6] text-[28px]"
      />

      <form onSubmit={handleSubmit} className="space-y-[40px] w-full">
        <div className="space-y-[40px] ">
          <div className="">
            <label className="font-Montesarrat text-[16px] font-normal min-[2000px]:text-4xl leading-[145%] tracking-[0.32px] text-[#FFF] mb-1">
              NFT ID
            </label>
            <Input
              value={formData.nftId}
              onChange={(e) => handleInputChange({ nftId: e.target.value })}
              className="md:w-2/4 text-[20px] min-[2000px]:text-2xl flex min-[2000px]:w-5/6 w-full mt-[6px] h-auto text-[#fff] p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15]"
            />
          </div>

          <div>
            <label className="font-Montesarrat text-[16px] font-normal min-[2000px]:text-4xl leading-[145%] tracking-[0.32px] text-[#FFF] mb-1">
              Royalty Rate
            </label>
            <Input
              type="number"
              placeholder="For example: 10%"
              value={formData.royaltyrate}
              onChange={(e) =>
                handleInputChange({
                  royaltyrate: Number(e.target.value),
                })
              }
              className="md:w-2/4 text-[20px] min-[2000px]:text-2xl flex min-[2000px]:w-5/6 w-full mt-[6px] h-auto text-[#fff] p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-Montesarrat text-[16px] font-normal min-[2000px]:text-4xl leading-[145%] tracking-[0.32px] text-[#FFF] mb-1">
                License Price
              </label>
              <Input
                type="number"
                value={formData.price.amount}
                onChange={(e) =>
                  handleInputChange({
                    price: {
                      ...formData.price,
                      amount: Number(e.target.value),
                    },
                  })
                }
                className="text-[16px] min-[2000px]:text-2xl flex min-[2000px]:w-5/6 w-full mt-[6px] h-auto text-[#fff]  p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15]"
              />
            </div>

            <div>
              <label className="font-Montesarrat text-[16px] font-normal min-[2000px]:text-4xl leading-[145%] tracking-[0.32px] text-[#FFF] mb-1">
                Currency
              </label>
              <select
                value={formData.price.currency}
                onChange={(e) =>
                  handleInputChange({
                    price: { ...formData.price, currency: e.target.value },
                  })
                }
                className="text-[16px] min-[2000px]:text-2xl flex min-[2000px]:w-5/6 w-full mt-[6px] h-auto text-[#fff] p-3  items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none  rounded-md focus:ring-1 focus:ring-[#FACC15]"
              >
                <option value="SLAW">SLAW</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-[10px] self-stretch items-start">
            <TypesComponent text="License Duration" className="text-[#fff]" />
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={() => handleInputChange({ durationType: "Permanent" })}
                className={`flex flex-col items-start hover:bg-[#F6E18B] hover:text-black bg-transparent rounded-[8px] border border-[#8A8A8A] p-4 h-[63px] ${
                  formData.durationType === "Permanent"
                    ? "bg-[#F6E18B] text-black "
                    : " bg-[transparent] text-white"
                }`}
              >
                <div className="text-left gap-[16px]">
                  <TypesComponent
                    className=" font-semibold"
                    text="None (Permanent)"
                  />
                  <p className="text-sm opacity-70">
                    This license will not expire.
                  </p>
                </div>
              </Button>

              <div className="flex flex-col gap-[16px]">
                <Button
                  type="button"
                  onClick={() => handleInputChange({ durationType: "Custom" })}
                  className={`flex flex-col items-start hover:bg-[#F6E18B] hover:text-black bg-transparent rounded-[8px] border border-[#8A8A8A] p-4 h-[63px] ${
                    formData.durationType === "Custom"
                      ? "bg-[#F6E18B] text-black"
                      : "bg-[transparent]  text-white"
                  }`}
                >
                  <div className="text-left gap-[16px]">
                    <TypesComponent
                      className="font-semibold"
                      text="Set Custom Duration"
                    />
                    <p className="text-sm opacity-70">
                      Enter the number of days or blocks this license will
                      remain valid.
                    </p>
                  </div>
                </Button>
                {/* Custom Duration fields only show when selected */}
                {formData.durationType === "Custom" && (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-[10px]">
                      <TypesComponent
                        text="Select Duration"
                        className="text-[#fff]"
                      />
                      <div className="grid grid-cols-2 gap-4 text-black">
                        <Input
                          type="number"
                          placeholder="Duration"
                          value={formData.customDuration?.value || ""}
                          onChange={(e) =>
                            handleInputChange({
                              customDuration: {
                                ...formData.customDuration,
                                value: Number(e.target.value),
                              },
                            })
                          }
                          className="flex flex-col text-[#fff] items-start hover:bg-[#F6E18B]
                          hover:text-black
                          bg-transparent rounded-[8px] border border-[#8A8A8A] p-4 h-[24px]"
                        />
                        <select
                          value={formData.customDuration?.unit}
                          // onChange={(e) =>
                          //   handleInputChange({
                          //     customDuration: {
                          //       ...formData.customDuration,
                          //       unit: e.target.value as
                          //         | "days"
                          //         | "months"
                          //         | "years",
                          //     },
                          //   })
                          // }
                          className="bg-[transparent] hover:bg-[#F6E18B]
                          hover:text-black
                          border border-[#8A8A8A] text-white rounded-md p-2"
                        >
                          <option value="days">Days</option>
                          <option value="months">Months</option>
                          <option value="years">Years</option>
                        </select>
                      </div>
                    </div>

                    <h1 className="flex items-center justify-center text-[#fff]">
                      or
                    </h1>

                    <div className="flex flex-col gap-[10px]">
                      <TypesComponent
                        text="Enter the Expiration Date"
                        className="text-[#fff]"
                      />
                      <Input
                        type="date"
                        value={formData.customDuration?.expirationDate || ""}
                        // onChange={(e) =>
                        //   handleInputChange({
                        //     customDuration: {
                        //       ...formData.customDuration,
                        //       expirationDate: e.target.value,
                        //     },
                        //   })
                        // }
                        className="flex flex-col hover:bg-[#F6E18B] text-[#fff] hover:text-black bg-transparent rounded-[8px] items-start justify-center  border border-[#8A8A8A] p-4 h-[24px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[10px] self-stretch items-start">
            <TypesComponent text="Payment Structure" className="text-[#fff]" />
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={() => handleInputChange({ paymentType: "OneTime" })}
                className={`flex flex-col items-start hover:bg-[#F6E18B] hover:text-black bg-transparent rounded-[8px] border border-[#8A8A8A] p-4 h-[63px]  ${
                  formData.paymentType === "OneTime"
                    ? "bg-[#F6E18B] text-black"
                    : "bg-[transparent] text-white"
                }`}
              >
                <div className="text-left">
                  <TypesComponent
                    className="font-semibold"
                    text="One-Time Payment"
                  />
                  <p className="text-sm opacity-70">
                    A single upfront fee for the license.
                  </p>
                </div>
              </Button>

              <div className="flex flex-col gap-[16px]">
                <Button
                  type="button"
                  onClick={() =>
                    handleInputChange({ paymentType: "Recurring" })
                  }
                  className={`flex flex-col items-start hover:bg-[#F6E18B] bg-transparent hover:text-black rounded-[8px] border border-[#8A8A8A] p-4 h-[63px]  ${
                    formData.paymentType === "Recurring"
                      ? "bg-[#F6E18B] text-black"
                      : "bg-[transparent]  text-white"
                  }`}
                >
                  <div className="text-left ">
                    <TypesComponent
                      text="Recurring Payment"
                      className="font-semibold"
                    />
                    <p className="text-sm opacity-70">
                      Allows for ongoing payments, such as monthly or annual
                      fees.
                    </p>
                  </div>
                </Button>
                {/* Recurring payment field will only show when selected */}
                {formData.paymentType === "Recurring" && (
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={() =>
                          handleInputChange({
                            recurringPayment: { interval: "Monthly" },
                          })
                        }
                        className={`${
                          formData.recurringPayment?.interval === "Monthly"
                            ? "bg-[#F6E18B] text-black"
                            : "bg-[transparent] border border-[#8A8A8A] text-white hover:bg-[#F6E18B] hover:text-black"
                        }`}
                      >
                        Monthly
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          handleInputChange({
                            recurringPayment: { interval: "Quarterly" },
                          })
                        }
                        className={`${
                          formData.recurringPayment?.interval === "Quarterly"
                            ? "bg-[#F6E18B] text-black"
                            : "bg-[transparent] border border-[#8A8A8A] text-white hover:bg-[#F6E18B] hover:text-black"
                        }`}
                      >
                        Quarterly
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          handleInputChange({
                            recurringPayment: { interval: "Annually" },
                          })
                        }
                        className={`${
                          formData.recurringPayment?.interval === "Annually"
                            ? "bg-[#F6E18B] text-black"
                            : "bg-[transparent] border border-[#8A8A8A] text-white hover:bg-[#F6E18B] hover:text-black"
                        }`}
                      >
                        Annually
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            onClick={onBack}
            className=" bg-transparent rounded-[16px] px-[20px] py-[8px] w-[128px] items-center text-center min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl min-[2000px]:w-[200px] flex-shrink-0 border border-[#D0DFE4] text-[#D0DFE4] hover:bg-[#FACC15]  hover:text-[#1C1A11]"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="
            bg-[#D0DFE4] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#dcc87d] "
          >
            Next
          </Button>
        </div>

         {/* I am building a project that generates IP license with Next.Js, typescript and tailwind CSS. 

Note: user is also referred to as he.

From the first image (manage image), when the manage tab is clicked, an empty box is seen with: 'No License Created Yet'. When a user clicks on the button: 'Create License', he is taken to another page where the LicenseCreationForm (image attached) and License Sample Form (image attached) are filled. When the user fills the two forms (LicenseCreationForm and LicenseSampleForm) and clicks on the button: 'create', all inputs from the two forms are added and a license is created. This new license created, is then taken back to manage section and replaces where 'No License Created Yet' was. In addition, this manage tab on getting this new License also shows updates such as when any license will expire and also that a particular license with license type: example: Exclusive was just created. 

I will attach three codes: one for the manage section, second code for the second form containing the create button and the last code would be how the new License should be arranged after being created (last image attached). 
Please, guide me carefully on how I can make the new created License show on the manage section which is on a different page from License page. */} 
      </form>
    </div>
  );
}
