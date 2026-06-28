First line, what & when: Page layout — the centered container, 12-col grid, section cover, 3-up feature grid, two-col split, and the Ink CTA band. Use to scaffold marketing/editorial pages.

```jsx
<OXContainer>
  <OXCover kicker="Compass bearings" title={<>Four <em>pillars.</em></>} />
  <OXFeatureGrid>
    <div><div className="ox-meta ox-meta--oxide">— Music</div><p className="ox-body">Communal.</p></div>
    …three or multiples of three…
  </OXFeatureGrid>
  <OXGrid><OXCol span={8}>…</OXCol><OXCol span={4}>…</OXCol></OXGrid>
  <OXSplit left={<…/>} right={<…/>} />
</OXContainer>
<OXCTABand title={<>Beyond the <em>scene.</em></>} action={<OXButton variant="oxide" arrow>Request an invite</OXButton>} />
```

- `OXContainer` is 1440px (96px margins); `reading` narrows to 760px for prose.
- `OXCol span` is 2–12 of a 12-col grid; everything collapses to full width below 768px.
- `OXCTABand` is the Ink band — its `<em>` renders bright-Oxide. Keep it to one per page.
