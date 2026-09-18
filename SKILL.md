---
name: wireframe-review
description: Reset a working prototype to a neutral greyscale wireframe — Helvetica, two weights, one interaction blue, structure untouched — so stakeholders review function, hierarchy and flow rather than the look, and so real design work starts from a clean foundation. Applies a non-destructive theme layer, a neutraliser and an on-page toggle, then verifies the result against the specification. Nothing the user built is lost. Use whenever someone wants to pressure-test or sign off a prototype's structure rather than its appearance; whenever reviews stall on colour or branding; whenever a Lovable, Replit, v0, Bolt, Figma Make or Claude-built prototype needs its product logic assessed before a visual system is applied; whenever someone asks to de-style, neutralise, greyscale, lo-fi, reset, normalise or wireframe an app, page or screen, or to strip generated styling back to a blank slate; and whenever someone asks why their MVP tests badly despite looking finished.
---

# Wireframe Review

Reset a styled prototype to a known neutral baseline that still runs, behind a toggle so the original is one click away. The output is a specification, not a look: the same prototype reset twice should arrive at the same page.

## The specification

| | Target state | Source |
|---|---|---|
| Colour | Greyscale only, mapped to the 10-step ramp by lightness | Rule 1 |
| Interaction | `#2563EB`, on interactive elements and nothing else | Rule 2 |
| Typeface | Helvetica everywhere — headings, body, numerals, code | Rule 3 |
| Weight | 400 and 700 only, quantised at 600 | Rule 3 |
| Corners | Right angles — radius removed everywhere | Rule 1b |
| Contrast | WCAG 2.2 AA: 4.5:1 text, 3:1 large text and controls | Rule 7 |
| Type scale | **Unchanged** | Rule 4 |
| Layout, spacing, borders, shadows | **Unchanged**, resolved to grey | Rule 4 |
| Imagery | Labelled grey block at the original dimensions | Rule 5 |
| Behaviour, routes, states | **Unchanged** and fully working | Rule 6 |

Everything in bold is preserved because it is the evidence. Everything else is removed because nobody decided it. Step 5 is how you prove the page actually reached this state rather than approximately resembling it.

## Why

A prototype built with AI tools arrives fully dressed — a colour scheme, a typeface, gradients, an accent — and almost none of it was decided. It came from the model's defaults, from "make it clean and modern", or from pointing at another product. The founder accepted it rather than chose it.

That creates a specific problem. Everyone in the room can see the colour, so everyone comments on the colour, while the things that decide whether the product works — what is on the screen, in what order, grouped how, leading where — go unexamined.

Two consequences are what make the exercise pay:

- **The interactive surface becomes a shape.** With one colour left, every clickable thing lights up at once. People routinely find a screen with nineteen interactive elements and no discernible primary action.
- **Colour doing load-bearing work becomes visible.** A status that can only be read as red is a comprehension and accessibility risk a styled review will never surface.

And a second use, which for a team about to commission real design work is the larger one: the reset is a **blank slate with the structure still intact**. Layout, flow, states and copy survive; every arbitrary visual decision is gone. That is the boundary a design system wants to attach to. `references/rationale.md` has the full argument and the version to hand a sceptical stakeholder.

## The rules

These are deliberately tight. The output should read as a systematic transformation, not a redesign. Anything that looks like taste has re-entered the picture is a bug.

### 1. Everything resolves to greyscale

White, black, and greys in between. Backgrounds, text, borders, dividers, shadows, icons, chart fills, avatars, badges. Map each original colour to a grey of roughly equivalent lightness so the original contrast relationships survive. Do not flatten everything to one grey; a wireframe with no tonal structure is as useless as one with too much colour.

The ramp in `assets/wireframe.css` gives you ten steps. Use it rather than inventing values.

### 1b. Right angles

Corner radius is removed. Everything is square: containers, cards, buttons, inputs, badges, chips, avatars, round icon buttons.

