import React, { useEffect, useState } from "react";
import { Card, Form } from "react-bootstrap";
import { BoundingBox } from "react-bootstrap-icons";

type BordersToggleCardProps = {
  initial?: boolean;
};

const BordersToggleCard: React.FC<BordersToggleCardProps> = ({ initial = false }) => {
  const [enabled, setEnabled] = useState<boolean>(initial);

  useEffect(() => {
    if (enabled) {
      document.body.classList.add('scoreboard-show-borders');
    } else {
      document.body.classList.remove('scoreboard-show-borders');
    }
  }, [enabled]);

  return (
    <Card className="bg-dark text-white border-danger border-2 w-100 p-3">
      <div className="d-flex flex-column align-items-center gap-2 text-center mb-2">
        <BoundingBox color="#dc3545" size={22} />
        <span className="fw-bold text-uppercase" style={{ color: '#dc3545', letterSpacing: 1 }}>Container Borders</span>
      </div>
      <div className="d-flex align-items-center justify-content-center">
        <div className="d-flex flex-column">
          <small className="text-secondary">Показать/скрыть вспомогательные границы</small>
        </div>
        <Form.Check
          type="switch"
          id="toggle-scoreboard-borders"
          className="ms-3"
          checked={enabled}
          onChange={(e) => setEnabled(e.currentTarget.checked)}
          label={enabled ? 'Включены' : 'Выключены'}
        />
      </div>
    </Card>
  );
};

export default BordersToggleCard;


