First line, what & when: The editorial / journal block — article header, the prose wrapper, pullquote, figure, and read-more. Use for any long-form dispatch, journal entry, or about page.

```jsx
<OXArticleHeader kicker="Field notes · No. 03" title={<>The room is the <em>proof.</em></>}
  byline={["Andrés Beltrán","Founder 003","March · MMXXVI"]} />
<OXProse>
  <p>We started the listening room because the city did not have one. The <em>sound system</em> is the reason you came.</p>
  <OXPullquote>We are not building a venue. We are building a <b>standard.</b></OXPullquote>
  <OXFigure caption="Pre-set · OX House · 22:48" />
  <p><OXReadMore href="#">Read the full dispatch</OXReadMore></p>
</OXProse>
```

- `OXProse` sets a ~640px measure with serif headings; `<em>` becomes the Oxide italic, `<ul>/<ol>` get the ruled markers, `<blockquote>` the Oxide rule — author plain HTML inside.
- `OXPullquote` accent words go in `<b>`; `OXFigure` renders a media placeholder if you pass no children.
