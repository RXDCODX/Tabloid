import React from "react";
import { Button, Stack } from "react-bootstrap";
import { ArrowLeftRight, ArrowRepeat } from "react-bootstrap-icons";

type ActionButtonsProps = {
  onSwapNames: () => void;
  onSwapPlayers: () => void;
  onReset: () => void;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSwapNames,
  onSwapPlayers,
  onReset,
}) => (
  <Stack gap={3} className="w-100 w-md-auto align-items-center">
    <Button
      variant="info"
      className="fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container"
      style={{
        fontSize: 18,
        background: "#0dcaf0",
        border: "none",
        boxShadow: "0 2px 8px #0dcaf055",
        position: "relative",
      }}
      onClick={onSwapNames}
      title="Поменять имена"
    >
      <ArrowLeftRight /> Name
    </Button>
    <Button
      variant="info"
      className="fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container"
      style={{
        fontSize: 18,
        background: "#0dcaf0",
        border: "none",
        boxShadow: "0 2px 8px #0dcaf055",
        position: "relative",
      }}
      onClick={onSwapPlayers}
      title="Поменять игроков местами"
    >
      <ArrowLeftRight /> All
    </Button>
    <Button
      variant="danger"
      className="fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container"
      style={{
        fontSize: 18,
        background: "#dc3545",
        border: "none",
        boxShadow: "0 2px 8px #dc354555",
        position: "relative",
      }}
      onClick={onReset}
      title="Сбросить всё"
    >
      <ArrowRepeat /> Reset
    </Button>
  </Stack>
);

export default ActionButtons; 