import {
  Select as FlowbiteSelect,
  SelectProps,
  Dropdown,
  DropdownProps,
} from "flowbite-react";
import Typography from "../Typography";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

interface ISelect extends Omit<DropdownProps, "label"> {
  options: Array<{ label: React.ReactNode; value: any }>;
  placeholder?: string;
  icon?: React.ReactNode;
  width?: number;
}

const Select = ({
  options,
  placeholder,
  value,
  icon,
  width,
  onChange,
  ...rest
}: ISelect) => {
  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  const handleChange = (value: any) => {
    console.log(value);
    onChange && onChange(value);
  };

  return (
    <div
      className={twMerge(
        "[&>button:focus]:!ring-1 [&>button:hover]:!ring-1 [&>button]:rounded-[15px] [&>button]:!bg-foreground-color [&>button]:!ring-accent-color [&>button_span]:w-full",
        width && `w-[${width}px] [&>button]:w-full`,
        !selectedOption && "[&_p]:text-text-secondary-color",
      )}
    >
      <Dropdown
        label={
          <div className="flex w-full items-center justify-between">
            <Typography className="">
              {selectedOption ? selectedOption.label : placeholder}
            </Typography>
            {icon}
          </div>
        }
        arrowIcon={false}
        theme={{
          floating: {
            base: "z-[1] rounded-lg !bg-foreground-color",
            content: "!bg-foreground-color",
          },
        }}
        value={value}
        //   className="w-[300px]"
      >
        {options.map((option) => (
          <Dropdown.Item
            key={option.value}
            onClick={() => {
              handleChange(option.value);
            }}
            accessKey={option.value}
            className={twMerge(
              "hover:!bg-accent-color",
              option.value === value && "rounded-sm bg-accent-color",
            )}
          >
            {option.label}
          </Dropdown.Item>
        ))}
        {/* <Dropdown.Item>Dashboard</Dropdown.Item>
      <Dropdown.Item>Settings</Dropdown.Item>
      <Dropdown.Item>Earnings</Dropdown.Item>
      <Dropdown.Item>Sign out</Dropdown.Item> */}
      </Dropdown>
    </div>
  );
};

export default Select;
