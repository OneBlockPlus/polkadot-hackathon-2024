/* eslint-disable react/display-name */
import { useState, forwardRef } from "react";

const Input = forwardRef(({ label, id, type = "text", style, placeholder, error, ...rest }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value !== "");
  };

  return (
    <div className="" style={style}>
      {/* <label htmlFor={id} className="w-full h-5 font-medium text-sm text-[#000] ">
        {label}
      </label> */}
      <div className="relative rounded-md z-0 w-full bg-white border border-blue-500">
        <input
          type={type}
          id={id}
          ref={ref}
          style={style}
          className={`block my-3 p-4 w-full text-base font-normal text-[#000] bg-transparent appearance-none focus:outline-none focus:ring-0 peer ${
            isFocused || hasValue ? "pt-4" : ""
          } ${error ? "border-red-500" : ""}`}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
      </div>
      {error && <p className="text-red-500 text-sm -mt-3">{error}</p>}
    </div>
  );
});

export default Input;
