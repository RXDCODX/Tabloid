import React from "react";
import { Button, Stack } from "react-bootstrap";
import { ArrowLeftRight, ArrowRepeat } from "react-bootstrap-icons";
import styles from "./ActionButtons.module.scss";

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
  <Stack gap={3} className={`${styles.actionButtons} w-100 w-md-auto align-items-center`}>
    <Button
      variant="info"
      className={`${styles.actionButton} ${styles.swapButton} fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container`}
      onClick={onSwapNames}
      title="Поменять имена"
    >
      <ArrowLeftRight /> Name
    </Button>
    <Button
      variant="info"
      className={`${styles.actionButton} ${styles.swapButton} fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container`}
      onClick={onSwapPlayers}
      title="Поменять игроков местами"
    >
      <ArrowLeftRight /> All
    </Button>
    <Button
      variant="danger"
      className={`${styles.actionButton} ${styles.resetButton} fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container`}
      onClick={onReset}
      title="Сбросить всё"
    >
      <ArrowRepeat /> Reset
    </Button>
  </Stack>
);

export default ActionButtons;
