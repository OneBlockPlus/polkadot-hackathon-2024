import { Dispatch, SetStateAction } from 'react';

const ColorPicker = ({ brandingColor, setBrandingColor }: { brandingColor: string; setBrandingColor: Dispatch<SetStateAction<string>> }) => {
  const colors = ['#4E46B4', '#7646B4', '#B446B0', '#AE2F2F', '#3B3B3C', '#B47B46', '#B4A946', '#63B446', '#46B4AD', '#4672B4'];

  return (
    <div className="flex gap-2">
      {colors.map((color) => (
        <div className={`h-10 w-10 p-[2px] rounded cursor-pointer bg-gohan ${color === brandingColor && 'border'}`} onClick={() => setBrandingColor(color)} style={{ borderColor: brandingColor }} key={color}>
          <div className="h-full w-full rounded" style={{ background: color, borderColor: brandingColor }}></div>
        </div>
      ))}
    </div>
  );
};

export default ColorPicker;
