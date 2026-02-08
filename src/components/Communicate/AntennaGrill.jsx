function AntennaGrill({ open, onToggle }) {
  return (
    <div
      className={`communicator-antenna${open ? ' open' : ''}`}
      onPointerDown={onToggle}
    ></div>
  );
}

export default AntennaGrill;
