import React from 'react';
import { Offcanvas, Form } from 'react-bootstrap';

const SideMenu = ({
  show,
  onClose,
  settings,
  onChange,
}) => {
  const update = (key, value) => onChange({ ...settings, [key]: value });

  return (
    <Offcanvas show={show} onHide={onClose} placement="start" className="side-menu">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Settings</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="side-menu__section">
          <div className="side-menu__section-title">Graph</div>
          <Form.Group className="side-menu__field">
            <Form.Label>Precision (ms)</Form.Label>
            <Form.Select
              value={settings.precisionMs}
              onChange={(event) => update('precisionMs', Number(event.target.value))}
            >
              {[20, 25, 50, 100, 200, 300, 500, 750, 1000].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="side-menu__field">
            <Form.Label>Line Width (s)</Form.Label>
            <Form.Select
              value={settings.graphLineWidth}
              onChange={(event) => update('graphLineWidth', Number(event.target.value))}
            >
              {[5, 15, 30, 45, 60].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="side-menu__field">
            <Form.Label>Show Markers</Form.Label>
            <Form.Select
              value={settings.graphMarkers ? 'true' : 'false'}
              onChange={(event) => update('graphMarkers', event.target.value === 'true')}
            >
              <option value="false">False</option>
              <option value="true">True</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="side-menu__field">
            <Form.Label>Tick Gap (Hz)</Form.Label>
            <Form.Select
              value={settings.graphTickGap}
              onChange={(event) => update('graphTickGap', Number(event.target.value))}
            >
              {[10, 20, 25, 50].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="side-menu__field">
            <Form.Label>Height (px)</Form.Label>
            <Form.Select
              value={settings.graphLineHeight}
              onChange={(event) => update('graphLineHeight', Number(event.target.value))}
            >
              {[50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="side-menu__field">
            <Form.Label>Lower (Hz)</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={300}
              value={settings.graphLower}
              onChange={(event) => update('graphLower', Number(event.target.value))}
            />
          </Form.Group>
          <Form.Group className="side-menu__field">
            <Form.Label>Upper (Hz)</Form.Label>
            <Form.Control
              type="number"
              min={settings.graphLower}
              max={500}
              value={settings.graphUpper}
              onChange={(event) => update('graphUpper', Number(event.target.value))}
            />
          </Form.Group>
          <Form.Group className="side-menu__field">
            <Form.Check
              type="switch"
              label="Show 0.1s Avg"
              checked={settings.showAvg01}
              onChange={(event) => update('showAvg01', event.target.checked)}
            />
            <Form.Check
              type="switch"
              label="Show 1s Avg"
              checked={settings.showAvg1}
              onChange={(event) => update('showAvg1', event.target.checked)}
            />
            <Form.Check
              type="switch"
              label="Show 3s Avg"
              checked={settings.showAvg3}
              onChange={(event) => update('showAvg3', event.target.checked)}
            />
            <Form.Check
              type="switch"
              label="Show 10s Avg"
              checked={settings.showAvg10}
              onChange={(event) => update('showAvg10', event.target.checked)}
            />
          </Form.Group>
        </div>

        <div className="side-menu__section">
          <div className="side-menu__section-title">Pitch</div>
          <Form.Group className="side-menu__field">
            <Form.Label>Lower Bound (Hz)</Form.Label>
            <Form.Select
              value={settings.pitchLowerBound ?? 'none'}
              onChange={(event) =>
                update('pitchLowerBound', event.target.value === 'none' ? null : Number(event.target.value))
              }
            >
              <option value="none">None</option>
              {Array.from({ length: 300 }, (_, idx) => idx + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="side-menu__field">
            <Form.Label>Upper Bound (Hz)</Form.Label>
            <Form.Select
              value={settings.pitchUpperBound ?? 'none'}
              onChange={(event) =>
                update('pitchUpperBound', event.target.value === 'none' ? null : Number(event.target.value))
              }
            >
              <option value="none">None</option>
              {Array.from({ length: 500 }, (_, idx) => idx + 1)
                .filter((value) => (settings.pitchLowerBound != null ? value >= settings.pitchLowerBound : value >= 1))
                .map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default SideMenu;
