import React, { useState, useRef, useEffect } from 'react';
import { Form, Dropdown } from 'react-bootstrap';
import { searchCountries, getFlagPath, Country } from './flagUtils';

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
    <div className="position-relative w-100">
      <Form.Control
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        size="sm"
        className="bg-dark text-white border-info border-2 fw-bold rounded-3"
      />
      
      {isOpen && (
        <div 
          className="position-absolute w-100 bg-dark border border-info rounded-3 mt-1"
          style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            zIndex: 1000,
            top: '100%'
          }}
        >
          {filteredCountries.map((country) => (
            <div
              key={country.code}
              className="d-flex align-items-center gap-2 p-2 text-white cursor-pointer hover-bg-secondary"
              style={{ 
                cursor: 'pointer',
                borderBottom: '1px solid #333'
              }}
              onClick={() => handleSelect(country.code)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <img
                src={getFlagPath(country.code)}
                alt={country.name}
                style={{ width: '20px', height: '15px', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="small">{country.name}</span>
            </div>
          ))}
          {filteredCountries.length === 0 && (
            <div className="p-2 text-muted small">
              Страна не найдена
            </div>
          )}
        </div>
      )}
      
      {selectedFlag && !isOpen && (
        <div className="position-absolute top-0 start-0 p-1">
          <img
            src={getFlagPath(selectedFlag)}
            alt="Selected flag"
            style={{ width: '20px', height: '15px', objectFit: 'cover' }}
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