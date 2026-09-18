---
name: wireframe-review
description: Strip a working prototype back to a neutral greyscale wireframe so stakeholders can review function, hierarchy and flow without being distracted by visual design. Applies a non-destructive theme layer plus an on-page toggle between the current design and the wireframe, so nothing the user built is lost or overwritten. Use this whenever someone wants to review, pressure-test or get sign-off on a prototype's structure rather than its look; whenever design reviews keep stalling on colour, branding or "I'm not sure about the blue"; whenever a Lovable, Replit, v0, Bolt, Figma Make or Claude-built prototype needs its product logic assessed before a visual system is applied; whenever someone asks to de-style, neutralise, greyscale, lo-fi or wireframe an existing app, page or screen; and whenever someone asks how to tell whether their prototype's hierarchy actually works or why their MVP tests badly despite looking finished.
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
| Type scale | **Unchanged** | Rule 4 |
| Layout, spacing, radii, borders, shadows | **Unchanged**, resolved to grey | Rule 4 |
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

### 4. Structure is preserved exactly

Layout, spacing, corner radii, borders, rules, dividers, shadows, component composition, breakpoints. All of it stays as the prototype has it, resolved to greyscale. The wireframe should be recognisable as the same product, screen for screen.

This is what separates the exercise from a redesign. You are subtracting one variable so the rest can be judged. If you start moving things around, you have confounded the experiment and the review is worthless.

### 5. Imagery is replaced, not hidden

Photographs, illustrations and decorative graphics become a neutral grey block at the same dimensions, labelled with what the slot holds ("Product photo", "Hero illustration", "User avatar"). Keeping the footprint preserves the layout; the label keeps the content's job legible. Removing images outright changes the composition and breaks rule 4.

Logos become a plain grey wordmark of the product name. Functional graphics that carry data — charts, maps, sparklines — stay, restyled to the grey ramp.

One mechanical limit worth knowing before you go looking for it: an `<img>` is caught automatically, but an image set as a `background` in a stylesheet is not, because CSS cannot select an element by the value of its computed background. Those have to be marked by hand, with `data-wf-placeholder="Hero image"` on the element. Grep the stylesheets for `url(` and you will have the list in a few seconds.

### 6. Everything still works

This is a wireframe, not a picture of one. Every route, state, form, validation message, loading state, empty state, modal and hover behaviour continues to function. The entire value of doing this in code rather than on a canvas is that a stakeholder can attempt a real task and get stuck in a real place.

If a state is unreachable in the running prototype, say so in the report rather than faking it.

## Before any of this: can you see the code?

Often you cannot. The prototype lives inside Lovable, Replit, v0, Bolt or Figma Make and the person asking has never exported anything. `references/getting-the-code.md` covers both routes: the cheap one that never leaves the platform, and the real export, per tool.

Take the cheap route seriously rather than as a fallback. `assets/harvest.js` is a console snippet that reports what the running page is actually made of — every colour and its frequency, typefaces and weights, whether colour lives in tokens or utilities or hardcoded values, how many things are interactive and how many of those have no visual affordance. No export, no repository, no terminal, and enough to write a theme layer tailored to this prototype rather than the general-purpose one bundled here.

It is also a finding. `nonGrey` is how many distinct non-grey colours the interface paints. A dozen is a palette. Forty is an accumulation, and saying so usually lands harder than anything that comes later.

Where you do have the code, run the harvest anyway. Source tells you what was intended; the harvest tells you what is on the screen, and the gap is often the whole story.

## How to do it without destroying anything

The person you are helping is working inside Lovable, Replit, v0, Bolt or similar. Branching is the developer's answer and it is the wrong answer here: it pulls them out of the tool they are actually using and leaves them managing two versions of a thing they are still changing daily.

Use a theme layer and a toggle instead. Both states live in one running app and the switch is instant.

### Step 1 — Find where colour is decided

Before changing anything, work out how the prototype expresses colour. The harvest answers this directly in its `stack` section; if you have not run it, the answer is one of:

