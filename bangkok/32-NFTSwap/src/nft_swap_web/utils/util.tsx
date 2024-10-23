
export const hexCodeToString = (hexCodes: string): string => {
    let str = "";
    for (let i = 0; i < hexCodes.length; i += 2) {
      const hexCode = hexCodes.slice(i, i + 2);
      const charCode = parseInt(hexCode, 16);
      str += String.fromCharCode(charCode);
    }
    return str;
  };
  