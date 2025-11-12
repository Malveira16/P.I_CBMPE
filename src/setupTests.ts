/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom'; // matchers extras
import { TextEncoder, TextDecoder } from 'util';

// Polyfill para Node.js
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
