import { SmallX } from "@/app/components/Icon";
import classNames from "classnames";
import { Children, useLayoutEffect, useState } from "react";

interface IBookingBoard {
    isPreviewMode: boolean;
    selectedPlaces: Array<number>;
    setSelectedPlaces: (places: Array<number>) => void;
    onClick?: (e: any) => void;
    className?: string;
    occupiedPlaces?: Array<number>;
    capacity?: number;
}

const BookingBoard = ({
    selectedPlaces,
    setSelectedPlaces,
    isPreviewMode,
    onClick,
    className,
    occupiedPlaces = [],
    capacity = 0,
}: IBookingBoard) => {
    const [scrollOffset, setScrollOffset] = useState(0);
    const [scrollContainer, setScrollContainer] = useState(0);
    const [scrollWidthContainer, setScrollWidthContainer] = useState(0);

    useLayoutEffect(() => {
        const seatContainer = document.getElementById(
            "bookingboard-selection-mode"
        );
        const handleScroll = (e: any) => {
            setScrollOffset(e.target.scrollLeft);
        };

        if (!isPreviewMode && seatContainer) {
            setScrollWidthContainer(seatContainer.scrollWidth);
            setScrollContainer(seatContainer.offsetWidth);
            seatContainer.addEventListener("scroll", handleScroll);
        }
    }, [isPreviewMode]);

    return (
        <>
            <div
                className={classNames("flex justify-center relative w-full cursor-pointer", className)}
                onClick={(e) => onClick?.(e)}
            >
                {!isPreviewMode && (
                    <>
                        {scrollOffset - 16 > 0 && <div className="left-gradient"></div>}

                        {scrollContainer + scrollOffset < scrollWidthContainer - 16 &&
                            scrollContainer < scrollWidthContainer && (
                                <div className="right-gradient"></div>
                            )}
                    </>
                )}

                <div
                    className={
                        isPreviewMode
                            ? "bookingboard-preview-mode"
                            : "bookingboard-selection-mode"
                    }
                    id={
                        isPreviewMode
                            ? "bookingboard-preview-mode"
                            : "bookingboard-selection-mode"
                    }
                >
                    {Children.toArray(new Array(capacity).fill(null).map((_, index) => (
                        <>
                            {occupiedPlaces.includes(index + 1) ? (
                                <div className="flex items-center justify-center cursor-not-allowed">
                                    <SmallX />
                                </div>
                            ) : (
                                <div
                                    key={`seat_${index + 1}`}
                                    className={`preview-item ${selectedPlaces.includes(index + 1) ? "choosen" : "available"
                                        }`}
                                    onClick={() => {
                                        if (!isPreviewMode) {
                                            const placesSet = new Set(selectedPlaces);
                                            if (placesSet.has(index + 1)) {
                                                placesSet.delete(index + 1);
                                            } else {
                                                placesSet.add(index + 1);
                                            }
                                            console.log(Array.from(placesSet));
                                            setSelectedPlaces(Array.from(placesSet));
                                        }
                                    }}
                                >
                                    {!isPreviewMode && <>{index + 1}</>}
                                </div>
                            )}
                        </>
                    )))}
                </div>
            </div>
        </>
    );
};

export default BookingBoard;