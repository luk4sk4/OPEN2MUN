## 2024-05-18 - Optimize nested loops using Pre-aggregation with Maps
**Learning:** O(N * M) nested loops (e.g., using `filter` inside a `map`) inside `useMemo` blocks block the main thread and severely affect React performance on large datasets.
**Action:** Always pre-aggregate secondary datasets into a `Map` in O(M) time before iterating through the primary dataset in O(N) time to achieve O(N + M) complexity.
