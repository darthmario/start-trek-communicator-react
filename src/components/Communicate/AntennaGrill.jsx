function AntennaGrill({ open, onToggle }) {
  return (
    <div className="communicator-antenna-wrapper">
      <div
        className={`communicator-antenna${open ? ' open' : ''}`}
        onPointerDown={onToggle}
      ></div>
    </div>
  );
}

export default AntennaGrill;
