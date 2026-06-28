# 05 · State Machines

> The lifecycles the backend + UI must implement. States map to enums in `02`.
> Each transition lists trigger → guard (capability/condition) → effects.

## Booking (class)
```
(none) --book[class.book; capacity>booked]--> booked
(none) --book[capacity==booked]--> waitlist
waitlist --slot opens (someone cancels)--> booked   (auto-promote, notify)
booked --cancel[>cutoff]--> cancelled
booked --cancel[<cutoff]--> late_cancel  (penalty: fee or strike)
booked --no show at start--> no_show     (penalty)
booked --checkin.scan--> attended  (+XP, updates streak)
```
- Cutoff window configurable per floor (e.g. 12h). Penalty policy = TeamUp parity.
- Effects on `attended`: award XP, bump streak, mark Recovery for worked muscles.

## Workout session
```
planned --POST /workouts--> active
active --POST sets (per set)--> active   (set.done toggles; rest timer between)
active --finish--> completed   (effects below)
active --abandon (24h idle)--> discarded
```
- On `completed`: compute `xpAwarded` (volume × intensity), update `PR` if any
  set beats record, set `Recovery` states (worked/spent), append to feed if shared.

## Checkout / order
```
cart --POST /checkout--> placed
placed --PaymentIntent.succeeded (webhook)--> paid
placed --PaymentIntent.failed--> cart   (surface error, keep items)
paid --fulfillment--> fulfilled
placed|paid --cancel--> cancelled
```
- Level-gated products: guard at `add to cart` AND server checkout (`gateLevel <= user.level`).

## Ticket (event/raid)
```
(none) --reserve tier[qty>0]--> reserved
reserved --free OR PaymentIntent.succeeded--> paid
reserved --timeout (hold expires)--> released (qty returns)
paid --scan QR (checkin.scan)--> checked_in  (+rewardXp to attendee)
paid --refund--> refunded (qty returns)
```

## Payment (Stripe)
```
pending --succeeded--> paid
pending --failed--> failed
failed --POST /payments/:id/retry[revenue.view]--> pending
paid --refund--> refunded
```
- `failed` memberships surface in operator Dashboard banner + Payments recovery queue; dunning via Redis-scheduled retries.

## Membership
```
(none) --subscribe--> active
active --payment failed x N--> past_due
past_due --recovered--> active
active --pause--> paused --resume--> active
active|paused --cancel--> cancelled (access ends at period end)
```

## XP / Level
```
event(+xp): workout completed | class attended | ticket checked_in | quest done | challenge milestone
xp += amount
while xp >= threshold(level): xp -= threshold(level); level += 1; emit level-up (badge, feed)
```
- Thresholds from `tokens/fitness.css` level curve. Level changes can unlock gated drops.

## Challenge (Iron Safari)
```
upcoming --startsAt--> active --(progress events)--> active
active --endsAt--> settled  (rank, award medals/XP, post results)
```

## Session / RBAC (auth)
```
signed_out --otp verify--> signed_in(role,scope)
signed_in --switch role / sign out--> signed_out
```
- Role + scope come from the verified token only; never client-mutable in prod.
