First line, what & when: The membership-app pieces — the OX credential (the on-chain / physical member card) and the social feed post. The credential is the brand centerpiece; reach for it on the Wallet tab, profiles, and at-door verify.

```jsx
<OXCredential material="digital" memberNumber="014" verified
  fields={[
    {label:"Member", value:<em>Mariana Cruz</em>},
    {label:"Tier", value:"Founder"},
    {label:"Since", value:"2024"},
  ]}
  strip="ox.club/token/014 · 0x91…2f" />

<OXCredential material="physical" memberNumber="014"
  fields={[{label:"Member", value:<em>Mariana Cruz</em>},{label:"Pillar", value:"Music"}]}
  strip="Beyond the scene." />

<OXPost author={<>Mariana</>} handle="@mariana · Founder 014" time="2H"
  body="Cold plunge at 6, then the build night ran til 2. Beyond the scene." media liked likes={28} comments={4} />
```

- `material` is the only switch between the two renders; both are soulbound.
- The credential is the ONE place gradients + the 10px radius are allowed — never replicate that styling elsewhere.
- Wrap field/author emphasis in `<em>` for the serif-Oxide accent.
