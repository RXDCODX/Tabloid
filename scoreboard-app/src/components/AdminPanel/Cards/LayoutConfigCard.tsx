import React, { useCallback } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { Columns } from 'react-bootstrap-icons';
import { LayoutConfig } from '../../../types/types';
import styles from './LayoutConfigCard.module.scss';

type Props = {
  layoutConfig: LayoutConfig;
  onChange: (next: LayoutConfig) => void;
};

const blocks: Array<{ key: keyof LayoutConfig; title: string }> = [
  { key: 'center', title: 'Заголовок турнира' },
  { key: 'left', title: 'Игрок 1' },
  { key: 'right', title: 'Игрок 2' },
  { key: 'fightMode', title: 'Режим боя' },
];

const fields: Array<{
  key: 'top' | 'left' | 'right' | 'width' | 'height';
  label: string;
  placeholder: string;
}> = [
  { key: 'top', label: 'Top', placeholder: 'например: 15px или 10%' },
  { key: 'left', label: 'Left', placeholder: 'например: 167px или 5%' },
  { key: 'right', label: 'Right', placeholder: 'например: 167px или 5%' },
  { key: 'width', label: 'Width', placeholder: 'например: 540px или 50%' },
  { key: 'height', label: 'Height', placeholder: 'например: 120px или 10%' },
];

const LayoutConfigCard: React.FC<Props> = ({ layoutConfig, onChange }) => {
  const handleChange = useCallback(
    (
      block: keyof LayoutConfig,
      field: 'top' | 'left' | 'right' | 'width' | 'height',
      value: string
    ) => {
      const next: LayoutConfig = {
        ...layoutConfig,
        [block]: {
          ...layoutConfig[block],
          [field]: value,
        },
      };
      onChange(next);
    },
    [layoutConfig, onChange]
  );

  return (
    <Card
      className={`mb-4 bg-dark text-white border-primary border-2 p-3 ${styles.layoutConfigCard}`}
    >
      <div className={styles.cardHeader}>
        <Columns color='#6f42c1' size={22} />
        <span className={styles.cardTitle}>Layout</span>
      </div>
      <Card.Body>
        {blocks.map(({ key, title }) => (
          <div key={key} className='mb-3'>
            <h6 className='mb-2 text-center'>{title}</h6>
            {/* Row 1: Top, Left, Right */}
            <Row className='g-2 justify-content-center'>
              {fields
                .filter(f => ['top', 'left', 'right'].includes(f.key))
                .map(({ key: fkey, label, placeholder }) => (
                  <Col
                    xs={12}
                    md={6}
                    lg={4}
                    key={fkey}
                    className='d-flex justify-content-center'
                  >
                    <Form.Group
                      controlId={`${String(key)}-${fkey}`}
                      className={`w-100 text-center ${styles.fieldBox} ${styles[fkey]}`}
                    >
                      <Form.Label className='mb-1 text-white text-center'>
                        {label}
                      </Form.Label>
                      <Form.Control
                        type='text'
                        className='bg-dark text-white border-secondary text-center'
                        value={layoutConfig[key]?.[fkey] ?? ''}
                        onChange={e => handleChange(key, fkey, e.target.value)}
                        placeholder={placeholder}
                      />
                    </Form.Group>
                  </Col>
                ))}
            </Row>
            {/* Row 2: Width, Height */}
            <Row className='g-2 justify-content-center mt-2'>
              {fields
                .filter(f => ['width', 'height'].includes(f.key))
                .map(({ key: fkey, label, placeholder }) => (
                  <Col
                    xs={12}
                    md={6}
                    lg={4}
                    key={fkey}
                    className='d-flex justify-content-center'
                  >
                    <Form.Group
                      controlId={`${String(key)}-${fkey}`}
                      className={`w-100 text-center ${styles.fieldBox} ${styles[fkey]}`}
                    >
                      <Form.Label className='mb-1 text-white text-center'>
                        {label}
                      </Form.Label>
                      <Form.Control
                        type='text'
                        className='bg-dark text-white border-secondary text-center'
                        value={layoutConfig[key]?.[fkey] ?? ''}
                        onChange={e => handleChange(key, fkey, e.target.value)}
                        placeholder={placeholder}
                      />
                    </Form.Group>
                  </Col>
                ))}
            </Row>
          </div>
        ))}
        <div className='d-flex align-items-center justify-content-center mb-2'>
          <small className='text-secondary'>px или % (до 100%)</small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LayoutConfigCard;
