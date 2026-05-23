### 05-23-2026
 - Decision: frontend lint uses ESLint 10 flat config (`frontend/eslint.config.js`); react-hooks v7 limited to `rules-of-hooks` (compiler rules off); config/tailwind JS files ignored.
 - Constraint: Recharts 3 requires `react-is` peer dependency; uuid 14 needs ES2022 lib for `Error` cause chaining.
 - Decision: form layout and metric display names stored in UserSettings as `formFieldOrder` (string[]) and `metricLabels` (Record); merged in MetricsContext for app-wide display.
 - Constraint: API payload keys unchanged (`Weight`, `Body Fat %`, etc.); only display labels are customizable.
