# Why strip the styling

The long version of the argument. `SKILL.md` carries a compressed form of it; this is the one to paste into a doc, send to a sceptical stakeholder, or read before facilitating a session for the first time.

---

## The problem with a dressed prototype

A prototype built with AI tools arrives fully dressed. It has a colour scheme, a typeface, gradients, shadows, an accent. Almost none of that was decided. It came from the model's defaults, from a one-line instruction ("make it clean and modern"), or from pointing at another product and saying "like that". The founder did not choose it so much as accept it.

That creates a specific problem in review. Everyone in the room can see the colour, so everyone comments on the colour. Meanwhile the things that decide whether the product works — what is on the screen, in what order, grouped how, leading where — go unexamined, because they are harder to see and harder to talk about.

Removing the visual layer is not an aesthetic judgement. It is a way of forcing attention onto the part of the design that carries the argument. When the colour goes, hierarchy has to be carried by order, grouping, weight and space. If it cannot be, that is the finding.

Two consequences worth naming up front, because they are what makes the exercise pay:

- **The interactive surface becomes a shape.** With only one colour left in the interface, every clickable thing lights up at once. People routinely discover a screen with nineteen interactive elements and no discernible primary action.
- **Every place colour was doing load-bearing work becomes visible.** If a status can only be read as red, the design depends on colour to mean something. That is a real accessibility and comprehension risk that a styled review will never surface.

---

## The second use: a blank slate

Everything above is about review. There is a second reason to run this, and for a team about to commission real design work it is the larger one.

A generated prototype does not have a visual design. It has an accumulation — a colour from one prompt, a radius from a component library, a font from a template, a shadow from whatever the model saw most in training. Nothing in it was decided, but all of it is now load-bearing in the sense that the next designer has to work around it, or argue with it, or quietly undo it while being asked why the redesign is taking so long.

The reset produces something better than a blank page: a version of the product with its structure fully intact and every arbitrary decision removed. Layout, spacing, component composition, routes, states and copy all survive. Colour, typeface, weight ramp and imagery do not. That is exactly the boundary a design system wants to attach to.

It also converts the question "what should this look like?" — which is unanswerable in the abstract and generates opinion — into "what should this *mean*?", asked one decision at a time against a page where the absence is visible. Which of these nineteen blue things is the primary action. What does this status need to say when it cannot be red. Which of these two headings is the higher level. Every one of those is a design system decision, and the wireframe puts them on the screen as gaps rather than leaving them buried under a treatment that already half-answers them.

Teams that use it this way tend to keep the toggle in the app well past the review, because it doubles as a regression check: turn the styling off and see whether the structure still holds up. It usually degrades faster than anyone expects.
