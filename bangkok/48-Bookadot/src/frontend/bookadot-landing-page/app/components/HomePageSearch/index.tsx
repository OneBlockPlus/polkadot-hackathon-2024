import {useState} from "react";
import Datepicker from "../DatePicker";
import Select from "../Select";
import {Film, Marker} from "../Icon";
import dayjs from "dayjs";

const HomePageSearch = () => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [location, setLocation] = useState(undefined);
    const [ticketType, setTicketType] = useState(undefined);

    return (
        <div className="flex items-center gap-2">
            <Select
                placeholder="Ticket type"
                options={[
                    {
                        label: "Cinema",
                        value: "cinema",
                    },
                    {
                        label: "Concert",
                        value: "concert",
                    },
                    {
                        label: "Travel",
                        value: "travel",
                    },
                ]}
                width={160}
                onChange={(v) => {
                    setTicketType(v as any);
                    //
                }}
                value={ticketType}
                icon={<Film/>}
            />
            <Datepicker
                value={date ? dayjs(date).toDate() : undefined}
                placeholder="Select a date..."
            />
            <Select
                placeholder="Location"
                options={[
                    {
                        label: "Prishtina",
                        value: "131",
                    },
                    {
                        label: "Viet Nam",
                        value: "xxx",
                    },
                ]}
                width={160}
                onChange={(v) => {
                    setLocation(v as any);
                }}
                value={location}
                icon={<Marker/>}
            />
        </div>
    );
};

export default HomePageSearch;
