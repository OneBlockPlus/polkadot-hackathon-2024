
export const  truncateText =(inputText : string | undefined, maxLength : number, starting :number, ending : number) => {
    //@ts-ignore
      if (inputText?.length <= maxLength) {
        // If the input text has 8 characters or less, return it as is.
        return inputText;
      } else {
        // Otherwise, truncate and format the text.
        const firstFourDigits = inputText?.slice(0, starting || 9);
        const lastFourDigits = inputText?.slice(-ending  || -6);
        return `${firstFourDigits}...${lastFourDigits}`;
      }
    }