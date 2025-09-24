import React, { useEffect, useState } from "react";
import { Card, Form } from "react-bootstrap";

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
    <Card className="bg-dark text-white border-danger border-2">
      <Card.Body className="d-flex align-items-center justify-content-between">
        <div className="d-flex flex-column">
          <span className="fw-bold">Границы контейнеров</span>
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
      </Card.Body>
    </Card>
  );
};

export default BordersToggleCard;


