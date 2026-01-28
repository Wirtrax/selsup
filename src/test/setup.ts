import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Расширяем Vitest expect методами из Testing Library
expect.extend(matchers);

// Автоматическая очистка после каждого теста
afterEach(() => {
    cleanup();
});