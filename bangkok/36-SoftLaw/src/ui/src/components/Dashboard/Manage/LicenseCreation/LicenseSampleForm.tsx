import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LicenseFormData } from "./types";
import AlertDialog from "./AlertDialogue";
import TypesComponent from "@/components/TypesProps";

interface LicenseSampleFormProps {
  formData: LicenseFormData;
  onSubmit: (data: LicenseFormData) => void;
  onBack: () => void;
  onChange: (data: LicenseFormData) => void;
}

export function LicenseSampleForm({
  formData,
  onSubmit,
  onChange,
  onBack,
}: LicenseSampleFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (updates: Partial<LicenseFormData>) => {
    const updatedData = { ...formData, ...updates };
    onChange(updatedData);
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    onSubmit(formData);
  };

  return (
    <div>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-6 bg-[#1C1A11] gap-[60px] min-[2000px]:max-w-7xl">
        <TypesComponent
          text="LICENSE CREATION FORM"
          className="text-[#EFF4F6] text-[28px]"
        />

        <form onSubmit={handleSubmit} className="space-y-[40px] w-full">
          {/* Display selection from the last form */}
          <div className="bg-[transparent]  rounded-md items-start text-[#fff] space-y-[10px]">
            <p>NFT ID: {formData.nftId}</p>
            <p>
              License Price: {formData.price.amount} {formData.price.currency}
            </p>
            <p>
              Royalty Rate: {formData.royaltyrate}%
            </p>
          </div>

          {/* License Type Selection */}
          <div className="flex flex-col gap-[10px]">
            <TypesComponent text="Type of License" className="text-[#EFF4F6]" />
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-md cursor-pointer ${
                  formData.licenseType === "Exclusive"
                    ? "border-[#F6E18B]"
                    : "border-[#373737]"
                } border`}
                onClick={() =>
                  handleInputChange({ ...formData, licenseType: "Exclusive" })
                }
              >
                <TypesComponent
                  text="An Exclusive License"
                  className="font-semibold text-[#FFF]"
                />
                <p className="text-[16px] text-[#fff]">
                  Restricts usage rights to a single licensee. No other person
                  or entity, including the owner, can license this NFT to others
                  for the license.
                </p>
              </div>

              <div
                className={`p-4 rounded-md cursor-pointer space-y-[10px] ${
                  formData.licenseType === "Non-Exclusive"
                    ? "border-[#F6E18B]"
                    : "border-[#373737]"
                } border`}
                onClick={() =>
                  handleInputChange({
                    ...formData,
                    licenseType: "Non-Exclusive",
                  })
                }
              >
                <TypesComponent
                  text="An Non-Exclusive License"
                  className="font-semibold text-[#FFF]"
                />
                <p className="text-sm text-[#fff]">
                  Allows multiple licensees to use the NFT at the same time. The
                  owner can issue the same license to other buyers.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[transparent]  rounded-md items-start text-[#fff] space-y-[10px]">
          

            {formData.durationType === "Permanent" && (
              <p>License Duration: Permanent</p>
            )}

            {formData.durationType === "Custom" && (
              <div className="flex flex-col gap-[8px]">
                <p>
                  License Duration (Custom) : {formData.customDuration?.value}{" "}
                  {formData.customDuration?.unit}
                </p>
                <p>
                  Expiration Date: {formData.customDuration?.expirationDate}
                </p>
              </div>
            )}

            {formData.paymentType === "OneTime" && (
              <p>Payment Type: One-Time Payment</p>
            )}
            {formData.paymentType === "Recurring" && (
              <div className="flex flex-col gap-[8px]">
                <p>Payment Type: Recurring </p>
                <p>Payment Interval: {formData.recurringPayment?.interval}</p>
              </div>
            )}
          </div>
         

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              onClick={onBack}
              className="bg-transparent rounded-[16px] px-[20px] py-[8px] w-[128px] items-center text-center min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl min-[2000px]:w-[200px] flex-shrink-0 border border-[#D0DFE4] text-[#D0DFE4] hover:bg-[#F6E18B]  hover:text-[#1C1A11]"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-[#D0DFE4] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#F6E18B] "
            >
              Create
            </Button>
          </div>
        </form>
      </div>


      <AlertDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirm}
        title="Confirm License Creation"
        description="Please review your answers carefully. Once created, the license details cannot be edited."
        confirmText="Create License"
        cancelText="Review Again"
      />
    </div>
  );
}


