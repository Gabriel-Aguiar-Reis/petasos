# mercury

## O que quero fazer

Quero construir um aplicativo facilitador para motoristas autônomos. A ideia,
em linhas gerais é permitir que o usuário consiga controlar as finanças de seu
trabalho e tenha maior visibilidade sobre seu lucro, seus gastos e seu
desempenho.

## Principais Entregas

As grandes entregas se dividirão em dois momentos.

1. o app deverá ter todas suas _features cores_ finalizadas para a primeira
   entrega, haverá um usuário que validará a aplicação por um período de tempo.

2. Assim que a aplicação for completamente validada, haverá outra grande entrega
   que será a implementação dos recursos necessários para sustentar uma base de
   usuários e implementar uma lógica de licenças para o uso do app.

**Restrição** - Por limitações de certas _features core_ para o sistema iOS, a
princípio o app será apenas Android.

## Stack

Colocarei a seguir um `package.json` de exemplo com as dependências que pretendo
usar, mas a ideia é usar:

- **Frontend:** React Native (Expo)
- **Language:** TypeScript (strict mode)
- **UI System:** shadcn/ui (React Native Reusables)
- **State Management:** Zustand + React Query (TanStack Query)
- **Database (local):** SQLite via Expo + Drizzle ORM
- **Sync Strategy:** Offline-first with optional cloud sync (future)
- **Notifications:** Expo Notifications
- **Background Tasks:** Expo Task Manager + Background Fetch
- **Charts:** Victory Native
- **Location:** Expo Location (GPS tracking)

package.json:

```json
{
  "name": "mercury",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "license": "UNLICENSED",
  "scripts": {
    "start": "expo start -c",
    "android": "expo start -c --android",
    "test": "jest --watchAll=false",
    "typecheck": "tsc --noEmit",
    "web": "expo start -c --web",
    "clean": "rm -rf .expo node_modules",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "dependencies": {
    "@expo/log-box": "^55.0.10",
    "@expo/metro-runtime": "~55.0.9",
    "@notifee/react-native": "^9.1.8",
    "@tanstack/react-query": "5.99.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "drizzle-orm": "0.45.2",
    "expo": "55.0.15",
    "expo-constants": "~55.0.14",
    "expo-file-system": "~55.0.16",
    "expo-font": "~55.0.6",
    "expo-linking": "~55.0.13",
    "expo-navigation-bar": "~55.0.12",
    "expo-notifications": "55.0.19",
    "expo-router": "55.0.12",
    "expo-sharing": "~55.0.18",
    "expo-sqlite": "55.0.15",
    "expo-status-bar": "55.0.5",
    "lucide-react-native": "^1.8.0",
    "nativewind": "^4.2.3",
    "react": "19.2.0",
    "react-native": "0.83.4",
    "react-native-actions-sheet": "^10.1.2",
    "react-native-gesture-handler": "^2.31.1",
    "react-native-get-random-values": "^2.0.0",
    "react-native-reanimated": "^4.3.0",
    "react-native-safe-area-context": "^5.7.0",
    "react-native-screens": "4.23.0",
    "react-native-svg": "15.15.3",
    "react-native-worklets": "^0.8.1",
    "rrule": "^2.8.1",
    "tailwind-merge": "^3.5.0",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "13.0.0",
    "zod": "4.3.6",
    "zustand": "5.0.12"
  },
  "devDependencies": {
    "@babel/core": "^7.29.0",
    "@testing-library/react-native": "13.3.3",
    "@types/better-sqlite3": "^7.6.13",
    "@types/jest": "29.5.14",
    "@types/react": "~19.2.0",
    "@types/uuid": "11.0.0",
    "@typescript-eslint/eslint-plugin": "^8.59.0",
    "@typescript-eslint/parser": "^8.59.0",
    "babel-plugin-inline-import": "^3.0.0",
    "better-sqlite3": "^12.9.0",
    "drizzle-kit": "0.31.10",
    "eslint": "^10.2.1",
    "eslint-plugin-prettier": "^5.5.0",
    "jest": "29.7.0",
    "prettier": "^3.8.3",
    "prettier-plugin-organize-imports": "^4.3.0",
    "prettier-plugin-tailwindcss": "^0.7.2",
    "tailwindcss": "^3.4.19",
    "ts-jest": "29.4.9",
    "ts-node": "^10.9.2",
    "typescript": "6.0.2"
  }
}
```

## Arquivos relevantes

Espero que estes arquivos sejam exatamente assim no projeto.

