First line, what & when: Status & state feedback — the inline alert bar, the Oxide ticker strip, and the empty state. Use the ticker for live house status, the alert for a single inline notice, and empty for zero-data views.

```jsx
<OXTicker items={["Door open · 11pm", "3 seats left · Sat", "Minted 014/580", "Sound system: live"]} />
<OXAlert>Mint window closes in 14 minutes</OXAlert>
<OXEmpty mark="OX" title={<>Nothing on the <em>feed</em> yet</>}
         sub="When members post from the floor, it lands here."
         action={<OXButton variant="ghost" size="sm">Refresh</OXButton>} />
```

- `OXTicker` heavy mono caps on copper — keep items short, present-tense field notes.
- `OXAlert` is Oxide-edged and counts toward the ≤10% accent budget; one per view.
- `OXEmpty` mark is usually the flag/wordmark or a serif glyph; never an illustration.
