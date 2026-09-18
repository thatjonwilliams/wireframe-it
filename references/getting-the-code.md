# Getting the prototype to Claude

Everything in SKILL.md assumes you can already see the code. This file covers the step before that: the prototype lives inside Lovable, Replit, v0, Bolt or Figma Make, and it has to reach Claude somehow.

Checked 14 September 2026. These platforms rename menus often, and several of the details below could only be confirmed from community reports rather than official docs, which is flagged where it applies. If a label here does not match what you see, trust the screen.

---

## Contents

1. [First, protect the work](#1-first-protect-the-work)
2. [Which route](#2-which-route)
3. [Route A: no export](#3-route-a-no-export)
4. [Route B: export the project](#4-route-b-export-the-project)
5. [Handing it to Claude](#5-handing-it-to-claude)
6. [What never comes with the code](#6-what-never-comes-with-the-code)

---

## 1. First, protect the work

Do this before touching anything, on any platform.

The failure that actually happens is not a bad export. It is someone believing their work was backed up when it was not. A public example from the Replit community forum, dated 11 September 2026, three days before this file was written: a user lost roughly two months of production work after the agent damaged their source files, and found that the most recent usable commit was two months old. They had connected a repository and assumed that meant it was syncing.

So:

1. Connect the platform to GitHub if it supports it, then **open github.com and look at the date on the latest commit.** A connected repository is not a synced repository. The only proof is the timestamp.
2. Take a snapshot you control — a ZIP download, a `git clone`, anything that lives on your own disk.
3. If the platform has version history or checkpoints, note where it is before you need it, not after.

None of this is about the wireframe exercise. It is about the fact that you are going to ask an AI agent to change your files, and you want a way back.

---

## 2. Which route

Two ways to get from a prototype to a wireframe, and the cheap one is right more often than people expect.

**Route A, no export.** Run a snippet in the browser on your prototype's preview, paste the result to Claude, get back a short stylesheet written for your specific project, paste that into your platform's chat. Nothing leaves the tool you are already working in. Takes about ten minutes.

**Route B, export the project.** Get the real source code out, work on it properly, put it back.

Take Route A if you want to run one review and see what turns up, or you are not comfortable running commands in a terminal, or your prototype has a backend inside the platform that would be painful to reproduce. Take Route B if the review is the start of real work, or your prototype has more than a handful of screens, or you want the wireframe to stay available.

Route A is also the honest first step for a founder who is not sure the exercise is worth it. Do the cheap version, look at what it shows you, then decide.

---

## 3. Route A: no export

### Step 1 — harvest

Open your prototype's live preview in Chrome. Not the editor, the running app. Open the console (View → Developer → JavaScript Console, or F12, then the Console tab), paste the contents of `assets/harvest.js`, and press Enter.

It changes nothing and sends nothing anywhere. It reads the page and reports what it is made of: every colour and how often each is used, the typefaces and weights, the corner radii, whether the project uses design tokens or Tailwind utilities or hardcoded values, how many interactive elements there are, and how many of them have no visual affordance at all. The result copies itself to the clipboard, and is usually two to four kilobytes.

Read the first few numbers before you go any further. `colours.nonGrey` is the count of distinct non-grey colours the page is painting right now. A designed interface uses somewhere between five and a dozen. Forty is not a palette, it is an accumulation. That number alone is often the moment the exercise justifies itself.

### Step 2 — ask Claude for a layer

Paste the harvest to Claude with this:

> This is a harvest from my prototype, taken with the wireframe-it skill. Write me a wireframe theme layer for this specific project: a single CSS file scoped under `.wireframe-mode` on `<html>`, plus the toggle, following the skill's rules. Map every colour in the harvest to the grey ramp at roughly matching lightness, keep the interaction blue for clickable things only, and use the token names and class names that actually appear here rather than generic ones. Give me the file contents and exactly what to tell my platform's AI to do with them.

Because the layer is written from what the page actually contains, it is short — usually well under a hundred lines — rather than the general-purpose sheet the skill ships. That matters for the next step, since you have to paste it into a chat box.

### Step 3 — put it back

Paste Claude's file contents into your platform's chat with an instruction along these lines:

> Add a new file `wireframe.css` in the global styles folder with exactly the contents below, and import it once globally after the existing stylesheets. Add `wireframe-toggle.js` with the contents below and load it once at the app root. Do not change any other file, do not modify existing styles, and do not adjust any component. These files do nothing until a class is added to the html element, so the app should look identical after this change.

Then check the app looks the same. If it does not, the platform edited something it was told not to, and you should undo and try again with a narrower instruction.

Two platform-specific notes, both verified in the platforms' own documentation:

- **Lovable** will do this, and its own guidance is that stating what you do not want works as well as stating what you do: "Redesign the schedule page header. Don't change the navigation or the booking form." Its documentation also warns that styling "is not always wired into the build automatically", so confirm the import landed.
- **Figma Make** routes library imports through a CDN rather than script tags, and there is no documented way to add an arbitrary script. The CSS half of this will work; the toggle may need Route B.

For Replit, v0 and Bolt, nothing is documented either way about how reliably the agent handles this instruction. They all edit files by prompt, so it works in practice, but check the result rather than assuming.

### Step 4 — turn it on

The toggle appears in the bottom right of the running app. If it did not mount, open the console and run `document.documentElement.classList.add('wireframe-mode')` — that is all the toggle does, and it confirms whether the stylesheet arrived.

---

## 4. Route B: export the project

### Lovable

- **GitHub, two-way.** Project settings → Git → GitHub → Connect. Lovable creates a private repo and syncs both directions: changes you push to the active branch come back into Lovable. Available on all plans.
- **ZIP.** Project settings → Git → Download codebase, or the Code tab → Download codebase at the bottom of the file panel. **Paid plans only** — on Free the code editor is read-only with an upgrade prompt.
- Projects are Vite/React with npm, Node 22, building to `dist/`. Newer projects may instead be scaffolded on TanStack Start, which needs a Node server rather than static hosting. Lovable's own documentation is inconsistent on this, so open `package.json` and see.
- **Lovable only syncs one branch at a time.** Work on any other branch is invisible inside Lovable.
- **Disconnecting is effectively permanent**: reconnecting creates a *new* repository rather than reattaching to the old one, and importing an existing repo is not supported. The ZIP is a one-way snapshot with no path back in.

### Replit

- **ZIP.** Three-dot menu at the top of the file tree → Download as zip. If it fails on a large project, open the Shell, run `zip -r project.zip .`, and download that from the file tree.
- **Git.** Tools → + → Git, then Initialize repository or connect to a provider. Stage, commit, push. This is ordinary Git, not a managed mirror: **what you push to GitHub does not appear in Replit until someone pulls it.**
- Delete `.replit` and `replit.nix` before running anywhere else.
- Secrets export from the Secrets pane via "Edit as .env". The development database never leaves the app; only a published app has a production database you can reach with `pg_dump`.
- Replit does not document what stack the agent generates, and community reports describe output mixing Vite, Express and Next.js conventions, sometimes with the real app nested a level deeper than expected. Open `package.json` first.

### v0

- **ZIP.** Project three-dot menu → Download Zip. Free. Reported to grey out or hang on "waiting for sandbox to start"; the workaround is to open the terminal and run `tar -czf project.tar.gz .`, then take it from the file explorer.
- **GitHub, two-way.** Project menu → Settings → GitHub → Connect. Branch-based, with Publish and Pull Changes actions.
- Next.js, React, TypeScript, Tailwind, shadcn/ui. `npm install && npm run dev`.
- **Once connected, the repository becomes the source of truth for the project.** A bad push overwrites v0's copy. There is a documented case of a project ending up as nothing but a README; recovery was scrolling back in the chat history and clicking Restore.
- The old `npx shadcn add` route for pulling a single component into an existing codebase was removed in early 2026. It is the whole project now.

### Bolt

- **ZIP.** Project title, top left → Export → Download. Free.
- **GitHub, two-way.** GitHub icon, top right. Bolt auto-commits and polls GitHub every thirty seconds for outside changes.
- Vite, React, Tailwind. `npm install && npm run dev`.
- **On a conflict, Bolt keeps its own version and overwrites GitHub's.** Disconnecting is permanent. Only the project owner sees the GitHub icon.
- Watch for hardcoded `localhost` URLs pointing at the in-browser mock API; they survive the export and break outside it.

### Figma Make

The hardest of the five, so budget for it.

- **ZIP.** Download code, upper right of the code editor. Requires a Full or Dev seat.
- **GitHub, one-way.** Make settings → GitHub → Create Repository. Figma's own documentation is explicit: "If you edit your code in GitHub, those changes won't appear in Figma Make and will be overwritten next time you push." Press coverage describing a two-way integration refers to a different product surface, the Mac-only closed beta that runs Make against a local codebase.
- One repository per Make file, always pushing to the default branch, and it cannot push to a repo that already exists.
- **The download has a long-running reputation for not being a runnable project** — reports through 2025 and into 2026 of missing `package.json`, `tsconfig.json`, Vite and Tailwind config, version-pinned imports like `@radix-ui/react-switch@1.1.3`, and asset directories the code refers to but which are not in the ZIP. Figma's docs say the ZIP contains every file in the Make file; the community says otherwise and the conflict is unresolved. Assume you will be reconstructing config.
- If you later edit outside Figma, know that Make regenerates `globals.css` on every export, which collides with Vite's `index.css`. Import only `index.css`, have it `@import` the Figma file, and put your own rules below.

### Claude's own outputs

If the prototype is a Claude artifact, the code is already available: open the artifact, use the controls in its lower right to view the code, copy it, or download the file. If it was built with Claude Code, the files are already in your working directory and there is nothing to export.

---

## 5. Handing it to Claude

Pick whichever you already have.

**Claude Code, in the project folder.** The best option if the export ran locally. Claude reads the whole codebase, writes the theme layer, and you see the result in your own browser. Nothing to upload.

**Cowork with a connected folder.** Connect the folder the export landed in and ask for the wireframe review. Same as above without the terminal.

**claude.ai, uploading files.** You do not need the whole project, and a full ZIP is mostly `node_modules` noise. Upload:

- the global stylesheet — `index.css`, `globals.css`, `app.css`, `styles.css`, whichever exists
- `tailwind.config.js` or `tailwind.config.ts`, if present
- the theme or token file, if colour is defined somewhere of its own
- two or three representative screen or component files
- and the harvest from Route A, which is worth including even when you have the code, because it says what the page actually paints rather than what the source suggests it might

**GitHub.** If the platform is connected to a repo and Claude can reach it, point Claude at the repo. Remember Lovable syncs one branch, Replit needs a manual pull, and Figma Make will overwrite what you push.

---

## 6. What never comes with the code

Worth knowing before you plan around it, because this is where "I exported my app" turns into a weekend.

Exporting gives you the front end. On every platform reviewed here, none of the following come with it:

- the contents of any database the platform hosts for you
- uploaded files in the platform's storage
- secret values and API keys, which are write-only and have to be collected again from wherever they came from
- authentication, row-level security rules, and any serverless or edge functions
- deployment configuration

For a wireframe review this mostly does not matter — you are looking at structure, and screens that need live data can be reviewed against whatever the prototype already shows. It matters enormously if you were planning to move off the platform. Those are different projects, and it is worth being clear with yourself about which one you have started.
