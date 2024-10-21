"use client";
import {
  DatepickerProps,
  Datepicker as FlowbiteDatePicker,
} from "flowbite-react";
import { Calendar } from "../Icon";
import Typography from "../Typography";
import dayjs from "dayjs";
import classNames from "classnames";
import { useState } from "react";

interface IDatePickerProps extends DatepickerProps {
}

function DatePicker({ ...rest }: IDatePickerProps) {
    const [isOpenCalendar, setIsOpenCalendar] = useState(false)

    return (
        <>
            <FlowbiteDatePicker
                className={classNames("absolute left-0 z-10", { 'hidden': !isOpenCalendar })}
                weekStart={1}
                minDate={dayjs().subtract(1, 'd').toDate()}
                maxDate={dayjs().add(1, 'd').toDate()}
                inline
                showTodayButton={false}
                showClearButton={false}
                {...rest}
                onSelectedDateChanged={(date) => {
                    rest.onSelectedDateChanged?.(date)
                    setIsOpenCalendar(false)
                }}                
            />
            <div onClick={() => setIsOpenCalendar(prev => !prev)} className="cursor-pointer flex flex-col items-center">
                <Calendar />
                <Typography
                    component="p"
                    className="text-sm font-bold pt-1"
                >{dayjs(rest.value as any || new Date()).format('MMM, DD')}</Typography>
            </div>
        </>
  );
}

export default DatePicker;
