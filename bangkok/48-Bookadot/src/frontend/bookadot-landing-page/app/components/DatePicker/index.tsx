"use client";
import {
  DatepickerProps,
  Datepicker as FlowbiteDatePicker,
} from "flowbite-react";
import { Calendar } from "../Icon";

interface IDatePickerProps extends DatepickerProps {}

function Datepicker({ ...rest }: IDatePickerProps) {
  return (
    <FlowbiteDatePicker
      datepicker-format="mm/dd/yyyy"
      rightIcon={(props) => <Calendar {...props} />}
      className="w-[160px] [&_input]:!bg-foreground-color  [&_input]:!ring-accent-color"
      //
      theme={{
        popup: {
          root: {
            base: "absolute z-[1] mt-2 w-[272px] rounded-[8px] bg-foreground-color p-1",
            inline: "bg-foreground-color",
            inner: "bg-foreground-color",
          },
          footer: {
            base: "hidden",
          },
          header: {
            selectors: {
              button: {
                next: "!bg-foreground-color shadow-[transparent!important] hover:!bg-accent-color",
                prev: "!bg-foreground-color shadow-[transparent!important] hover:!bg-accent-color",
                view: "!bg-foreground-color shadow-[transparent!important] hover:!bg-accent-color",
              },
            },
          },
        },
        root: {
          input: {
            field: {
              input: {
                base: "h-[46px] w-full !rounded-[15px] !border-none !pl-3",
              },
              icon: {
                svg: "hidden",
              },
            },
          },
        },
        views: {
          days: {
            items: {
              item: {
                selected: "bg-accent-color",
              },
            },
          },
          months: {
            items: {
              item: {
                selected: "bg-accent-color",
              },
            },
          },
          years: {
            items: {
              item: {
                selected: "bg-accent-color",
              },
            },
          },
          decades: {
            items: {
              item: {
                selected: "bg-accent-color",
              },
            },
          },
        },
      }}
      {...rest}
    />
  );
}

export default Datepicker;
