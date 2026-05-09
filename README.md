# Toyota Price Finder

A simple static web app to search Toyota price-list data by:

- `Model Name`
- `Fuel Type`
- `Variant`

When a matching car is selected, the app displays its price details on the page.

## Project Structure

```text
.
├── data/
│   └── cars.js
├── app.js
├── index.html
├── styles.css
└── README.md
```

## How to Run

Because this is a plain HTML/CSS/JS app, you can open `index.html` directly in the browser.

If you prefer using VS Code:

1. Open this folder in VS Code.
2. Install the `Live Server` extension.
3. Right-click `index.html`.
4. Click `Open with Live Server`.

## How to Keep Committing During Development

Initialize git once:

```powershell
git init
git add .
git commit -m "Initial Toyota price finder app"
```

Then commit after each small milestone:

```powershell
git add .
git commit -m "Add searchable dropdown filters"
git commit -m "Refine dataset and price cards"
git commit -m "Polish layout for mobile"
```

## How to Push to GitHub

Create a new empty GitHub repository, then run:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## How to Make It Public on the Internet

The easiest option for this project is `GitHub Pages`.

After you push the code to GitHub:

1. Open your repository on GitHub.
2. Go to `Settings`.
3. Open `Pages`.
4. Under `Build and deployment`, choose:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
5. Click `Save`.

GitHub will give you a public link like:

```text
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

Anyone with that link can open and use the website in their browser.

## Notes

- The current dataset is manually seeded from the uploaded Toyota price-list images.
- Some rows may need a second pass for validation against the original images.
- The easiest next improvement is to move the dataset into JSON or connect it to a small backend later.
