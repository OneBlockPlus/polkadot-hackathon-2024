const Loader = ({ element, width = 50||'', height = 23, many = 1, loading = true }) => {
  if (loading) {
    let allElements = [];
    for (let i = 0; i < many; i++) {
      allElements.push(<div className="!rounded-moon-s-sm bg-gray-200 animate-pulse" key={i} style={{ width: width, height: height }}></div>);
    }
    return allElements;
  } else {
    return element;
  }
};

export default Loader;
