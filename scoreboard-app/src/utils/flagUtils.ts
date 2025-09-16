export const getFlagPath = (countryCode: string): string => {
  if (!countryCode) return '';
  return `/assets/flags/${countryCode.toLowerCase()}.svg`;
};

export const isValidTag = (tag: string): boolean => {
  if (!tag || tag.trim() === '') return false;

  // Проверяем, содержит ли тег хотя бы одну букву (латинскую или русскую)
  const hasLetter = /[a-zA-Zа-яА-Я]/.test(tag);
  return hasLetter;
};
