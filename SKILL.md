---
name: wireframe-review
description: Strip a working prototype back to a neutral greyscale wireframe so stakeholders can review function, hierarchy and flow without being distracted by visual design. Applies a non-destructive theme layer plus an on-page toggle between the current design and the wireframe, so nothing the user built is lost or overwritten. Use this whenever someone wants to review, pressure-test or get sign-off on a prototype's structure rather than its look; whenever design reviews keep stalling on colour, branding or "I'm not sure about the blue"; whenever a Lovable, Replit, v0, Bolt, Figma Make or Claude-built prototype needs its product logic assessed before a visual system is applied; whenever someone asks to de-style, neutralise, greyscale, lo-fi or wireframe an existing app, page or screen; and whenever someone asks how to tell whether their prototype's hierarchy actually works or why their MVP tests badly despite looking finished.
---

# Wireframe Review

Turn a styled prototype into a greyscale wireframe that still runs, sitting behind a toggle so the original is one click away.

## Why anyone would want this

A prototype built with AI tools arrives fully dressed. It has a colour scheme, a typeface, gradients, shadows, an accent. Almost none of that was decided. It came from the model's defaults, from a one-line instruction ("make it clean and modern"), or from pointing at another product and saying "like that". The founder did not choose it so much as accept it.

That creates a specific problem in review. Everyone in the room can see the colour, so everyone comments on the colour. Meanwhile the things that decide whether the product works — what is on the screen, in what order, grouped how, leading where — go unexamined, because they are harder to see and harder to talk about.

Removing the visual layer is not an aesthetic judgement. It is a way of forcing attention onto the part of the design that carries the argument. When the colour goes, hierarchy has to be carried by order, grouping, weight and space. If it cannot be, that is the finding.

Two consequences worth naming up front, because they are what makes the exercise pay:

- **The interactive surface becomes a shape.** With only one colour left in the interface, every clickable thing lights up at once. People routinely discover a screen with nineteen interactive elements and no discernible primary action.
- **Every place colour was doing load-bearing work becomes visible.** If a status can only be read as red, the design depends on colour to mean something. That is a real accessibility and comprehension risk that a styled review will never surface.

## The rules

These are deliberately tight. The output should read as a systematic transformation, not a redesign. Anything that looks like taste has re-entered the picture is a bug.

### 1. Everything resolves to greyscale

White, black, and greys in between. Backgrounds, text, borders, dividers, shadows, icons, chart fills, avatars, badges. Map each original colour to a grey of roughly equivalent lightness so the original contrast relationships survive. Do not flatten everything to one grey; a wireframe with no tonal structure is as useless as one with too much colour.

The ramp in `assets/wireframe.css` gives you ten steps. Use it rather than inventing values.

### 2. One blue, and only for things you can click

Links, buttons, icon buttons, tabs, menu items, toggles, checkboxes, chips that filter, table rows that navigate, and any other element that responds to a click or a tap. Anything interactive gets the blue. Nothing else does, ever.

The blue is `#2563EB`. It is not a brand colour and should not be treated as one. It should read as a browser default — the visual equivalent of an unstyled link. If someone in the review starts discussing whether they like the blue, it has failed at its job and should be made flatter, not prettier.

Practical test for what counts as clickable: does it have an `href`, an `onClick`, a `role="button"`, or is it a native form control? If yes, it is blue. Decorative icons sitting inside a clickable parent do inherit the blue, because the whole target is the affordance.

Interactive elements that are disabled stay grey. That distinction is part of what you are trying to see.

**Where rules 1 and 2 collide, rule 2 wins.** A dark app bar or sidebar, mapped faithfully to a grey of the same lightness, lands at roughly the same luminance as the blue, and the links on it vanish. Two escapes, in order of preference: on a filled button, move the blue to the surface and set the label white, which `wireframe.css` already does; on a dark container, mark it `data-wf-dark` and the blue lightens. Never solve it by letting the affordance go grey. An interactive element that does not read as interactive is the one failure the exercise cannot tolerate, because it manufactures the very finding you are looking for.

### 3. One generic sans, and nothing else

Inter, Geist or Helvetica. Pick one and apply it everywhere, including headings, code blocks and numerals. The point is a typeface with no opinion. A distinctive display face is a brand decision wearing a font's clothes, and it will pull the review back toward the look.

Keep the existing type scale. The relative sizes in the prototype encode someone's intent about hierarchy, and you are here to test that intent, not to overwrite it. Normalise the family and let the structure show.

Restrict weights to two: a regular and one heavier. Six weights is a visual system, not a wireframe.

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

Often you cannot. The prototype lives inside Lovable, Replit, v0, Bolt or Figma Make, and the person asking has never exported anything. Start at `references/getting-the-code.md`, which covers both routes: the cheap one that never leaves the platform, and the real export, per tool.

Take the cheap route seriously rather than treating it as a fallback. `assets/harvest.js` is a console snippet that reports what a running page is actually made of — every colour and its frequency, the typefaces and weights, whether colour lives in tokens or utilities or hardcoded values, how many things are interactive and how many of those have no visual affordance. It is two to four kilobytes, it needs no export, no repository and no terminal, and it is enough to write a theme layer tailored to that specific prototype rather than the general-purpose one bundled here.

It is also a finding in its own right. The `nonGrey` count is how many distinct non-grey colours the interface paints. Five to a dozen is a palette. Forty is an accumulation, and saying so out loud usually lands harder than anything that comes later.

Where you do have the code, run the harvest anyway. Source tells you what was intended; the harvest tells you what is on the screen, and the gap between those two is often the whole story.

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
