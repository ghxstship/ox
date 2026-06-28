First line, what & when: The OX form controls — labeled field wrapper, ruled serif input/textarea, native select with Oxide caret, radio/checkbox rows, and a square switch. Use for any data entry; OXField is the spine every control plugs into.

```jsx
<OXField label="Full name" hint="as on ID" help="Used on your credential">
  <OXInput placeholder="Mariana Cruz" value={v} onChange={setV} />
</OXField>

<OXField label="Home pillar">
  <OXSelect value={p} onChange={setP} options={[
    {value:"mus",label:"Music"},{value:"fit",label:"Fitness"}]} />
</OXField>

<OXChoice type="radio" name="tier" label="Compass" sub="250 seats" checked onChange={fn} />
<OXSwitch on={notify} onChange={setNotify} />
```

- `OXField` `state` (`error|success|disabled`) recolors the underline + help text; pass the same `state` to the control.
- Inputs are ruled (underline), serif, Oxide focus underline — square, never boxed-and-rounded.
- Radios share a `name`; checked state fills Oxide.
