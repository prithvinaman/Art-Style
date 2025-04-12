# ArtistAI - AI-powered Art Companion

ArtistAI is a modern, responsive web application that provides AI-powered feedback and assistance for artists. The application allows users to upload their artwork for analysis and chat with an AI assistant about art-related topics.

## Features

- **Art Analysis**: Upload your artwork to receive detailed feedback on composition, color balance, lighting, and style
- **Art Chat**: Ask questions about art techniques, history, styles, or get personalized guidance
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, minimalist interface with smooth animations and transitions

## Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- Google Fonts (Poppins)
- Gemini 2.0 Flash API for both image and text analysis

## Setup

1. Clone the repository:
```
git clone https://github.com/yourusername/artist-ai.git
cd artist-ai
```

2. Open `index.html` in a web browser to view the application.

3. To integrate with the Gemini API:
   - Get your API key from Google AI Studio (https://ai.google.dev/)
   - Replace `YOUR_GEMINI_API_KEY` in `app.js` with your actual API key
   - Uncomment the API call code and comment out the mock response code

## Project Structure

- `index.html` - Main HTML structure
- `styles.css` - All styling for the application
- `app.js` - JavaScript functionality for user interaction and API integration

## Usage

1. Click "Start Creating" on the homepage to open the chat interface
2. Upload your artwork using the "Upload Artwork" button
3. Click "Analyze Artwork" to receive AI feedback
4. Type art-related questions in the chat input to get responses from the AI

## Future Enhancements

- User accounts and saved conversation history
- Gallery of analyzed artworks
- Progress tracking for improvement suggestions
- Community features to share art and feedback

## License

MIT

## Acknowledgements

- This project uses the Gemini API from Google
- Inspired by artists' need for objective feedback and guidance 