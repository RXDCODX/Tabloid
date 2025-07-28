import React, { useState } from "react";
import { Button, ButtonGroup, Card, Form } from "react-bootstrap";
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
    if (fightRules.includes(rule) || rule === "None") {
      setCustomFightRule(""); // сбрасываем customFightRule
    } else {
      setCustomFightRule(rule);
    }
  };

  const handleCustomFightRuleChange = (value: string) => {
    setCustomFightRule(value);
    setMeta({ fightRule: value });
  };

  return (
    <Card
      className="shadow-lg p-3 mb-4"
      style={{
        background: "#1a1d23",
        borderRadius: 18,
        border: "2px solid #6f42c1",
        height: "100%", // Для выравнивания с VisibilityCard
      }}
    >
      <Card.Body className="d-flex flex-column h-100">
        <div className="d-flex flex-column align-items-center mb-3 gap-2 text-center">
          <InfoCircle color="#6f42c1" size={20} />
          <span
            className="fw-bold text-uppercase"
            style={{ color: "#6f42c1", letterSpacing: 1, fontSize: 14 }}
          >
            Meta Panel
          </span>
        </div>
        
        <div className="d-flex flex-column gap-3 flex-grow-1">
          <Form.Group>
            <Form.Label className="text-white fw-bold" style={{ fontSize: 12 }}>
              Название турнира
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите название турнира"
              value={meta.title}
              onChange={(e) => setMeta({ title: e.target.value })}
              className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
              style={{ fontSize: 14 }}
            />
          </Form.Group>
          
          <Form.Group>
            <Form.Label className="text-white fw-bold" style={{ fontSize: 12 }}>
              Режим драки
            </Form.Label>
            <div className="d-flex gap-1 flex-wrap mb-2">
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
                      minWidth: 50,
                      fontSize: 12,
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
            
            {/* Отдельный ряд для None */}
            <div className="d-flex gap-1 flex-wrap mb-2">
              <Button
                variant={
                  meta.fightRule === "None" ? "secondary" : "outline-secondary"
                }
                onClick={() => handleFightRuleChange("None")}
                className="fw-bold w-100"
                style={{
                  fontSize: 12,
                  background: meta.fightRule === "None" ? "#6c757d" : "transparent",
                  borderColor: "#6c757d",
                }}
              >
                None
              </Button>
            </div>
            
            <div className="d-flex flex-column gap-2">
              <Button
                variant={
                  meta.fightRule === "Custom" || (!fightRules.includes(meta.fightRule) && meta.fightRule !== "None")
                    ? "primary"
                    : "outline-primary"
                }
                onClick={() => handleFightRuleChange("Custom")}
                className="fw-bold w-100"
                style={{
                  fontSize: 12,
                  background: meta.fightRule === "Custom" || (!fightRules.includes(meta.fightRule) && meta.fightRule !== "None")
                    ? "#0d6efd"
                    : "transparent",
                  borderColor: "#0d6efd",
                }}
              >
                Custom
              </Button>
              {(meta.fightRule === "Custom" ||
                (customFightRule && !fightRules.includes(meta.fightRule) && meta.fightRule !== "None")) && (
                <Form.Control
                  type="text"
                  placeholder="Кастомный режим (например: FT10, BO3)"
                  value={customFightRule || ""}
                  onChange={(e) => handleCustomFightRuleChange(e.target.value)}
                  className="bg-dark text-warning border-warning border-2 fw-bold rounded-3"
                  style={{ fontSize: 12 }}
                />
              )}
            </div>
          </Form.Group>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MetaPanel; 