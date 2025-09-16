import React, { useState, useRef, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { searchCountries, getFlagPath, Country } from '../Utils/flagUtils';
import styles from './FlagSelector.module.scss';

type FlagSelectorProps = {
  selectedFlag: string;
  onFlagChange: (flagCode: string) => void;
  placeholder?: string;
};

const FlagSelector: React.FC<FlagSelectorProps> = ({
  selectedFlag,
  onFlagChange,
  placeholder = "Выберите флаг"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilteredCountries(searchCountries(searchQuery));
  }, [searchQuery]);

  const handleSelect = (countryCode: string) => {
    onFlagChange(countryCode);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Не закрываем сразу, чтобы можно было кликнуть на опцию
    setTimeout(() => setIsOpen(false), 200);
  };

  const selectedCountry = filteredCountries.find(c => c.code === selectedFlag);

  return (
    <div className={styles.flagSelectorContainer}>
      <Form.Control
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        size="sm"
        className={`${styles.searchInput} bg-dark text-white border-info border-2 fw-bold rounded-3`}
      />
      
      {isOpen && (
        <div className={styles.dropdown}>
          {filteredCountries.map((country) => (
            <div
              key={country.code}
              className={styles.dropdownItem}
              onClick={() => handleSelect(country.code)}
            >
              <img
                src={getFlagPath(country.code)}
                alt={country.name}
                className={styles.flagImage}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="small">{country.name}</span>
            </div>
          ))}
          {filteredCountries.length === 0 && (
            <div className={styles.noResults}>
              Страна не найдена
            </div>
          )}
        </div>
      )}
      
      {selectedFlag && !isOpen && (
        <div className={styles.selectedFlag}>
          <img
            src={getFlagPath(selectedFlag)}
            alt="Selected flag"
            className={styles.flagImage}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FlagSelector;
