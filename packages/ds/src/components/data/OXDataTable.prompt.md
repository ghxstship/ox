First line, what & when: The product-grade data table plus the ruled data-viz primitives (bars, sparkline, line chart). Use for any admin list, ledger, or dashboard chart — they match the OX meter/table styling (mono numerics, Oxide peak, no gradients).

```jsx
<OXDataTable
  columns={[{key:"no",label:"No.",numeric:true,sortable:true},{key:"name",label:"Member",sortable:true},{key:"dues",label:"Dues",numeric:true}]}
  rows={[{no:"014",name:"Mariana Cruz",dues:"$2,400"}]}
  selectable selected={sel} onSelect={setSel}
  sortBy={{key:"no",dir:"asc"}} onSort={onSort} />

<OXBars data={[{label:"Jan",value:14},{label:"Mar",value:18}]} />   {/* peak bar = Oxide */}
<OXSparkline points={[3,5,4,7,6,9]} />
<OXLineChart series={[8,11,9,14,12,18]} labels={["O","N","D","J","F","M"]} />
```

- `numeric` columns render right-aligned mono; `sortable` adds the Oxide sort caret (drive `sortBy`/`onSort` yourself).
- Charts are single-series, ruled, Oxide-on-neutral — no gradients, no second color. The peak bar (or `peakIndex`) is the only Oxide fill.
