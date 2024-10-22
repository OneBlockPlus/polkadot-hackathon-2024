import { Textarea as FlowbiteReact, TextareaProps } from "flowbite-react";
import { twMerge } from "tailwind-merge";

interface ITextArea
  extends TextareaProps,
    Omit<
      React.DetailedHTMLProps<
        React.TextareaHTMLAttributes<HTMLTextAreaElement>,
        HTMLTextAreaElement
      >,
      "color"
    > {
  errorMessage?: string;
}

const TextArea = ({ errorMessage, className, ...rest }: ITextArea) => {
  return (
    <>
      <FlowbiteReact
        className={twMerge(
          "rounded-[15px] border-none !bg-foreground-color p-[18px] !placeholder-text-secondary-color [box-shadow:none!important] placeholder:font-light",
          className,
        )}
        {...rest}
      />
    </>
  );
};

export default TextArea;
