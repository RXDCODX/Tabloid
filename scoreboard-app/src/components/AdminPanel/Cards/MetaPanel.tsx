import React, { memo, useCallback, useState } from 'react';
import { Button, ButtonGroup, Card, Form } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';
import { useShallow } from 'zustand/react/shallow';
import { useAdminStore } from '../../../store/adminStateStore';
import styles from './MetaPanel.module.scss';

const MetaPanel: React.FC = () => {
  const meta = useAdminStore(useShallow(s => s.meta));
  const [customFightRule, setCustomFightRule] = useState(meta.fightRule || '');

  const fightRules = ['FT1', 'FT2', 'FT3', 'FT4', 'FT5'];

  const handleFightRuleChange = useCallback(
    (rule: string) => {
      const setMeta = useAdminStore.getState().setMeta;
      setMeta({ ...meta, fightRule: rule });
      if (fightRules.includes(rule) || rule === 'None') {
        setCustomFightRule(''); // сбрасываем customFightRule
      } else {
        setCustomFightRule(rule);
      }
    },
    [fightRules, meta]
  );

  const handleCustomFightRuleChange = useCallback(
    (value: string) => {
      setCustomFightRule(value);
      const setMeta = useAdminStore.getState().setMeta;
      setMeta({ ...meta, fightRule: value });
    },
    [meta]
  );

  return (
    <Card className={styles.metaPanel}>
      <Card.Body className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <InfoCircle color='#6f42c1' size={20} />
          <span className={styles.cardTitle}>Meta Panel</span>
        </div>

        <div className={styles.formSection}>
          <Form.Group>
            <Form.Label className={styles.fieldLabel}>
              Название турнира
            </Form.Label>
            <Form.Control
              type='text'
              placeholder='Введите название турнира'
              value={meta.title ?? ''}
              onChange={e =>
                useAdminStore
                  .getState()
                  .setMeta({ ...meta, title: e.target.value })
              }
              className={`${styles.textInput} bg-dark text-white border-primary border-2 fw-bold rounded-3`}
              style={{ fontSize: 14 }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className={styles.fieldLabel}>Режим драки</Form.Label>
            <div className={styles.fightRulesContainer}>
              <ButtonGroup size='sm' className='w-100'>
                {fightRules.map(rule => (
                  <Button
                    key={rule}
                    variant={
                      meta.fightRule === rule ? 'primary' : 'outline-primary'
                    }
                    onClick={() => handleFightRuleChange(rule)}
                    className={`${styles.fightRuleButton} fw-bold`}
                    style={
                      {
                        '--button-bg':
                          meta.fightRule === rule ? '#0d6efd' : 'transparent',
                      } as React.CSSProperties
                    }
                  >
                    {rule}
                  </Button>
                ))}
              </ButtonGroup>
            </div>

            {/* Отдельный ряд для None */}
            <div className='d-flex gap-1 flex-wrap mb-2'>
              <Button
                variant={
                  meta.fightRule === 'None' ? 'secondary' : 'outline-secondary'
                }
                onClick={() => handleFightRuleChange('None')}
                className={`${styles.noneButton} fw-bold`}
                style={
                  {
                    '--button-bg':
                      meta.fightRule === 'None' ? '#6c757d' : 'transparent',
                  } as React.CSSProperties
                }
              >
                None
              </Button>
            </div>

            <div className='d-flex flex-column gap-2'>
              <Button
                variant={
                  meta.fightRule === 'Custom' ||
                  (!fightRules.includes(meta.fightRule) &&
                    meta.fightRule !== 'None')
                    ? 'primary'
                    : 'outline-primary'
                }
                onClick={() => handleFightRuleChange('Custom')}
                className={`${styles.customButton} fw-bold`}
                style={
                  {
                    '--button-bg':
                      meta.fightRule === 'Custom' ||
                      (!fightRules.includes(meta.fightRule) &&
                        meta.fightRule !== 'None')
                        ? '#0d6efd'
                        : 'transparent',
                  } as React.CSSProperties
                }
              >
                Custom
              </Button>
              {(meta.fightRule === 'Custom' ||
                (customFightRule &&
                  !fightRules.includes(meta.fightRule) &&
                  meta.fightRule !== 'None')) && (
                <Form.Control
                  type='text'
                  placeholder='Кастомный режим (например: FT10, BO3)'
                  value={customFightRule || ''}
                  onChange={e => handleCustomFightRuleChange(e.target.value)}
                  className={`${styles.customInput} bg-dark text-warning border-warning border-2 fw-bold rounded-3`}
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

export default memo(MetaPanel);
