import React from 'react'
import styled from 'styled-components'

const DatasetGrid = styled.div.attrs({ className: 'dataset-grid' })`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 20px 0 0 0;
`

const DatasetCard = styled.div.attrs({ className: 'dataset-card' })`
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
    max-height: 150px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &:hover {
        transform: scale(1.01);
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    }
`

const DatasetHeader = styled.div.attrs({ className: 'dataset-header' })`
    font-weight: 700;
    font-size: 18px;
    line-height: 1;
    color: var(--primary-color);
`

const DatasetDescription = styled.p.attrs({ className: 'dataset-description' })`
    font-size: 16px;
    line-height: 1;
    color: black;
    margin: 10px 0 0 0;
`

const truncateText = (txt, len) =>
    txt && txt.length > len ? txt.slice(0, len) + '...' : txt

const DatasetBubble = ({ datasets }) => {
    return (
        <DatasetGrid>
            {datasets.map((dataset, index) => (
                <DatasetCard
                    key={index}
                    onClick={() => window.open(dataset.link, '_blank')}
                >
                    <DatasetHeader>
                        {truncateText(dataset.title, 50)}
                    </DatasetHeader>
                    <DatasetDescription>
                        {dataset.description
                            ? truncateText(dataset.description, 150)
                            : 'No description available.'}
                    </DatasetDescription>
                    {/* <DatasetInfo>
                        By {dataset.contributor} on {dataset.date}
                    </DatasetInfo> */}
                </DatasetCard>
            ))}
        </DatasetGrid>
    )
}

export default DatasetBubble