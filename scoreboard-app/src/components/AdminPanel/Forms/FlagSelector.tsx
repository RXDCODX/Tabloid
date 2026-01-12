import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import {
  Country,
  getCountryByCode,
  getFlagPath,
  searchCountries,
} from '../Utils/flagUtils';
import styles from './FlagSelector.module.scss';

type FlagSelectorProps = {
  selectedFlag: string;
  onFlagChange: (flagCode: string) => void;
  placeholder?: string;
};

const FlagSelector: React.FC<FlagSelectorProps> = ({
  selectedFlag,
  onFlagChange,
  placeholder = 'Выберите флаг',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilteredCountries(searchCountries(searchQuery));
  }, [searchQuery]);

  const handleSelect = useCallback(
    (countryCode: string) => {
      onFlagChange(countryCode);
      setIsOpen(false);
      setSearchQuery('');
    },
    [onFlagChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setIsOpen(true);
    },
    []
  );

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    // Не закрываем сразу, чтобы можно было кликнуть на опцию
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  const handleDropdownWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const deltaY = e.deltaY;
      const atTop = el.scrollTop === 0;
      const atBottom =
        Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;

      // Если прокрутка вверх и мы уже вверху, или вниз и уже внизу — предотвращаем прокрутку страницы
      if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
    },
    []
  );

  return (
    <div className={styles.flagSelectorContainer}>
      <div
        className={`${styles.flagBox} ${selectedFlag ? '' : styles.flagBoxEmpty}`}
      >
        {selectedFlag ? (
          <img
            src={getFlagPath(selectedFlag)}
            alt='Selected flag'
            className={styles.flagImage}
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
      </div>

      <Form.Control
        ref={inputRef}
        type='text'
        placeholder={
          // если есть выбранный флаг и поле поиска пустое — показываем имя страны
          !searchQuery && selectedFlag
            ? (getCountryByCode(selectedFlag)?.name ?? placeholder)
            : placeholder
        }
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        size='sm'
        className={`${styles.searchInput} ${!searchQuery && selectedFlag ? styles.noCaret : ''} bg-dark text-white border-info border-2 fw-bold rounded-3`}
      />

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownList} onWheel={handleDropdownWheel}>
            {filteredCountries.map(country => (
              <div
                key={country.code}
                className={styles.dropdownItem}
                onClick={() => handleSelect(country.code)}
              >
                <img
                  src={getFlagPath(country.code)}
                  alt={country.name}
                  className={styles.flagImage}
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className='small'>{country.name}</span>
              </div>
            ))}

            {filteredCountries.length === 0 && (
              <div className={styles.noResults}>Страна не найдена</div>
            )}
          </div>

          <div
            key={`none-option`}
            className={`${styles.dropdownItem} ${styles.dropdownFooter}`}
            onClick={() => handleSelect('none')}
            style={{ fontWeight: 'bold' }}
          >
            ✕ Убрать флаг
          </div>
        </div>
      )}

      {/* flag now displayed in the left box */}
    </div>
  );
};

export default FlagSelector;
