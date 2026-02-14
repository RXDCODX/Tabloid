import React, { memo, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { ArrowRepeat, Mic } from 'react-bootstrap-icons';
import { useAdminStore } from '../../../store/adminStateStore';
import FlagSelector from '../Forms/FlagSelector';

const CommentatorsCard: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState<number | null>(null);

  const commentator1 = useAdminStore(s => s.commentator1);
  const commentator2 = useAdminStore(s => s.commentator2);
  const commentator3 = useAdminStore(s => s.commentator3);
  const commentator4 = useAdminStore(s => s.commentator4);

  const setCommentator1 = useAdminStore(s => s.setCommentator1);
  const setCommentator2 = useAdminStore(s => s.setCommentator2);
  const setCommentator3 = useAdminStore(s => s.setCommentator3);
  const setCommentator4 = useAdminStore(s => s.setCommentator4);

  const swapCommentators1And2 = useAdminStore(s => s.swapCommentators1And2);
  const swapCommentators1And3 = useAdminStore(s => s.swapCommentators1And3);
  const swapCommentators2And4 = useAdminStore(s => s.swapCommentators2And4);
  const swapCommentators3And4 = useAdminStore(s => s.swapCommentators3And4);
  const swapCommentators1And2Names = useAdminStore(
    s => s.swapCommentators1And2Names
  );
  const swapCommentators1And3Names = useAdminStore(
    s => s.swapCommentators1And3Names
  );
  const swapCommentators2And4Names = useAdminStore(
    s => s.swapCommentators2And4Names
  );
  const swapCommentators3And4Names = useAdminStore(
    s => s.swapCommentators3And4Names
  );
  const resetAllCommentators = useAdminStore(s => s.resetAllCommentators);

  return (
    <Card
      className='shadow-lg'
      style={{ border: '2px solid #17a2b8', marginTop: '1%' }}
    >
      <Card.Header className='bg-dark border-bottom border-info align-content-center'>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Mic color='#17a2b8' size={28} />
          <h5 className='mb-0' style={{ color: '#17a2b8', fontWeight: 'bold' }}>
            Комментаторы
          </h5>
        </div>
      </Card.Header>

      <Card.Body className='p-4 bg-dark'>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Первая строка: 1 и 2 */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Card
              className='shadow-sm'
              style={{
                border: '2px solid #17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.05)',
                flex: 1,
                minWidth: '300px',
              }}
            >
              <Card.Body className='p-3'>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        height: 40,
                        backgroundColor: '#17a2b8',
                        borderRadius: '50%',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                      }}
                    >
                      1
                    </div>
                    <span style={{ color: '#17a2b8', fontWeight: 'bold' }}>
                      Комментатор №1
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{ display: 'flex', gap: 8, position: 'relative' }}
                    >
                      <input
                        type='text'
                        placeholder='Tag'
                        value={commentator1.tag ?? ''}
                        onChange={e =>
                          setCommentator1({
                            ...commentator1,
                            tag: e.target.value,
                          })
                        }
                        className='form-control form-control-sm bg-dark text-info border-info border-2 fw-bold rounded-3'
                        style={{ flex: '0 0 30%' }}
                      />
                      <div
                        style={{ flex: '0 0 70%', position: 'relative' }}
                        onMouseEnter={() => setShowTooltip(1)}
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <input
                          type='text'
                          placeholder='Name'
                          value={commentator1.name ?? ''}
                          onChange={e =>
                            setCommentator1({
                              ...commentator1,
                              name: e.target.value,
                            })
                          }
                          className='form-control form-control-sm bg-dark text-white border-primary border-2 rounded-3 fw-bold'
                        />
                        {showTooltip === 1 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              marginTop: '4px',
                              padding: '8px 12px',
                              backgroundColor: 'rgba(0, 0, 0, 0.9)',
                              color: '#fff',
                              fontSize: '12px',
                              borderRadius: '6px',
                              zIndex: 1000,
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                              pointerEvents: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            💡 Оставьте пустыми, чтобы скрыть
                          </div>
                        )}
                      </div>
                    </div>

                    <FlagSelector
                      selectedFlag={commentator1.flag ?? 'none'}
                      onFlagChange={(flag: string) =>
                        setCommentator1({ ...commentator1, flag })
                      }
                      placeholder='Флаг'
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                minWidth: 80,
                flexShrink: 0,
              }}
            >
              <Button
                variant='info'
                size='sm'
                onClick={swapCommentators1And2}
                style={{ minWidth: 80 }}
              >
                All<br />
                1-2
              </Button>
              <Button
                variant='info'
                size='sm'
                onClick={swapCommentators1And2Names}
                style={{ minWidth: 80 }}
              >
                Name
                <br />
                1-2
              </Button>
            </div>

            <Card
              className='shadow-sm'
              style={{
                border: '2px solid #17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.05)',
                flex: 1,
                minWidth: '300px',
              }}
            >
              <Card.Body className='p-3'>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        height: 40,
                        backgroundColor: '#17a2b8',
                        borderRadius: '50%',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                      }}
                    >
                      2
                    </div>
                    <span style={{ color: '#17a2b8', fontWeight: 'bold' }}>
                      Комментатор №2
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{ display: 'flex', gap: 8, position: 'relative' }}
                    >
                      <input
                        type='text'
                        placeholder='Tag'
                        value={commentator2.tag ?? ''}
                        onChange={e =>
                          setCommentator2({
                            ...commentator2,
                            tag: e.target.value,
                          })
                        }
                        className='form-control form-control-sm bg-dark text-info border-info border-2 fw-bold rounded-3'
                        style={{ flex: '0 0 30%' }}
                      />
                      <div
                        style={{ flex: '0 0 70%', position: 'relative' }}
                        onMouseEnter={() => setShowTooltip(2)}
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <input
                          type='text'
                          placeholder='Name'
                          value={commentator2.name ?? ''}
                          onChange={e =>
                            setCommentator2({
                              ...commentator2,
                              name: e.target.value,
                            })
                          }
                          className='form-control form-control-sm bg-dark text-white border-primary border-2 rounded-3 fw-bold'
                        />
                        {showTooltip === 2 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              marginTop: '4px',
                              padding: '8px 12px',
                              backgroundColor: 'rgba(0, 0, 0, 0.9)',
                              color: '#fff',
                              fontSize: '12px',
                              borderRadius: '6px',
                              zIndex: 1000,
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                              pointerEvents: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            💡 Оставьте пустыми, чтобы скрыть
                          </div>
                        )}
                      </div>
                    </div>

                    <FlagSelector
                      selectedFlag={commentator2.flag ?? 'none'}
                      onFlagChange={(flag: string) =>
                        setCommentator2({ ...commentator2, flag })
                      }
                      placeholder='Флаг'
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Кнопки All 1-3 и 2-4 */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button
                  variant='info'
                  size='sm'
                  onClick={swapCommentators1And3}
                  style={{ minWidth: 100 }}
                >
                  ⇅ All 1-3
                </Button>
                <Button
                  variant='info'
                  size='sm'
                  onClick={swapCommentators1And3Names}
                  style={{ minWidth: 100 }}
                >
                  ⇅ Name 1-3
                </Button>
              </div>
            </div>
            <div
              style={{
                minWidth: 80,
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Button
                variant='outline-danger'
                size='sm'
                onClick={resetAllCommentators}
                title='Сбросить всех комментаторов'
                style={{ minWidth: 70 }}
              >
                <ArrowRepeat size={18} />
              </Button>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button
                  variant='info'
                  size='sm'
                  onClick={swapCommentators2And4}
                  style={{ minWidth: 100 }}
                >
                  ⇅ All 2-4
                </Button>
                <Button
                  variant='info'
                  size='sm'
                  onClick={swapCommentators2And4Names}
                  style={{ minWidth: 100 }}
                >
                  ⇅ Name 2-4
                </Button>
              </div>
            </div>
          </div>

          {/* Вторая строка: 3 и 4 */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Card
              className='shadow-sm'
              style={{
                border: '2px solid #17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.05)',
                flex: 1,
                minWidth: '300px',
              }}
            >
              <Card.Body className='p-3'>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        height: 40,
                        backgroundColor: '#17a2b8',
                        borderRadius: '50%',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                      }}
                    >
                      3
                    </div>
                    <span style={{ color: '#17a2b8', fontWeight: 'bold' }}>
                      Комментатор №3
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{ display: 'flex', gap: 8, position: 'relative' }}
                    >
                      <input
                        type='text'
                        placeholder='Tag'
                        value={commentator3.tag ?? ''}
                        onChange={e =>
                          setCommentator3({
                            ...commentator3,
                            tag: e.target.value,
                          })
                        }
                        className='form-control form-control-sm bg-dark text-info border-info border-2 fw-bold rounded-3'
                        style={{ flex: '0 0 30%' }}
                      />
                      <div
                        style={{ flex: '0 0 70%', position: 'relative' }}
                        onMouseEnter={() => setShowTooltip(3)}
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <input
                          type='text'
                          placeholder='Name'
                          value={commentator3.name ?? ''}
                          onChange={e =>
                            setCommentator3({
                              ...commentator3,
                              name: e.target.value,
                            })
                          }
                          className='form-control form-control-sm bg-dark text-white border-primary border-2 rounded-3 fw-bold'
                        />
                        {showTooltip === 3 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              marginTop: '4px',
                              padding: '8px 12px',
                              backgroundColor: 'rgba(0, 0, 0, 0.9)',
                              color: '#fff',
                              fontSize: '12px',
                              borderRadius: '6px',
                              zIndex: 1000,
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                              pointerEvents: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            💡 Оставьте пустыми, чтобы скрыть
                          </div>
                        )}
                      </div>
                    </div>

                    <FlagSelector
                      selectedFlag={commentator3.flag ?? 'none'}
                      onFlagChange={(flag: string) =>
                        setCommentator3({ ...commentator3, flag })
                      }
                      placeholder='Флаг'
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                minWidth: 80,
                flexShrink: 0,
              }}
            >
              <Button
                variant='info'
                size='sm'
                onClick={swapCommentators3And4}
                style={{ minWidth: 80 }}
              >
                All<br />
                3-4
              </Button>
              <Button
                variant='info'
                size='sm'
                onClick={swapCommentators3And4Names}
                style={{ minWidth: 80 }}
              >
                Name
                <br />
                3-4
              </Button>
            </div>

            <Card
              className='shadow-sm'
              style={{
                border: '2px solid #17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.05)',
                flex: 1,
                minWidth: '300px',
              }}
            >
              <Card.Body className='p-3'>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        height: 40,
                        backgroundColor: '#17a2b8',
                        borderRadius: '50%',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                      }}
                    >
                      4
                    </div>
                    <span style={{ color: '#17a2b8', fontWeight: 'bold' }}>
                      Комментатор №4
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{ display: 'flex', gap: 8, position: 'relative' }}
                    >
                      <input
                        type='text'
                        placeholder='Tag'
                        value={commentator4.tag ?? ''}
                        onChange={e =>
                          setCommentator4({
                            ...commentator4,
                            tag: e.target.value,
                          })
                        }
                        className='form-control form-control-sm bg-dark text-info border-info border-2 fw-bold rounded-3'
                        style={{ flex: '0 0 30%' }}
                      />
                      <div
                        style={{ flex: '0 0 70%', position: 'relative' }}
                        onMouseEnter={() => setShowTooltip(4)}
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <input
                          type='text'
                          placeholder='Name'
                          value={commentator4.name ?? ''}
                          onChange={e =>
                            setCommentator4({
                              ...commentator4,
                              name: e.target.value,
                            })
                          }
                          className='form-control form-control-sm bg-dark text-white border-primary border-2 rounded-3 fw-bold'
                        />
                        {showTooltip === 4 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              marginTop: '4px',
                              padding: '8px 12px',
                              backgroundColor: 'rgba(0, 0, 0, 0.9)',
                              color: '#fff',
                              fontSize: '12px',
                              borderRadius: '6px',
                              zIndex: 1000,
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                              pointerEvents: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            💡 Оставьте пустыми, чтобы скрыть
                          </div>
                        )}
                      </div>
                    </div>

                    <FlagSelector
                      selectedFlag={commentator4.flag ?? 'none'}
                      onFlagChange={(flag: string) =>
                        setCommentator4({ ...commentator4, flag })
                      }
                      placeholder='Флаг'
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default memo(CommentatorsCard);
