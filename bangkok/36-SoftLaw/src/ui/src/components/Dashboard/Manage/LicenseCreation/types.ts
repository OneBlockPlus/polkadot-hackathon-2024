export interface LicenseFormData {
  name?: string;
  description?: string;
  nftId: string;
  royaltyrate: number;
  price: {
    amount: number;
    currency: string;
  };
  licenseType: "Exclusive" | "Non-Exclusive";
  durationType: "Permanent" | "Custom";
  customDuration?: {
    value: number;
    unit?: "days" | "months" | "years";
    expirationDate?: string;
  };
  paymentType: "OneTime" | "Recurring";
  recurringPayment?: {
    interval: "Monthly" | "Quarterly" | "Annually";
  };
}
