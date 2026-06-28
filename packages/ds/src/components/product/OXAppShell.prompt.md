First line, what & when: The OX SaaS product layer — the console app shell plus its atoms (badges, stats, steps, banners, progress, kbd, command palette). Use for the Member / Operate / Admin suite, dashboards, and any internal tool.

```jsx
<OXAppShell product="operate" appCode="OPS"
  nav={[{group:"Operate", items:[{label:"Members",active:true,badge:"312"},{label:"Events"}]}]}
  topbar={<>…app switcher · search · <OXButton variant="oxide" size="sm">New</OXButton></>}>
  <OXStat value="312" label="Members" delta="+18 mo" />
  <OXBadge tone="ok">Active</OXBadge> <OXBadge tone="danger">Overdue</OXBadge>
  <OXSteps steps={[{label:"Apply",state:"done"},{label:"Mint",state:"now"},{label:"Welcome"}]} />
  <OXBanner tone="info">Mint window closes in 14 minutes.</OXBanner>
  <OXCommandPalette items={[{label:"New member",kbd:"N"}]} />
</OXAppShell>
```

- The three suite apps (`product="member|operate|admin"`) take a copper accent **step** (default / deep / bright), never a new hue — distinguish them by the step + app code, never color.
- `OXBadge` tone: ok · warn · danger · info · neutral. These are functional UI semantics (muted greens/ambers/reds), distinct from the brand Oxide accent.
- Pair with the `.oxa-*` organism classes (`.oxa-board` kanban, `.oxa-gantt`, `.oxa-slideover`, `.oxa-copilot`) for fuller console views.
