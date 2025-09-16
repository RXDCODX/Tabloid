export interface Country {
  code: string;
  name: string;
}

// Список стран для выбора флагов
export const countries: Country[] = [
  { code: 'us', name: 'United States' },
  { code: 'jp', name: 'Japan' },
  { code: 'kr', name: 'South Korea' },
  { code: 'cn', name: 'China' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'fr', name: 'France' },
  { code: 'de', name: 'Germany' },
  { code: 'it', name: 'Italy' },
  { code: 'es', name: 'Spain' },
  { code: 'ru', name: 'Russia' },
  { code: 'br', name: 'Brazil' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'mx', name: 'Mexico' },
  { code: 'ar', name: 'Argentina' },
  { code: 'in', name: 'India' },
  { code: 'th', name: 'Thailand' },
  { code: 'sg', name: 'Singapore' },
  { code: 'my', name: 'Malaysia' },
  { code: 'ph', name: 'Philippines' },
  { code: 'id', name: 'Indonesia' },
  { code: 'vn', name: 'Vietnam' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'hk', name: 'Hong Kong' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'be', name: 'Belgium' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'at', name: 'Austria' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
  { code: 'dk', name: 'Denmark' },
  { code: 'fi', name: 'Finland' },
  { code: 'pl', name: 'Poland' },
  { code: 'cz', name: 'Czech Republic' },
  { code: 'hu', name: 'Hungary' },
  { code: 'ro', name: 'Romania' },
  { code: 'bg', name: 'Bulgaria' },
  { code: 'hr', name: 'Croatia' },
  { code: 'si', name: 'Slovenia' },
  { code: 'sk', name: 'Slovakia' },
  { code: 'lt', name: 'Lithuania' },
  { code: 'lv', name: 'Latvia' },
  { code: 'ee', name: 'Estonia' },
  { code: 'ie', name: 'Ireland' },
  { code: 'pt', name: 'Portugal' },
  { code: 'gr', name: 'Greece' },
  { code: 'tr', name: 'Turkey' },
  { code: 'il', name: 'Israel' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'eg', name: 'Egypt' },
  { code: 'za', name: 'South Africa' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'ke', name: 'Kenya' },
  { code: 'gh', name: 'Ghana' },
  { code: 'ma', name: 'Morocco' },
  { code: 'tn', name: 'Tunisia' },
  { code: 'dz', name: 'Algeria' },
  { code: 'ly', name: 'Libya' },
  { code: 'sd', name: 'Sudan' },
  { code: 'et', name: 'Ethiopia' },
  { code: 'ug', name: 'Uganda' },
  { code: 'tz', name: 'Tanzania' },
  { code: 'zm', name: 'Zambia' },
  { code: 'zw', name: 'Zimbabwe' },
  { code: 'bw', name: 'Botswana' },
  { code: 'na', name: 'Namibia' },
  { code: 'sz', name: 'Eswatini' },
  { code: 'ls', name: 'Lesotho' },
  { code: 'mg', name: 'Madagascar' },
  { code: 'mu', name: 'Mauritius' },
  { code: 'sc', name: 'Seychelles' },
  { code: 're', name: 'Réunion' },
  { code: 'yt', name: 'Mayotte' },
  { code: 'km', name: 'Comoros' },
  { code: 'dj', name: 'Djibouti' },
  { code: 'so', name: 'Somalia' },
  { code: 'er', name: 'Eritrea' },
  { code: 'ss', name: 'South Sudan' },
  { code: 'cf', name: 'Central African Republic' },
  { code: 'td', name: 'Chad' },
  { code: 'ne', name: 'Niger' },
  { code: 'ml', name: 'Mali' },
  { code: 'bf', name: 'Burkina Faso' },
  { code: 'ci', name: "Côte d'Ivoire" },
  { code: 'lr', name: 'Liberia' },
  { code: 'sl', name: 'Sierra Leone' },
  { code: 'gn', name: 'Guinea' },
  { code: 'gw', name: 'Guinea-Bissau' },
  { code: 'gm', name: 'Gambia' },
  { code: 'sn', name: 'Senegal' },
  { code: 'mr', name: 'Mauritania' },
  { code: 'cv', name: 'Cape Verde' },
  { code: 'st', name: 'São Tomé and Príncipe' },
  { code: 'gq', name: 'Equatorial Guinea' },
  { code: 'ga', name: 'Gabon' },
  { code: 'cg', name: 'Republic of the Congo' },
  { code: 'cd', name: 'Democratic Republic of the Congo' },
  { code: 'ao', name: 'Angola' },
  { code: 'cm', name: 'Cameroon' },
];

export const searchCountries = (query: string): Country[] => {
  if (!query || query.trim() === '') return countries;

  const lowercaseQuery = query.toLowerCase();
  return countries.filter(
    country =>
      country.name.toLowerCase().includes(lowercaseQuery) ||
      country.code.toLowerCase().includes(lowercaseQuery)
  );
};

export const getFlagPath = (countryCode: string): string => {
  if (!countryCode) return '';
  return `/assets/flags/${countryCode.toLowerCase()}.svg`;
};
