First line, what & when: The data-display set — event/object cards, indexed list rows, the ruled table, KPI stat cards, and the capacity meter. Use for any listing, ledger, dashboard, or "seats remaining" surface.

```jsx
<OXCard day="Sat · Mar 14" category="Music" title={<>Basement set — <em>Honcho</em></>}
        description="Six hours, one room, no phones past the threshold."
        status="42 going" meta={<OXChip variant="oxide-line" live>Live</OXChip>} />

<OXRow index="03 / 14" title={<>Trailhead at <em>dawn</em></>} sub="Key Biscayne · 6:00" action="RSVP →" />

<OXTable columns={[{key:"item",label:"Item"},{key:"amt",label:"Amount",amount:true}]}
         rows={[{item:"Founding dues", amt:<em>$2,400</em>}]} />

<OXKpi label="Members" value="312" delta="+18 this month" trend="up" />
<OXMeter title="Spring cohort" current={312} total={580} lockAt={500} openLabel="Open" lockedLabel="Price locked" />
```

- Wrap card/row/table emphasis in `<em>` — it becomes the italic-Oxide accent.
- `OXTable` columns with `amount` render right-aligned mono; `<em>` inside an amount cell is the serif-Oxide "matter" value.
- `OXMeter` flips Oxide→Stone once `current ≥ lockAt`.
