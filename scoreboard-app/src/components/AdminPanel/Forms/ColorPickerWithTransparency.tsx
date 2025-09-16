import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import styles from "./ColorPickerWithTransparency.module.scss";

type ColorPickerWithTransparencyProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const ColorPickerWithTransparency: React.FC<ColorPickerWithTransparencyProps> = ({
  value,
  onChange,
  placeholder = "hex или rgba"
}) => {
  const [isTransparent, setIsTransparent] = useState(false);

  // Функция для проверки, является ли цвет прозрачным
  const isTransparentColor = (color: string) => {
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba\([^)]+\)/);
      if (match) {
        const parts = match[0].match(/[\d.]+/g);
        if (parts && parts.length >= 4) {
          const alpha = parseFloat(parts[3]);
          return alpha === 0;
        }
      }
    }
    return false;
  };

  // Функция для установки прозрачного цвета
  const setTransparent = () => {
    onChange('rgba(255, 255, 255, 0)');
    setIsTransparent(true);
  };

  // Функция для установки непрозрачного цвета
  const setOpaque = () => {
    if (isTransparentColor(value)) {
      onChange('#ffffff');
    }
    setIsTransparent(false);
  };

  // Обработчик изменения цвета
  const handleColorChange = (newValue: string) => {
    onChange(newValue);
    setIsTransparent(isTransparentColor(newValue));
  };

  // Обработчик изменения текстового поля
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    handleColorChange(newValue);
  };

  // Обработчик изменения color picker
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    handleColorChange(newValue);
  };

  return (
    <div className={styles.colorPickerContainer}>
      <Form.Control
        type="color"
        value={isTransparent ? '#ffffff' : value}
        onChange={handleColorPickerChange}
        className={styles.colorInput}
      />
      <Form.Control
        type="text"
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        className={`${styles.textInput} bg-dark text-white border-primary border-2 fw-bold rounded-3`}
        style={{ fontSize: 12 }}
      />
      <Button
        variant={isTransparent ? "success" : "outline-secondary"}
        size="sm"
        onClick={isTransparent ? setOpaque : setTransparent}
        className={styles.transparencyButton}
        title={isTransparent ? "Сделать непрозрачным" : "Сделать прозрачным"}
      >
        {isTransparent ? <EyeSlash size={14} /> : <Eye size={14} />}
      </Button>
    </div>
  );
};

export default ColorPickerWithTransparency;
