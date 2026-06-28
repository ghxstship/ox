First line, what & when: The OX overlay family — modal, bottom sheet, toast, FAB, tooltip, dropdown menu, popover, accordion, and true tab panels. Use for any layered or disclosure UI.

```jsx
<OXModal open={open} onClose={close}><h3 className="ox-card__title">Confirm</h3>…</OXModal>
<OXSheet open={open} onClose={close}>…filter chips…</OXSheet>
<OXMenu items={[{label:"View credential",key:"V"},{label:"Leave the house",danger:true}]} />
<OXAccordion defaultOpen={[0]} items={[{title:<>What is <em>soulbound?</em></>, body:"Non-transferable."}]} />
<OXTabset tabs={[{label:"Tonight",panel:<…/>},{label:"This week",panel:<…/>}]} />
<OXToast message="RSVP confirmed" /> · <OXFab onClick={compose} />
```

- `OXModal`/`OXSheet` render nothing when `open` is false and include the scrim; wire ESC/scrim-dismiss/focus-trap per the `OXOverlayBehavior` contract.
- `OXAccordion` and `OXTabset` self-manage open/active state (or control `OXTabset` via `value`/`onChange`).
- Overlay motion is 120ms opacity only — no scale/translate beyond 4px; instant under reduced-motion.
