import React, { memo, useCallback } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Columns, Mic } from 'react-bootstrap-icons';
import { useShallow } from 'zustand/react/shallow';
import { useAdminStore } from '../../../store/adminStateStore';
import { LayoutConfig } from '../../../types/types';
import styles from './LayoutConfigCard.module.scss';

type Props = {};

const blocks: Array<{ key: keyof LayoutConfig; title: string }> = [
  { key: 'center', title: 'Заголовок турнира' },
  { key: 'left', title: 'Игрок 1' },
  { key: 'right', title: 'Игрок 2' },
  { key: 'fightMode', title: 'Режим боя' },
  { key: 'commentator1', title: 'Комментатор 1' },
  { key: 'commentator2', title: 'Комментатор 2' },
  { key: 'commentator3', title: 'Комментатор 3' },
  { key: 'commentator4', title: 'Комментатор 4' },
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

const LayoutConfigCard: React.FC<Props> = () => {
  const layoutConfig = useAdminStore(useShallow(s => s.layoutConfig));

  const handleChange = useCallback(
    (
      block: keyof LayoutConfig,
      field: 'top' | 'left' | 'right' | 'width' | 'height',
      value: string
    ) => {
      const currentLayout = useAdminStore.getState().layoutConfig;
      const next: LayoutConfig = {
        ...currentLayout,
        [block]: {
          ...currentLayout[block],
          [field]: value,
        },
      };
      useAdminStore.getState().setLayoutConfig(next);
    },
    []
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
        {blocks.map(({ key, title }, idx) => {
          const isCommentatorBlock = key.startsWith('commentator');

          // Пропускаем комментаторов на этом уровне, их отрендерим отдельно
          if (isCommentatorBlock) {
            return null;
          }

          return (
            <div key={key}>
              <div className='mb-3'>
                <h6 className='mb-2 text-center'>{title}</h6>
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
                        <div
                          className={`w-100 text-center ${styles.fieldBox} ${styles[fkey]}`}
                        >
                          <label
                            htmlFor={`${String(key)}-${fkey}`}
                            className='mb-1 text-white text-center'
                          >
                            {label}
                          </label>
                          <input
                            id={`${String(key)}-${fkey}`}
                            type='text'
                            className='form-control form-control-sm bg-dark text-white border-secondary text-center'
                            value={layoutConfig[key]?.[fkey] ?? ''}
                            onChange={e =>
                              handleChange(key, fkey, e.target.value)
                            }
                            placeholder={placeholder}
                          />
                        </div>
                      </Col>
                    ))}
                </Row>
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
                        <div
                          className={`w-100 text-center ${styles.fieldBox} ${styles[fkey]}`}
                        >
                          <label
                            htmlFor={`${String(key)}-${fkey}`}
                            className='mb-1 text-white text-center'
                          >
                            {label}
                          </label>
                          <input
                            id={`${String(key)}-${fkey}`}
                            type='text'
                            className='form-control form-control-sm bg-dark text-white border-secondary text-center'
                            value={layoutConfig[key]?.[fkey] ?? ''}
                            onChange={e =>
                              handleChange(key, fkey, e.target.value)
                            }
                            placeholder={placeholder}
                          />
                        </div>
                      </Col>
                    ))}
                </Row>
              </div>
            </div>
          );
        })}

        {/* Отдельный блок для комментаторов */}
        <Card
          className='mt-4 bg-dark text-white border-success border-2'
          style={{ backgroundColor: 'rgba(111, 66, 193, 0.1)' }}
        >
          <Card.Header className='border-success d-flex align-items-center justify-content-center gap-2'>
            <Mic color='#6f42c1' size={20} />
            <span className='fw-bold text-success'>Commentators Layout</span>
          </Card.Header>
          <Card.Body className='pt-3'>
            {blocks
              .filter(({ key }) => key.startsWith('commentator'))
              .map(({ key, title }) => (
                <div key={key} className='mb-4'>
                  <h6 className='mb-2 text-center text-success'>{title}</h6>
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
                          <div
                            className={`w-100 text-center ${styles.fieldBox} ${styles[fkey]}`}
                          >
                            <label
                              htmlFor={`${String(key)}-${fkey}`}
                              className='mb-1 text-white text-center'
                            >
                              {label}
                            </label>
                            <input
                              id={`${String(key)}-${fkey}`}
                              type='text'
                              className='form-control form-control-sm bg-dark text-white border-secondary text-center'
                              value={layoutConfig[key]?.[fkey] ?? ''}
                              onChange={e =>
                                handleChange(key, fkey, e.target.value)
                              }
                              placeholder={placeholder}
                            />
                          </div>
                        </Col>
                      ))}
                  </Row>
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
                          <div
                            className={`w-100 text-center ${styles.fieldBox} ${styles[fkey]}`}
                          >
                            <label
                              htmlFor={`${String(key)}-${fkey}`}
                              className='mb-1 text-white text-center'
                            >
                              {label}
                            </label>
                            <input
                              id={`${String(key)}-${fkey}`}
                              type='text'
                              className='form-control form-control-sm bg-dark text-white border-secondary text-center'
                              value={layoutConfig[key]?.[fkey] ?? ''}
                              onChange={e =>
                                handleChange(key, fkey, e.target.value)
                              }
                              placeholder={placeholder}
                            />
                          </div>
                        </Col>
                      ))}
                  </Row>
                </div>
              ))}
          </Card.Body>
        </Card>
        <div className='d-flex align-items-center justify-content-center mb-2'>
          <small className='text-secondary'>px или % (до 100%)</small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default memo(LayoutConfigCard);