This is the one structural property the reset takes away, and it is a deliberate exception to rule 4. Radius is never a decision in a generated prototype — it arrives at 8 or 10 or 12 pixels from whatever component library the model had in mind, gets applied uniformly to things with nothing in common, and does more than anything else to make an unfinished product read as finished. A rounded card looks considered. A square one looks like a box with something in it, which is what it is.

It costs nothing that rule 4 protects: a square card occupies exactly the same box as a rounded one, so nothing moves. The self-test still holds geometry to within a pixel with this in force.

Applied to everything rather than to a list of containers. Pills, badges, avatars and round icon buttons are the same decision at different sizes, and squaring the containers while leaving the circles reads as an oversight rather than a rule.

### 2. One blue, and only for things you can click

Links, buttons, icon buttons, tabs, menu items, toggles, checkboxes, filter chips, navigating table rows. Anything that responds to a click or a tap gets the blue. Nothing else does, ever.

The blue is `#2563EB`. It is not a brand colour and should not be treated as one — it should read as a browser default, the visual equivalent of an unstyled link. If someone starts discussing whether they like it, it has failed and should be made flatter, not prettier.

The test for clickable: does it have an `href`, an `onClick`, a `role="button"`, or is it a native form control? Decorative icons inside a clickable parent inherit the blue, because the whole target is the affordance. Disabled controls stay grey — that distinction is part of what you are trying to see.

**Where rules 1 and 2 collide, rule 2 wins.** A dark app bar mapped faithfully to a grey of the same lightness lands at roughly the luminance of the blue, and the links on it vanish. Two escapes, in order: on a filled button, move the blue to the surface and set the label white, which `wireframe.css` already does; on a dark container, mark it `data-wf-dark` and the blue lightens. Never solve it by letting the affordance go grey. An interactive element that does not read as interactive manufactures the very finding you are looking for, and that is the one failure the exercise cannot tolerate.

### 3. Helvetica, regular and bold. Nothing else

One family: Helvetica, falling back to Helvetica Neue then Arial. Everywhere — headings, body, numerals, code blocks, form controls, chart labels. Not "a neutral sans", not "pick one of these three". Helvetica specifically, because a specification that admits alternatives is a preference.

Two weights: 400 and 700, quantised at semibold. Anything the prototype set below 600 becomes regular; 600 and above becomes bold. A threshold, not a mapping — destroying the gradient is the point. Five weights in a careful ramp is a typographic system, and the exercise is to take the system away and see what the structure does without it.

Three things leak past a naive `font-weight` rule. All three are common in generated prototypes and all three are handled in `wireframe.css` section 1:

- **Variable font axes.** `font-variation-settings: 'wght' 550` is a fifth weight no `font-weight` declaration can see.
- **Tailwind weight utilities**, which live in the markup where a rule about elements cannot reach them. `font-medium` is deliberately not promoted: it is 500, below the threshold, and it is the class AI tools reach for on every label and button in the app.
- **OpenType features** — small caps, tabular figures, stylistic alternates. Visual decisions wearing a typeface's clothes.

Keep the type scale. Relative size encodes someone's intent about hierarchy, and you are testing that intent, not overwriting it.

One case the spec gets wrong on purpose: headings built as `<div class="title">` arrive with no bold at all, because the element rule never picks them up. Add the project's selectors to section 8 rather than relaxing the spec — then report it, because a document carrying its whole hierarchy in classes on generic elements has no semantic structure, and that finding beats anything the wireframe was going to tell you.

Toggle chrome is exempt and keeps its own face. Review tooling that matches the product gets reviewed as though it were the product.

### 4. Structure is preserved

Layout, spacing, borders, rules, dividers, shadows, component composition, breakpoints. All of it stays as the prototype has it, resolved to greyscale. The wireframe should be recognisable as the same product, screen for screen.

This is what separates the exercise from a redesign. You are subtracting one variable so the rest can be judged. Start moving things around and you have confounded the experiment; no finding from the session can then be attributed to anything.

