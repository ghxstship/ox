First line, what & when: The remaining mobile-app pieces — OTP entry, stepper, notification rows, chat bubbles + composer, wallet tx rows, the mint progress state, avatar stacks, the app banner, skeletons, and onboarding slides. Use to finish out OX app screens.

```jsx
<OXOTP length={6} value="OX14" />
<OXStepper value={guests} min={0} max={2} onChange={setGuests} />
<OXNotif body={<><b>Mariana</b> RSVP'd to Room VI.</>} time="2H" unread />
<OXMessage direction="in" text="Door's open." time="22:04" />
<OXComposer placeholder="Message the house…" value={v} onChange={setV} onSend={send} />
<OXTxRow title="RSVP · Room VI" sub="Mar 14" amount="−$40" />
<OXMintState status="done" title={<>You're <em>014.</em></>} sub="Soulbound on Base." />
<OXAvatarStack initials={["M","D","L","P","N"]} max={4} />
<OXAppBanner label="Mint window · 014 / 580 claimed" trail="OPEN →" />
<OXOnboardSlide index={1} total={3} kicker="The house" title={<>Music, fitness, <em>innovation.</em></>} body="Four pillars. One key." action={<OXButton variant="primary" block arrow>Continue</OXButton>} />
```

- `OXOTP` marks the cell at `value.length` active; `OXNotif` `unread` tints the row Oxide; `OXTxRow` `incoming` colors the amount Oxide; `OXMintState` flips its ring to a check on `status="done"`. All hit targets ≥44px.
