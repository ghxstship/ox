First line, what & when: The OX mark — the word "OX" set as live JetBrains Mono ExtraBold type, as a horizontal wordmark or the 90°-rotated flag. Use anywhere the brand signs itself; never redraw it.

```jsx
<OXMark as="wordmark" size={64} />
<OXMark as="flag" size={48} color="var(--ox-oxide)" />
```

- `as` — `"wordmark"` (horizontal, default) or `"flag"` (stacked / rotated 90° CW).
- `size` — px number or CSS length. Min 10px; below ~16px use the wordmark only.
- Reverse on Ink/Oxide grounds by passing `color="var(--ox-paper)"`. Never gradient-fill, outline, or recolor within the mark.

Sibling brand marks: `OXCode` (mono location/pillar code chip) and `OXTierBadge` (member tier + number).
