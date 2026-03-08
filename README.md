# 🍯 MEAD - Fueling Strategy Planner

A lightweight, self-contained web application for tracking and visualizing athletic fueling needs. No backend required—everything runs in your browser with data stored locally.

## Features

- **Athlete Profile Management**: Track weight, goals, and GI tolerance
- **Workout Logging**: Record sessions with type, time, duration, and intensity
- **Fueling Calculations**: Automatic carb requirement calculations based on:
  - Athlete weight
  - Workout duration
  - Workout intensity
- **Pre-Workout Recommendations**: Get meal timing suggestions
- **Data Persistence**: All data stored locally in browser (localStorage)
- **Export/Import**: Backup and restore your data as JSON
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Option 1: GitHub Pages (Recommended for GitHub Sites)

1. Clone/copy this folder to your GitHub Pages repository
2. Ensure `index.html` is accessible at your desired path (e.g., `richardmcmanus.com/mead/`)
3. Push to GitHub and visit your site

### Option 2: Local Development

Simply open `index.html` in your browser. No server required!

```bash
# Or serve locally with Python 3
python -m http.server 8000
# Visit http://localhost:8000
```

## Project Structure

```
mead/
├── index.html          # Main application
├── css/
│   └── style.css       # Styling with custom color scheme
├── js/
│   └── app.js          # Core application logic
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

## How It Works

1. **Enter Your Profile**: Set your weight (kg), performance goal, and GI tolerance
2. **Add Workouts**: Record today's planned or completed sessions
3. **Generate Plan**: Click "Generate Plan" to see carb requirements
4. **View Recommendations**: See pre-workout meal times and carb targets
5. **Export Data**: Backup your data anytime as JSON

### Fueling Algorithm

Carbs during workout = **Weight (kg) × Duration (hrs) × Intensity Factor**

Intensity factors:
- **High intensity**: 1.0 g/kg/hr
- **Medium intensity**: 0.7 g/kg/hr
- **Low intensity**: 0.5 g/kg/hr

Pre-workout meals are recommended 3 hours before each session based on duration/intensity.

## Data Storage

- All data stored in **browser localStorage** (no backend needed)
- Data persists between sessions
- Export regularly to backup important data
- Clear your browser data/cache to reset the app

## Customization

### Colors

Edit the CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #8b7355;       /* Mead brown */
    --accent-color: #d4a574;        /* Honey gold */
    /* ... more colors ... */
}
```

### Fueling Calculations

Modify intensity multipliers in `js/app.js`:
```javascript
const intensityMultipliers = {
    'high': 1.0,
    'medium': 0.7,
    'low': 0.5
};
```

## Deployment to GitHub Pages

### For `username.github.io/mead/` path:

1. Place entire folder in your GitHub Pages repo at `/mead/`
2. Update any relative paths if needed (already configured)
3. Push to GitHub
4. Access at `https://username.github.io/mead/`

### For custom domain:

Same process—the app works with any path structure.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## License

Free to use and modify for personal use.

---

**Built with ❤️ for athletes who fuel with purpose.**
