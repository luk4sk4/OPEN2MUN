## 2024-08-18 - Optimized GSL rendering with O(1) lookups
**Learning:** React component `ListaOradores` had a heavy O(N*M) check inside `filter` using `Array.some` combined with `toLowerCase()`. Drag-and-drop actions on this queue triggered unnecessary re-renders causing lag due to unmemoized calculations.
**Action:** Replace `Array.some()` inside loops with a `Set` for O(1) lookups and wrap the calculation with `useMemo`. Remember to hoist string conversions (e.g. `toLowerCase()`) outside the loop.

## 2024-08-18 - Lazy loading for WidgetRegistry
**Learning:** Loading all 22+ widgets eagerly in `WidgetRegistry.jsx` caused a massive initial bundle size and warning limits during Vite builds, severely impacting the first load performance.
**Action:** Use `React.lazy()` to dynamically import heavy components in registries. Wrap dynamic renderers like `WidgetComponent` in a `<React.Suspense>` boundary to handle loading states asynchronously.
