import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
  "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  "^leaflet/dist/leaflet\\.css$": "<rootDir>/src/__mocks__/leaflet-css-mock.js",
},

  transformIgnorePatterns: ["/node_modules/(?!react-leaflet|@react-leaflet)/"],
};

export default config;
