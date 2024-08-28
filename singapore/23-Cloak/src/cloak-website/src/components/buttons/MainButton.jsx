import React from 'react'
import './GithubButton.css'

const MainButton = ({
    onClick,
    buttonText
}) => {
    return (
        <button className="button" onClick={onClick}>
            <p className="text">
                {buttonText}
            </p>
        </button>
    )
}

export default MainButton
