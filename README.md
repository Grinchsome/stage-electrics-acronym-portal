# Stage Electrics Acronym Learning Portal

A small, public-safe personal glossary for learning acronyms used around theatre, events, electrical work, lifting, lighting, compliance and building services.

This version is deliberately simple:

- No server
- No database
- No login
- No confidential information
- Works as a static website on GitHub Pages
- Acronyms are stored in `data/acronyms.js`
- Personal browser-only additions can be added from the portal page and exported/imported as JSON

## Files

```text
stage-electrics-acronym-portal/
  index.html
  style.css
  script.js
  data/
    acronyms.js
  docs/
    ADDING_ACRONYMS.md
  .nojekyll
```

## Run it locally

Open `index.html` in a browser.

No build step is required.

## Put it on GitHub Pages

1. Create a new GitHub repository, for example `stage-electrics-acronym-portal`.
2. Upload all files from this folder into the repository.
3. Commit the files to the `main` branch.
4. Go to **Settings** → **Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Choose branch `main` and folder `/ (root)`.
7. Click **Save**.
8. GitHub will publish the site and show the Pages URL.

## Public-safe content rule

Do not add confidential or internal-only information. Keep the portal to general learning notes, such as:

- Acronym meanings
- Plain-English definitions
- Generic examples
- General industry context

Avoid adding:

- Customer names
- Job numbers
- Quotes or pricing
- Supplier commercial terms
- Internal processes
- Drawings
- Passwords or login details
- Anything from confidential documents

## Make an acronym permanent

The portal has a form for quick personal additions. Those additions are saved in your browser using local storage.

To make an acronym permanent for everyone who opens the GitHub Pages site, add it to `data/acronyms.js`, then commit and push the change.
