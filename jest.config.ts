import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
    moduleFileExtensions: [
        "js",
        "ts",
        "json",
        "node"
    ],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    moduleNameMapper: {
        "@/(.*)$": "<rootDir>/src/$1"
    },
    testTimeout: 30000,
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.json'
        },
    },
    testEnvironment: "node",
    modulePathIgnorePatterns: ["<rootDir>/dist"],
};

export default config;