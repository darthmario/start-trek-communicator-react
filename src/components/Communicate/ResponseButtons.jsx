function ResponseButtons({ onPress, transmitting }) {
  return (
    <>
      <div
        className="standard-button communicator-std-btn1"
        onPointerDown={() => onPress('negative')}
        style={{ cursor: transmitting ? 'pointer' : 'default' }}
      ></div>
      <div
        className="standard-button communicator-std-btn2"
        onPointerDown={() => onPress('positive')}
        style={{ cursor: transmitting ? 'pointer' : 'default' }}
      ></div>
    </>
  );
}

export default ResponseButtons;
