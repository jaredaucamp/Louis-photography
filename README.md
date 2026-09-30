# Louis Photography: wedding photography site

A one-page site for a documentary wedding photographer. It walks future
couples through a wedding day in time order, from getting ready to the last
song, then shows how you work, your stories, pricing basics and an inquiry form.

Plain HTML, CSS and JavaScript. There's no build step: open `index.html` or put the folder on any static host.

## Files
- `index.html`: all page content
- `css/style.css`: design tokens (colors, fonts, spacing) at the top, then each section
- `js/main.js`: menu, scroll reveals, the contact-sheet pencil circles and the inquiry form
- `images/`: put your photos here

## Adding your photos
Every photo spot is a `<figure class="frame ...">` with a caption that says
what kind of shot belongs there. To use a real photo, add an `<img>` inside the figure:

```html
<figure class="frame ratio-4x5 tone-window">
  <img src="images/getting-ready-1.jpg" alt="Bride buttoning her dress by the window">
  <figcaption class="frame__note">…</figcaption>
</figure>
```

The placeholder caption hides automatically once an image is there. Export
photos at about 2000px on the long edge, as JPG or WebP at roughly 80% quality.

The contact sheet (`.strip__frame`) works the same way: drop an `<img>` into
each `<li>`. Use 12 frames from one real moment, and keep the `is-select`
class (the pencil circle) on your best ones.

## Placeholders to replace
Search the files for `[`:
- Price range (in Investment)
- Couple names and venues in Stories
- Reviews: use real ones and credit them (never write made-up reviews)
- Hours, delivery time, starting price
- `hello@example.com` in `index.html` and `INQUIRY_EMAIL` in `js/main.js`
- The Instagram link in the footer

## Inquiry form
The form opens the visitor's email app with their details filled in. To receive
inquiries without relying on that, point the form at a service such as
Formspree or Netlify Forms.

## Publishing
- **Netlify or Cloudflare Pages** (free, works with private repos): connect the
  repo, leave the build command empty, publish directory `/`.
- **GitHub Pages**: Settings → Pages → deploy from the `main` branch. Free
  accounts need the repo to be public for this.

## Fonts
**Ibarra Real Nova** (headings) and **Jost** (text and labels), from Google
Fonts. Both are free for commercial use (SIL Open Font License).
