<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Verifying a change to the public templates

`tsc`, `eslint` and `npm run build` all pass on a template that renders
unreadable text or scrolls sideways on a phone. Every visual regression this
project has had got through all three, so none of them is evidence a template
still works.

```bash
npm run test:e2e        # every template, both widths, both colour schemes
```

The suite drives `/preview/mock/{layoutVariant}`, which renders each template
from sample data with no backend running. It asserts the things that are never
intentional - a component that throws, an empty page, sideways scroll, a
heading that has vanished into its background - and deliberately not what a
design looks like, which is a judgement and would break on every intended
change.

Headings sitting over a photo or a gradient are skipped rather than guessed at;
judging those needs real pixels. A skip is reported as a skip so a green run is
never mistaken for coverage it does not have.

Note that `images.unsplash.com` is blocked in the sandbox, so the sample photos
fall back to `SafeImage`'s drawn placeholder. That is expected, and the failed
requests are filtered out of the console-error check.
