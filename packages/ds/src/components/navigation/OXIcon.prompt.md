First line, what & when: Navigation & wayfinding — the self-contained OX line-icon set plus list rows, avatars, breadcrumbs, the desktop site header/footer, and numbered pagination.

```jsx
<OXIcon name="wallet" size="md" />          // 79 glyphs; line only, 1.5 stroke, no fill
<OXListRow icon="VI" title={<>Room <em>VI</em></>} sub="Tonight · 22:00" trail="12 left" chevron />
<OXBreadcrumbs trail={[{label:"Home",href:"#"},{label:"Events",href:"#"},{label:"Room VI"}]} />
<OXSiteHeader brand={<span className="ox-wordmark">OX</span>} nav={[{label:"Pillars",href:"#",active:true}]} cta={<OXButton variant="oxide" size="sm">Join</OXButton>} />
<OXSiteFooter columns={[{heading:"The club",links:[{label:"Membership",href:"#"}]}]} />  {/* wrap in .ox-on-ink for the Ink footer */}
<OXPagination page={2} pageCount={5} total={312} onPage={setPage} />
```

- `OXIcon` names: house · events · feed · wallet · profile · search · back · chevron · close · add · like · comment · repost · share · settings · bell · lock · check · external. Color via `currentColor`; counts toward the ≤10% Oxide budget when colored.
- Icons are wayfinding only — most things in OX should be a word, not an icon.
