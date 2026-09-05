---
name: New module proposal
about: Add a data-source module to the registry
title: "[module] "
labels: module, enhancement
assignees: ''
---

## Source

- **Name:**
- **Provider / agency:**
- **URL:**
- **Auth required?** <!-- yes / no / free key -->
- **Free tier?** <!-- yes / no / quotas -->

## Coverage

<!-- What does this data cover? Be specific about geography, sensor, time range. -->

## Module shape

```ts
{
  id: "...",
  label: "...",
  category: "earth-observation" | "orbital-air-traffic" | "conflict-events" | "environmental" | "news-info" | "thailand",
  pollInterval: <seconds>,
  // 5–10 lines of mockData + fetchData sketch
}
```

## Willing to submit a PR?

- [ ] Yes — I'll open a PR with the module + mock data + registry entry
- [ ] No — I'd like someone else to implement
- [ ] Need help — I'd like a pairing session

## Reference

<!-- Docs, examples, similar modules already in the registry. -->
