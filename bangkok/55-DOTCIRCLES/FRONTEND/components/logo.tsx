export default function HexagonLogo() {
  return (
    <>
      <div className="hexagon-container">
        <div className="hexagon">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            {/* Include all lines with the respective coordinates and styling */}
            <line x1="50" y1="1" x2="95" y2="25" stroke="pink" />
            <line x1="50" y1="1" x2="95" y2="75" stroke="pink" />
            <line x1="50" y1="1" x2="50" y2="99" stroke="pink" />
            <line x1="50" y1="1" x2="5" y2="75" stroke="pink" />
            <line x1="50" y1="1" x2="5" y2="25" stroke="pink" />
            <line x1="95" y1="25" x2="95" y2="75" stroke="pink" />
            <line x1="95" y1="25" x2="50" y2="99" stroke="pink" />
            <line x1="95" y1="25" x2="5" y2="75" stroke="pink" />
            <line x1="95" y1="25" x2="5" y2="25" stroke="pink" />
            <line x1="95" y1="75" x2="50" y2="99" stroke="pink" />
            <line x1="95" y1="75" x2="5" y2="75" stroke="pink" />
            <line x1="95" y1="75" x2="5" y2="25" stroke="pink" />
            <line x1="50" y1="99" x2="5" y2="75" stroke="pink" />
            <line x1="50" y1="99" x2="5" y2="25" stroke="pink" />
            <line x1="5" y1="75" x2="5" y2="25" stroke="pink" />
          </svg>
        </div>
      </div>
    </>
  );
}
