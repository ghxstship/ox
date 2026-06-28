First line, what & when: The core interaction primitives — button, chip, segmented switcher, underline tabs. Reach for these for any action, filter, or status label in OX surfaces.

```jsx
<OXButton variant="primary" arrow>Request invite</OXButton>
<OXButton variant="oxide" size="lg">Mint</OXButton>
<OXChip variant="oxide-line" live>Live now</OXChip>
<OXSegmented options={[{value:"mus",label:"Music"},{value:"fit",label:"Fitness"}]} value={v} onChange={setV} />
<OXTabs items={[{label:"All",active:true},{label:"Events"},{label:"Feed"}]} />
```

- `OXButton` variants: `default` (outline), `primary` (solid ink → oxide on hover), `oxide`, `ghost`. Sizes `sm|md|lg`, plus `block` and `arrow`.
- `OXChip` variants: `default`, `solid`, `oxide`, `oxide-line`, `ghost`; `live` prepends the status dot.
- `OXSegmented` is controlled (`value`/`onChange`); active fills Oxide.
- All labels are mono caps — author sentence case, the component cases it.
