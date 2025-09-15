module.exports = {
  // Основные настройки
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  
  // JSX настройки
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Другие настройки
  arrowParens: 'avoid',
  bracketSpacing: true,
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  
  // Настройки для различных файлов
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
  ],
};
