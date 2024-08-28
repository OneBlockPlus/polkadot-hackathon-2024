const LoadingOverlay = () => {
  const spinnerStyle = {
    width: "5rem",
    height: "5rem",
    border: "0.5rem solid blue",
    borderTop: "0.5rem solid transparent",
    borderRight: "0.5rem solid transparent",
    borderRadius: "50%",
    animation: "spin 1.5s linear infinite",
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  };
  return (
    <div style={overlayStyle}>
      <div style={spinnerStyle}></div>
      <style>
        {`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}
      </style>
    </div>
  );
};

export default LoadingOverlay;
