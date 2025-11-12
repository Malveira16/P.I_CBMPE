/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

// Polyfill necessário para TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from "util";

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
