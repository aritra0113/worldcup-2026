# WorldCupPulse 2026 MVP v2

This version includes:

- Today / next matches tab
- Groups tab
- All remaining group fixtures tab
- My Teams tab
- Discussion tab
- Country flags
- Follow teams
- Goal notification demo

## Run

```bash
npm.cmd install
npm.cmd run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173/
```

## Main files

- `src/data/matches.js` contains the fixture data.
- `src/main.jsx` contains the app logic.
- `src/styles.css` contains the design.

This is still an MVP with static fixture data. For production live goals, connect a backend to a football data API.
