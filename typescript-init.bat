@echo off
call npm i @minecraft/server@1.4.0-beta.1.20.10-stable

(
    echo {
    echo   "compilerOptions": {
    echo     "module": "ES2020",
    echo     "target": "ES2021",
    echo     "moduleResolution": "Node",
    echo     "allowSyntheticDefaultImports": true,
    echo     "baseUrl": "./src",
    echo     "rootDir": "./src",
    echo     "outDir": "./scripts",
    echo     "strict": true,
    echo     "forceConsistentCasingInFileNames": true,
    echo   },
    echo   "exclude": [ "node_modules" ],
    echo   "include": [ "src" ]
    echo }
) > tsconfig.json

(
    echo @echo off
    echo call tsc -w
) > TS-compiler.bat