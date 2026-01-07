import React, { useCallback } from 'react';
import { Card, Form } from 'react-bootstrap';
import { TextConfiguration } from '../../../types/types';
import styles from './TextConfigurationCard.module.scss';

interface TextConfigurationCardProps {
  textConfig: TextConfiguration;
  onTextConfigChange: (textConfig: TextConfiguration) => void;
}

const TextConfigurationCard: React.FC<TextConfigurationCardProps> = ({
  textConfig,
  onTextConfigChange,
}) => {
  const handleTextChange = useCallback(
    (field: keyof TextConfiguration, value: string) => {
      onTextConfigChange({
        ...textConfig,
        [field]: value,
      });
    },
    [textConfig, onTextConfigChange]
  );

  return (
    <Card className={`mb-4 ${styles.textConfigCard}`}>
      <Card.Header className='bg-primary text-white'>
        <h5 className='mb-0'>Настройка отображаемого текста</h5>
      </Card.Header>
      <Card.Body>
        <div className='row'>
          <div className='col-md-6 mb-3'>
            <Form.Group>
              <Form.Label>Текст для имени игрока 1</Form.Label>
              <Form.Control
                type='text'
                placeholder='Оставьте пустым для использования имени игрока'
                value={textConfig.player1NameText || ''}
                onChange={e =>
                  handleTextChange('player1NameText', e.target.value)
                }
              />
              <Form.Text className='text-muted'>
                Если пусто, будет использовано: [W/L] Тег | Имя
              </Form.Text>
            </Form.Group>
          </div>
          <div className='col-md-6 mb-3'>
            <Form.Group>
              <Form.Label>Текст для имени игрока 2</Form.Label>
              <Form.Control
                type='text'
                placeholder='Оставьте пустым для использования имени игрока'
                value={textConfig.player2NameText || ''}
                onChange={e =>
                  handleTextChange('player2NameText', e.target.value)
                }
              />
              <Form.Text className='text-muted'>
                Если пусто, будет использовано: [W/L] Имя | Тег
              </Form.Text>
            </Form.Group>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6 mb-3'>
            <Form.Group>
              <Form.Label>Текст для счета игрока 1</Form.Label>
              <Form.Control
                type='text'
                placeholder='Оставьте пустым для использования счета'
                value={textConfig.player1ScoreText || ''}
                onChange={e =>
                  handleTextChange('player1ScoreText', e.target.value)
                }
              />
              <Form.Text className='text-muted'>
                Если пусто, будет использован счет игрока
              </Form.Text>
            </Form.Group>
          </div>
          <div className='col-md-6 mb-3'>
            <Form.Group>
              <Form.Label>Текст для счета игрока 2</Form.Label>
              <Form.Control
                type='text'
                placeholder='Оставьте пустым для использования счета'
                value={textConfig.player2ScoreText || ''}
                onChange={e =>
                  handleTextChange('player2ScoreText', e.target.value)
                }
              />
              <Form.Text className='text-muted'>
                Если пусто, будет использован счет игрока
              </Form.Text>
            </Form.Group>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6 mb-3'>
            <Form.Group>
              <Form.Label>Текст для названия турнира</Form.Label>
              <Form.Control
                type='text'
                placeholder='Оставьте пустым для использования названия турнира'
                value={textConfig.tournamentTitleText || ''}
                onChange={e =>
                  handleTextChange('tournamentTitleText', e.target.value)
                }
              />
              <Form.Text className='text-muted'>
                Если пусто, будет использовано название турнира
              </Form.Text>
            </Form.Group>
          </div>
          <div className='col-md-6 mb-3'>
            <Form.Group>
              <Form.Label>Текст для режима драки</Form.Label>
              <Form.Control
                type='text'
                placeholder='Оставьте пустым для использования режима драки'
                value={textConfig.fightModeText || ''}
                onChange={e =>
                  handleTextChange('fightModeText', e.target.value)
                }
              />
              <Form.Text className='text-muted'>
                Если пусто, будет использован режим драки
              </Form.Text>
            </Form.Group>
          </div>
        </div>

        <div className='mt-3'>
          <button
            className='btn btn-outline-secondary btn-sm'
            onClick={() => onTextConfigChange({})}
          >
            Сбросить все тексты
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TextConfigurationCard;
