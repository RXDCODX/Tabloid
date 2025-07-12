import React, { useState } from "react";
import { Button, ButtonGroup, Card, Col, Form, Row } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import { MetaInfoWithTimestamp } from "./types";

type MetaPanelProps = {
  setMeta: (meta: any) => void;
  meta: MetaInfoWithTimestamp;
};

const MetaPanel: React.FC<MetaPanelProps> = ({ setMeta, meta }) => {
  const [customFightRule, setCustomFightRule] = useState(meta.fightRule || "");

  const fightRules = ["FT1", "FT2", "FT3", "FT4", "FT5"];

  const handleFightRuleChange = (rule: string) => {
    setMeta({ fightRule: rule });
    if (fightRules.includes(rule)) {
      setCustomFightRule(""); // сбрасываем customFightRule
    } else {
      setCustomFightRule(rule);
    }
  };

  return (
    <Card
      className="shadow-lg p-4 mb-4"
      style={{
        background: "#1a1d23",
        borderRadius: 18,
        border: "2px solid #6f42c1",
      }}
    >
      <Card.Body>
        <div className="d-flex flex-column align-items-center mb-3 gap-2 text-center">
          <InfoCircle color="#6f42c1" size={22} />
          <span
            className="fw-bold text-uppercase"
            style={{ color: "#6f42c1", letterSpacing: 1 }}
          >
            Meta Panel
          </span>
        </div>
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="text-white fw-bold">
                Название турнира
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите название турнира"
                value={meta.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                style={{ fontSize: 16 }}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="text-white fw-bold">
                Режим драки
              </Form.Label>
              <div className="d-flex gap-2 flex-wrap mb-2 w-100">
                <ButtonGroup size="sm" className="w-100">
                  {fightRules.map((rule) => (
                    <Button
                      key={rule}
                      variant={
                        meta.fightRule === rule ? "primary" : "outline-primary"
                      }
                      onClick={() => handleFightRuleChange(rule)}
                      className="fw-bold"
                      style={{
                        minWidth: 60,
                        background:
                          meta.fightRule === rule ? "#0d6efd" : "transparent",
                        borderColor: "#0d6efd",
                      }}
                    >
                      {rule}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
              <div className="d-flex gap-2 flex-wrap w-100">
                <Button
                  variant={
                    !fightRules.includes(meta.fightRule)
                      ? "primary"
                      : "outline-primary"
                  }
                  onClick={() => handleFightRuleChange("Custom")}
                  className="fw-bold w-100"
                  style={{
                    minWidth: 100,
                    background: !fightRules.includes(meta.fightRule)
                      ? "#0d6efd"
                      : "transparent",
                    borderColor: "#0d6efd",
                  }}
                >
                  Custom
                </Button>
                {(meta.fightRule === "Custom" ||
                  !fightRules.includes(meta.fightRule)) && (
                  <Form.Control
                    type="text"
                    placeholder="Кастомный режим (например: FT10, BO3)"
                    value={customFightRule || ""}
                    onChange={(e) => {
                      setCustomFightRule(e.target.value);
                      setMeta({ fightRule: e.target.value });
                    }}
                    className="bg-dark text-warning border-warning border-2 fw-bold rounded-3 w-100"
                    style={{ fontSize: 14 }}
                  />
                )}
              </div>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default MetaPanel; 