Two exceptions. Corner radius is removed outright — see rule 1b, which costs nothing here because a square box occupies the same space as a rounded one. And one that is forced by rule 3: **a typeface has metrics, so text boxes change width.** Replacing the prototype's font with Helvetica is not free. On the test fixture the `h1` text box narrows by 11px. What must not change is vertical position: a line wrapping where it did not before genuinely alters the page being judged, whereas a text box being a few pixels narrower is invisible to a reviewer.

The self-test holds the line in exactly those terms — vertical shift within 2px, document height within 4px, horizontal reflow allowed. If a screen fails it, the usual cause is text that was already one word from wrapping, and the honest fix is to report it rather than to relax the typography.

### 5. Imagery is replaced, not hidden

Photographs, illustrations and decorative graphics become a neutral grey block at the same dimensions, labelled with what the slot holds ("Product photo", "Hero illustration", "User avatar"). Keeping the footprint preserves the layout; the label keeps the content's job legible. Removing images outright changes the composition and breaks rule 4.

Logos become a plain grey wordmark of the product name. Functional graphics that carry data — charts, maps, sparklines — stay, restyled to the grey ramp.

One mechanical limit worth knowing before you go looking for it: an `<img>` is caught automatically, but an image set as a `background` in a stylesheet is not, because CSS cannot select an element by the value of its computed background. Those have to be marked by hand, with `data-wf-placeholder="Hero image"` on the element. Grep the stylesheets for `url(` and you will have the list in a few seconds.

### 6. Everything still works

This is a wireframe, not a picture of one. Every route, state, form, validation message, loading state, empty state, modal and hover behaviour continues to function. The entire value of doing this in code rather than on a canvas is that a stakeholder can attempt a real task and get stuck in a real place.

If a state is unreachable in the running prototype, say so in the report rather than faking it.

### 7. The wireframe itself meets WCAG 2.2 AA

4.5:1 for body text, 3:1 for large text and for the boundary of a control. Enforced, not hoped for.

Neutralising by luminance preserves the prototype's contrast relationships faithfully, which is right for rule 1 and not sufficient on its own: a faithful map of a bad relationship is still a bad relationship. Measured on the test fixture before this rule existed, **the wireframe failed AA in nine places** — a secondary button at 1.4:1, sidebar navigation at 2.2:1.

That is not a cosmetic defect, it is a broken instrument. The exercise exists to reveal where a design leans on colour to carry meaning. If the wireframe is itself hard to read, every hesitation in the session becomes ambiguous — the participant may have stalled on the structure, or because they could not see the text. The finding is lost either way, and the one it manufactures is worse than none.

`wireframe-neutralise.js` enforces this automatically, in a fixed order of remedy:

1. **Switch the blue variant.** On a dark surface the interaction blue goes to the light variant. This is what the stylesheet's `data-wf-dark` escape does by hand, and what nobody remembers to tag — the fixture's sidebar failed for exactly that reason.
2. **Lighten the control's surface.** A mid-grey button with a blue label is the common case; lightening the button fixes it and leaves the label alone.
3. **Adjust the blue itself**, keeping the hue so the element still reads as interactive.

Grey text is fixed by moving the text, not the surface, so the prototype's surfaces stay where the neutraliser put them.

**Rule 2 outranks this rule.** The blue is never traded for a grey to win a contrast argument. If an affordance cannot be made to pass, that is a finding to report, not a thing to paint over.

Two consequences worth expecting. Derived blues are marked `data-wf-blue` so the verifier accepts them and later passes do not grey them — an unmarked derived blue gets neutralised on the next DOM change and the affordance quietly disappears mid-review. And AA here is a floor for the *wireframe*, not a claim about the product: the styled version is a separate question, and one the exercise often raises.

## Before any of this: can you see the code?

Often you cannot. The prototype lives inside Lovable, Replit, v0, Bolt or Figma Make and the person asking has never exported anything. `references/getting-the-code.md` covers both routes: the cheap one that never leaves the platform, and the real export, per tool.

