import React from 'react';
import styled from 'styled-components';
import Range from 'rc-slider';
import 'rc-slider/assets/index.css';

const FilterBarContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 20px;
`;

const RangeValues = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    color: white;
`;

const FilterBar = ({ min, max, range, setRange }) => {
    const handleChange = (newRange) => {
        setRange(newRange);
    };

    return (
        <FilterBarContainer>
            <RangeValues>
                <span>Min: {range[0]}</span>
                <span>Max: {range[1]}</span>
            </RangeValues>
            <Range
                min={min}
                max={max}
                value={range}
                onChange={handleChange}
                allowCross={false}
                trackStyle={[{ backgroundColor: 'white' }]}
                handleStyle={[
                    { borderColor: 'white' },
                    { borderColor: 'white' },
                ]}
            />
        </FilterBarContainer>
    );
};

export default FilterBar;