globals.css:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 200 14.1% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 200 14.1% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 200 14.1% 4.1%;
    --primary: 79.9 100% 45.1%;
    --primary-foreground: 86.5 71.1% 19.1%;
    --secondary: 240 3.5% 95.8%;
    --secondary-foreground: 240 6% 10%;
    --muted: 180 7.3% 95%;
    --muted-foreground: 191.4 9.2% 44.5%;
    --accent: 180 7.3% 95%;
    --accent-foreground: 197.2 12.9% 10%;
    --destructive: 357.2 100% 45.3%;
    --border: 192 10.8% 89.9%;
    --input: 192 10.8% 89.9%;
    --ring: 192 8% 64.1%;
    --chart-1: 80.9 87.7% 63.6%;
    --chart-2: 83.9 100% 40.5%;
    --chart-3: 85.8 100% 32.4%;
    --chart-4: 85.2 100% 24.6%;
    --chart-5: 83.3 100% 19.4%;
    --radius: 0.625rem;
  }

  .dark:root {
    --background: 200 14.1% 4.1%;
    --foreground: 180 19.5% 98.1%;
    --card: 197.2 12.9% 10%;
    --card-foreground: 180 19.5% 98.1%;
    --popover: 197.2 12.9% 10%;
    --popover-foreground: 180 19.5% 98.1%;
    --primary: 83.9 100% 40.5%;
    --primary-foreground: 86.5 71.1% 19.1%;
    --secondary: 240 4% 15.9%;
    --secondary-foreground: 180 0% 98%;
    --muted: 193.4 12.2% 15.1%;
    --muted-foreground: 192 8% 64.1%;
    --accent: 193.4 12.2% 15.1%;
    --accent-foreground: 180 19.5% 98.1%;
    --destructive: 358.7 100% 69.6%;
    --border: 0 0% 100% / 10%;
    --input: 0 0% 100% / 15%;
    --ring: 191.4 9.2% 44.5%;
    --chart-1: 80.9 87.7% 63.6%;
    --chart-2: 83.9 100% 40.5%;
    --chart-3: 85.8 100% 32.4%;
    --chart-4: 85.2 100% 24.6%;
    --chart-5: 83.3 100% 19.4%;
  }
}
```

components.json:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-vega",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "global.css",
    "baseColor": "mist",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/src/components",
    "utils": "@/src/lib/utils",
    "ui": "@/src/components/ui",
    "lib": "@/src/lib",
    "hooks": "@/src/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle"
}
```

tailwind.config.js:

```js
const { hairlineWidth } = require('nativewind/theme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
}
```

babel.config.js:

```js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      ['inline-import', { extensions: ['.sql'] }],
      'react-native-reanimated/plugin',
    ],
  }
}
```

app.json:

```json
{
  "expo": {
    "name": "mercury",
    "slug": "mercury",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": false
    },
    "android": {
      "permissions": [
        "SYSTEM_ALERT_WINDOW",
        "POST_NOTIFICATIONS",
        "MODIFY_AUDIO_SETTINGS",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_SPECIAL_USE",
        "NOTIFICATION_SERVICE",
        "VIBRATE"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.gabriel_aguiar.mercury"
    },
    "plugins": [
      "expo-router",
      [
        "expo-sqlite",
        {
          "enableFTS": true,
          "useSQLCipher": false
        }
      ],
      "expo-sharing",
      "expo-font"
    ],
    "scheme": "mercury",
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

.prettierrc:

```json
{
  "printWidth": 81,
  "tabWidth": 2,
  "singleQuote": true,
  "bracketSameLine": false,
  "trailingComma": "es5",
  "semi": false,
  "plugins": ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"],
  "tailwindFunctions": ["cva"]
}
```

tsconfig.json:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "types": ["jest"],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ],
  "exclude": [
    "node_modules/**",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ],
  "compileOnSave": true
}
```

## Arquitetura

```
app/                        # Screens (Expo Router)
src/
├── domain/
│   ├── entities/           # entities and meta entities
│   └── validations/        # schemas (Zod)
├── application/
│   ├── use-cases/          # Application logic
│   ├── hooks/              # React Query hooks
│   └── services/           # Application services
├── infra/
│   ├── db/                 # Database configuration
│   └── repositories/       # Repositories (Drizzle)
├── components/
│   └── ui/
├── lib/                    # Utilities and helpers
└── types/                  # TypeScript type definitions
tests/                      # Jest test files
```