Take the cheap route seriously rather than as a fallback. `assets/harvest.js` is a console snippet that reports what the running page is actually made of — every colour and its frequency, typefaces and weights, whether colour lives in tokens or utilities or hardcoded values, how many things are interactive and how many of those have no visual affordance. No export, no repository, no terminal, and enough to write a theme layer tailored to this prototype rather than the general-purpose one bundled here.

It is also a finding. `nonGrey` is how many distinct non-grey colours the interface paints. A dozen is a palette. Forty is an accumulation, and saying so usually lands harder than anything that comes later.

Where you do have the code, run the harvest anyway. Source tells you what was intended; the harvest tells you what is on the screen, and the gap is often the whole story.

## How to do it without destroying anything

The person you are helping is working inside Lovable, Replit, v0, Bolt or similar. Branching is the developer's answer and it is the wrong one here: it pulls them out of the tool they are actually using and leaves them managing two versions of something they are still changing daily.

Use a theme layer and a toggle instead. Both states live in one running app and the switch is instant. Phrase every instruction to the tool as *adding files and one import* — these tools are good at additive changes and unreliable at sweeping edits, and additive is what keeps it reversible.

### Step 1 — Find where colour is decided

Work out how the prototype expresses colour before changing anything. The harvest answers this directly in its `stack` section. The answer is one of: **custom properties** on `:root` or a theme object (the good case — override in one place); **Tailwind utilities** written into the markup, common in AI-built apps; **hardcoded hex** scattered through inline styles and components (the messy case); or **a component library theme**, which usually reduces to custom properties underneath.

`references/stacks.md` has the override technique for each, plus the tool-specific notes for Lovable, Replit, v0 and Bolt. Use the scoped-override approach rather than find-and-replace: find-and-replace is destructive, misses things, and cannot be undone with a click.

### Step 2 — Add the theme layer and the neutraliser

Copy `assets/wireframe.css` into the project and import it once, globally. It defines the grey ramp, the interaction blue, the typography spec and a set of token overrides, all scoped under `.wireframe-mode` on `<html>`. Nothing applies until that class is present, so adding the file changes nothing on its own.

**Then copy `assets/wireframe-neutralise.js` and load it too. This is not optional.** The stylesheet reaches colour two ways — design-token overrides, and selectors you add in section 8 — and neither is general. A prototype that writes `background:#1e1b4b` into a class, or `style="color:#16a34a"` into the markup, is untouched by both, which describes most generated prototypes. Measured on `tests/fixture`: the stylesheet alone leaves **72 rule-1 violations on one screen** while passing rule 3 completely. With the neutraliser, zero. Ship the CSS on its own and the page looks broadly grey, the founder believes the exercise ran, and the leaks sit on the screens nobody demoed.

The neutraliser reads each element's computed colour and writes back the grey of equivalent luminance — equivalent luminance, not a flat grey, so contrast relationships survive as rule 1 requires. It skips the interaction blue by value wherever it finds it, which keeps rule 2 intact. It crosses shadow roots, watches for DOM changes so routed apps neutralise screens reached later, and tracks every property it writes so switching off restores the styled state exactly.

For Tailwind, also copy `assets/wireframe-tailwind.css` and import it immediately after the base sheet. Skip it for any other stack.

Then extend the sheet for this project's specifics in section 8, inside the `.wireframe-mode` scope. Never edit the prototype's own styles. The base sheet uses `:where()` throughout, so an ordinary `html.wireframe-mode .your-class` rule in section 8 wins without tricks; if an override is not taking, something else is probably using `!important`.

### Step 3 — Add the toggle

Copy `assets/wireframe-toggle.js` and mount it — a script tag before `</body>` for plain HTML, or the React component version at the bottom of the same file. It renders a small fixed control that flips `.wireframe-mode` on `<html>`, remembers the choice, and responds to Alt+W.

It lives in a shadow root so the theme layer cannot reach it. Review chrome that restyles itself along with the product is confusing, and chrome that looks like part of the product gets reviewed as though it were.

