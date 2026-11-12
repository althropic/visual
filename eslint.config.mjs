import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    // All source files: CommonJS Node environment
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        require:   'readonly',
        module:    'writable',
        exports:   'writable',
        __dirname: 'readonly',
        __filename:'readonly',
        process:   'readonly',
        Buffer:    'readonly',
        URL:       'readonly',
        fetch:     'readonly',
        // Browser globals used inside Playwright page.evaluate() callbacks
        document:  'readonly',
        window:    'readonly',
      },
    },
    rules: {
      'no-console':    'error',
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'no-empty':      ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // Tests: same Node env, console allowed
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require:   'readonly',
        module:    'writable',
        exports:   'writable',
        __dirname: 'readonly',
        process:   'readonly',
        // Jest globals
        describe:  'readonly',
        test:      'readonly',
        it:        'readonly',
        expect:    'readonly',
        beforeAll: 'readonly',
        afterAll:  'readonly',
        beforeEach:'readonly',
        afterEach: 'readonly',
        jest:      'readonly',
      },
    },
    rules: {
      'no-console':    'off',
      'no-unused-vars':['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // CLI entry point: console is intentional here
    files: ['bin/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require:   'readonly',
        module:    'writable',
        exports:   'writable',
        __dirname: 'readonly',
        process:   'readonly',
        console:   'readonly',
      },
    },
    rules: {
      'no-console':    'off',
      'no-unused-vars':['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // logger.js is the one src/ file allowed to call console.
    // Its eslint-disable-next-line comments have been removed since this rule handles it.
    files: ['src/logger.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
];