- **CSS custom properties** on `:root` or a theme object. The best case. You override in one place.
- **Tailwind utility classes** written literally into the markup (`bg-blue-600`, `text-slate-400`). Common in AI-built apps. Handled with a CSS layer that overrides the utilities under a scope class, not by rewriting every className.
- **Hardcoded hex values** scattered through inline styles and component files. The messy case.
- **A component library theme** (shadcn/ui, MUI, Chakra). Usually reduces to custom properties underneath.

Read `references/stacks.md` for the override technique for each. It matters that you use the scoped-override approach rather than find-and-replace: find-and-replace is destructive, misses things, and cannot be undone with a click.

**If the colours turn out to be scattered and hardcoded, say so plainly.** The effort required to strip the styling is a direct measure of how little system the prototype has. A codebase where this takes ten minutes has a design system in embryo. One where it takes hours does not have one at all, and that is worth the founder knowing, because the same absence is what will make every future change expensive. Do not bury this in the work; it is one of the more useful things the exercise reveals.

### Step 2 — Add the wireframe theme layer

Copy `assets/wireframe.css` into the project and import it once, globally. It defines the grey ramp, the interaction blue, the typeface and a set of overrides, all scoped under `.wireframe-mode` on the `<html>` element. Nothing applies until that class is present, so adding the file changes nothing on its own.

If the prototype writes colour into the markup as Tailwind utilities, which most v0 and Lovable output does, also copy `assets/wireframe-tailwind.css` and import it immediately after. It is long and enumerated rather than clever, for a reason the file explains. Skip it for any other stack.

Then extend it for the project's specifics: whatever selectors, utilities or custom properties this particular prototype uses. Put those in section 8 at the bottom of the file, inside the `.wireframe-mode` scope. Never edit the prototype's own styles.

The base sheet is written with `:where()` and guarded attribute selectors throughout, which score zero or close to it, so an ordinary `html.wireframe-mode .your-class` rule in section 8 will win without needing tricks. If an override is not taking effect, check the cascade before reaching for a doubled class: something else in the project is probably using `!important`.

### Step 3 — Add the toggle

Copy `assets/wireframe-toggle.js` and mount it. It renders a small fixed control in the bottom right that flips `.wireframe-mode` on `<html>`, remembers the choice, and also responds to Alt+W. It lives in a shadow root so the theme layer cannot reach it: review chrome that restyles itself along with the product is confusing, and chrome that looks like part of the product gets reviewed as though it were.

Bottom right by default because top right is where products put their account menu and their primary action, and the one thing the control must not do is cover the thing under review. Move it if the prototype has something there instead.

For a React project there is a component version in the same file. For a plain HTML prototype, a script tag before `</body>` is enough.

Two details that matter in review: the toggle should be reachable from every screen, and switching should not reload or reset state. A stakeholder mid-task needs to flip to the styled version, ask "is that the same screen?", and flip back without losing their place.

### Step 4 — Sweep for colour that escaped

The theme layer will not catch everything. Check these, in this order, because they are the usual survivors:

1. Inline `style` attributes with literal colours.
2. `fill` and `stroke` on inline SVG, including icon sets.
3. Canvas and chart library configs, which take colours as JavaScript values, not CSS.
4. Images and gradients used as CSS backgrounds.
5. `box-shadow` with a tinted colour rather than a neutral.
6. Focus rings, selection highlights, scrollbars and other browser-default accents.
7. Emoji, which are full colour and will survive anything you do in CSS.

A fast check: turn the wireframe on and screenshot each main screen. Any colour that is not the interaction blue is a leak. `references/stacks.md` has a short script for flagging non-greyscale computed styles if the app is large.

### Step 5 — Report what the wireframe showed

The transformation is the setup. This is the part that produces the value. Write a short, plain list covering:

- Screens where no primary action is identifiable once colour is gone.
- Places where meaning depended on colour alone, with what the fallback should be.
- Elements that turn out to be clickable but do not look it, and things that look clickable but are not.
- Groups that read as related when coloured but fall apart when neutral, usually because the grouping was carried by a tint rather than by proximity or a container.
- Screens carrying more than one idea, visible now that a shared background is no longer holding them together.
- Any interactive element you could not reach or exercise.

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
