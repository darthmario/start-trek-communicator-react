import { useState, useCallback } from 'react';
import { characterNames, departmentNames } from '../../data/characters';
import './Preferences.css';

const DEFAULT_PREFS = {
  titleToggle: true,
  uhuraToggle: true,
  chekovToggle: true,
  pikeToggle: true,
  guardianToggle: true,
  suluToggle: true,
  scottyToggle: true,
  nomadToggle: true,
  zephramToggle: true,
  bonesToggle: true,
  spockToggle: true,
  computerToggle: true,
  sarekToggle: true,
  chapelToggle: true
};

function loadPrefs() {
  try {
    const stored = JSON.parse(localStorage.getItem('stComPrefs'));
    if (stored) return { ...DEFAULT_PREFS, ...stored };
  } catch (e) { /* ignore */ }
  return { ...DEFAULT_PREFS };
}

function savePrefs(prefs) {
  localStorage.setItem('stComPrefs', JSON.stringify(prefs));
}

function Preferences({ onBack }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [openDepts, setOpenDepts] = useState({});

  const togglePref = useCallback((key) => {
    setPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      savePrefs(updated);
      return updated;
    });
  }, []);

  const toggleDept = useCallback((dept) => {
    setOpenDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  }, []);

  const departments = [
    { key: 'buttonCommand', characters: characterNames.buttonCommand },
    { key: 'buttonOperations', characters: characterNames.buttonOperations },
    { key: 'buttonScience', characters: characterNames.buttonScience }
  ];

  return (
    <div className="preferences-scene">
      <button className="back-button back-button-prefs" onPointerDown={onBack}>{'\u25C0'}</button>

      <div className="prefs-header">
        <div className="prefs-title">Star Trek Communicator Preferences</div>
      </div>

      <div className="prefs-content">
        <div className="prefs-group">
          <div className="prefs-group-title">General Settings</div>
          <div className="prefs-row">
            <span className="prefs-label">Title Screen Audio</span>
            <button
              className={`toggle-btn ${prefs.titleToggle ? 'on' : 'off'}`}
              onClick={() => togglePref('titleToggle')}
            >
              {prefs.titleToggle ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        <div className="prefs-group">
          <div className="prefs-group-title">Characters</div>
          <div className="prefs-note">
            Note: You must have one character from each department set to &quot;On&quot;
          </div>

          {departments.map(dept => (
            <div key={dept.key}>
              <div
                className="prefs-dept-header"
                onClick={() => toggleDept(dept.key)}
              >
                <span>{departmentNames[dept.key]}</span>
                <span className="prefs-chevron">{openDepts[dept.key] ? '\u25B2' : '\u25BC'}</span>
              </div>

              {openDepts[dept.key] && (
                <div className="prefs-drawer">
                  {dept.characters.map(char => (
                    <div key={char.id} className="prefs-row prefs-char-row">
                      <span className="prefs-label">{char.name}</span>
                      <button
                        className={`toggle-btn ${prefs[char.id + 'Toggle'] ? 'on' : 'off'}`}
                        onClick={() => togglePref(char.id + 'Toggle')}
                      >
                        {prefs[char.id + 'Toggle'] ? 'On' : 'Off'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Preferences;
