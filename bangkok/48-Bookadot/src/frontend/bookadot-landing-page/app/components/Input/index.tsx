import { Label, TextInput, TextInputProps } from "flowbite-react";
import { twMerge } from "tailwind-merge";

interface IInput extends TextInputProps {
  label?: string;
  errorMessage?: string;
}

const Input = ({ label, id, errorMessage, className, ...rest }: IInput) => {
  const isError = !!errorMessage;

  return (
    <div>
      {label && (
        <div className="mb-2 block">
          <Label htmlFor={label} value="Your email" />
        </div>
      )}

      <TextInput
        id={id}
        className={twMerge(
          "[&_input]:h-[46px] [&_input]:rounded-[15px] [&_input]:border-none [&_input]:!bg-foreground-color [&_input]:px-[18px] [&_input]:!placeholder-text-secondary-color [&_input]:[box-shadow:none!important] [&_input]:placeholder:font-light",
          className || "",
          isError && "",
        )}
        {...rest}
      />
      {isError && (
        <>
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            <span className="font-medium">{errorMessage}</span> Some error
            message.
          </p>
        </>
      )}
    </div>
  );
};

export default Input;
