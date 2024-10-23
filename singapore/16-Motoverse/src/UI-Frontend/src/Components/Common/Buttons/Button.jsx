const Button = ({ cta = "Submit", purpose = "submit", onClick, onSubmit, Style }) => {
    return (
      <div className="flex justify-center items-center">
        <button
          className={`bg-blue-500 rounded-full py-2 px-6 text-center font-bold text-sm text-white ${Style}`}
          type={purpose}
          // onClick={direction}
          onClick={onClick} // Handles click events
          onSubmit={onSubmit} // Handles form submissions
        >
          {cta}
        </button>
      </div>
    );
  };
  
  export default Button;
  