function DepartmentButtons({ activeDept, onPress, transmitting }) {
  const commandBg = activeDept === 'buttonCommand' ? '#ffcf17' : '#BC9C1B';
  const operationsBg = activeDept === 'buttonOperations' ? '#ec1412' : '#9A2525';
  const scienceBg = activeDept === 'buttonScience' ? '#009df0' : '#166C9A';

  return (
    <div className="communicator-dept-buttons">
      <div className="communicator-button1">
        <div className="slant-bg" style={{ backgroundColor: commandBg }}></div>
        <div className="slant-button" onPointerDown={() => onPress('buttonCommand')} style={{ cursor: transmitting ? 'pointer' : 'default' }}></div>
      </div>
      <div className="communicator-button2">
        <div className="slant-bg" style={{ backgroundColor: operationsBg }}></div>
        <div className="slant-button" onPointerDown={() => onPress('buttonOperations')} style={{ cursor: transmitting ? 'pointer' : 'default' }}></div>
      </div>
      <div className="communicator-button3">
        <div className="slant-bg" style={{ backgroundColor: scienceBg }}></div>
        <div className="slant-button" onPointerDown={() => onPress('buttonScience')} style={{ cursor: transmitting ? 'pointer' : 'default' }}></div>
      </div>
    </div>
  );
}

export default DepartmentButtons;
