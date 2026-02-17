# Quick Explainer

A beautiful, editorial-style AI-powered app that transforms complex text into clear, simple explanations.

![Screenshot](screenshot.png)

## Features

- ✨ **Multiple explanation levels**: Simple, Detailed, or "Like I'm 5"
- 🤖 **Dynamic model fetching**: Fetches available models from your API endpoint
- 🌙 **Dark/Light mode**: Toggle between warm paper and sleek dark themes
- 📚 **History**: Recent explanations saved locally (last 10 items)
- 📋 **One-click copy**: Copy explanations instantly
- 🔄 **Regenerate**: Try again with the same input
- 🔒 **Privacy-first**: API key stored only in your browser (localStorage)

## Getting Started

### 1. Open the App

Simply open `index.html` in your browser, or deploy to GitHub Pages:

```bash
# For GitHub Pages
1. Push these files to a repository
2. Go to Settings → Pages
3. Select branch: main, folder: root
4. Your app is live!
```

### 2. Configure Settings

Click **Settings** to configure:

- **Base URL**: Your API endpoint (e.g., `https://api.openai.com/v1`)
- **API Key**: Your API key (starts with `sk-...`)
- **Default Model**: Select from available models (auto-fetched from your API)

### 3. Start Explaining

1. Paste confusing text into the input area
2. Choose your explanation level
3. Click **"Explain It"**
4. Get a clear, beautiful explanation

## Supported APIs

This app uses the OpenAI-compatible API format, so it works with:

- **OpenAI** (`https://api.openai.com/v1`)
- **Azure OpenAI** (custom base URL)
- **OpenRouter** (`https://openrouter.ai/api/v1`)
- **Self-hosted models** (llama.cpp, text-generation-webui, etc.)
- **Any OpenAI-compatible endpoint**

## Privacy & Security

- ✅ Your API key is stored only in your browser's localStorage
- ✅ API calls are made directly from your browser to your API endpoint
- ✅ No data is sent to any third-party servers
- ✅ No analytics or tracking

## Customization

### Changing the Design

Edit `styles.css` to customize:

```css
:root {
  --accent: #C45C3E;        /* Change primary color */
  --bg-primary: #FAF8F5;    /* Change background */
  --font-display: 'Your Font'; /* Change display font */
}
```

### Adding More Explanation Levels

Edit `app.js` and modify `levelInstructions`:

```javascript
const levelInstructions = {
    simple: '...',
    detailed: '...',
    eli5: '...',
    academic: 'Explain this in academic language with citations...'
};
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## File Structure

```
├── index.html      # Main HTML structure
├── styles.css      # Editorial design system + animations
├── app.js          # Application logic
└── README.md       # This file
```

## License

MIT License - use it, modify it, sell it. It's yours!

---

Built with vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies.