Bottom right by default, because top right is where products put their account menu and their primary action, and the control must not cover the thing under review. Move it if the prototype has something there — on mobile layouts it usually does, since that corner is where the floating action button lives.

Two details that matter in review: the toggle must be reachable from every screen, and switching must not reload or reset state. A stakeholder mid-task needs to flip to the styled version, ask "is that the same screen?", and flip back without losing their place.

### Step 4 — Check what the neutraliser cannot reach

Three things are outside the reach of both the stylesheet and the neutraliser, because they are not styled DOM at all. Deal with them by hand before verifying:

1. **Canvas and chart library configs**, which take colours as JavaScript values. `references/stacks.md` § 5.
2. **CSS background images.** An `<img>` is caught automatically; a `background: url(...)` is not, because CSS cannot select an element by the value of its computed background. Mark those by hand with `data-wf-placeholder="Hero image"`. Grep the stylesheets for `url(` and you have the list in seconds.
3. **Emoji**, which are full-colour glyphs that survive anything done in CSS.

Everything else — inline styles, hardcoded class colours, gradients, tinted shadows, SVG fill and stroke, focus rings, scrollbars, shadow roots — the neutraliser handles. That was not true of earlier versions of this skill, which asked you to sweep all of it manually; if you have run this before, that step is gone.

### Step 5 — Verify against the specification

Do not skip this and do not substitute looking at the screen. "It looks greyscale" is not a result. A prototype can be clean on the screen you demoed and leaking on the three you did not, and the leaks cluster precisely there.

Turn wireframe mode on and run `assets/verify.js` in the console **on every main screen**. It checks the running page against the specification and reports pass or fail per rule, with the offending elements, outlining the first sixty in magenta so you can see where they are. It walks shadow roots as well as the light DOM.

The bar is zero violations on rules 1, 1b, 2, 3, 5 and 7. Anything else is not done.

Rules 4 and 6 cannot be checked by a script and the verifier says so rather than printing a green tick it has not earned. Compare screenshots for rule 4; click through for rule 6.

What the verifier still cannot see, so check by eye:

- **Emoji.** Full-colour glyphs; no CSS colour property describes them.
- **Canvas.** A bitmap, not styled elements. Chart libraries take colours as JavaScript values — `references/stacks.md` § 5.
- **Anything in a cross-origin iframe.** Neither CSS nor script reaches into it. Say so in the report rather than working around it.

### Step 6 — Report what the wireframe showed

The transformation is the setup. This is the part that produces the value. Write a short, plain list covering:

- Screens where no primary action is identifiable once colour is gone.
- Places where meaning depended on colour alone, with what the fallback should be.
- Elements that turn out to be clickable but do not look it, and things that look clickable but are not.
- Groups that read as related when coloured but fall apart when neutral, usually because the grouping was carried by a tint rather than by proximity or a container.
- Screens carrying more than one idea, visible now that a shared background is no longer holding them together.
- Any interactive element you could not reach or exercise.
- **How much work section 8 took.** This is a finding, not housekeeping. A prototype where the overrides took ten minutes has a design system in embryo; one where they took hours does not have one at all, and the same absence is what will make every future change expensive. Do not bury it.

Keep it descriptive. The reviewer's job is to decide what to do about these; yours is to make them visible.

## The review protocol

Hand this to whoever is running the session. It is in `references/review-protocol.md` in a form you can paste into a doc.

The short version: start in wireframe mode, give a participant a real task, say nothing, and write down every hesitation. Only afterwards switch to the styled version and ask whether anything they struggled with looks resolved there. If it does, the styling is compensating for a structural problem, and the problem is still there under the paint.

## When not to use this

- The prototype is a marketing page or brand piece where the visual treatment *is* the product. Stripping it removes the thing under review.
- The visual language was deliberately researched and agreed, and the question on the table is a specific one about that language.
- The prototype is too early to have structure worth testing. Three screens of placeholder text will not tell you anything.

Say so rather than performing the exercise anyway.

---

Method developed at Man Made, a product design practice working with founders taking AI-built products to market. manmade.com
