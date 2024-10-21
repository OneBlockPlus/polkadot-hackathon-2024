"use client";
import { Accordion } from "flowbite-react";
import { BsFileEarmarkArrowDownFill } from "react-icons/bs";
import { twMerge } from "tailwind-merge";

const ArrowIcon = (props: any) => {
  console.log(props);
  return <>Hello</>;
};

interface AccordionProps {
  items: Array<{
    title: React.ReactNode;
    content: React.ReactNode;
  }>;
}

const _Accordion = ({ items }: AccordionProps) => {
  return (
    <>
      <Accordion
        arrowIcon={(props) => (
          <svg
            width="13"
            height="11"
            viewBox="0 0 13 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
          >
            <path
              d="M5.63398 10C6.01888 10.6667 6.98113 10.6667 7.36603 10L12.1292 1.75C12.5141 1.08333 12.0329 0.25 11.2631 0.25H1.73686C0.967059 0.25 0.485935 1.08333 0.870835 1.75L5.63398 10Z"
              fill="white"
            />
          </svg>
        )}
        collapseAll
        alwaysOpen
        className="border-none [&_[hidden]]:!block [&_[hidden]]:!max-h-0"
      >
        {items.map(({ content, title }, index) => (
          <Accordion.Panel key={`accordion_${index}`}>
            <Accordion.Title
              theme={{
                arrow: {
                  base: "h-[11px] w-[13px]",
                },
                open: {
                  on: "!bg-hoverBg",
                },
              }}
              className="!rounded-none !border-t border-b-0 border-solid !border-border-color px-3 py-4 hover:!bg-hoverBg"
            >
              {title}
            </Accordion.Title>
            <Accordion.Content
              className={twMerge(
                "max-h-[10000px] overflow-hidden border-none !bg-transparent py-0 transition-all",
                "[&>*]:py-3",
              )}
              style={{
                transitionDuration: "800ms",
              }}
            >
              {content}
            </Accordion.Content>
          </Accordion.Panel>
        ))}
      </Accordion>
    </>
  );
};

export default _Accordion;
