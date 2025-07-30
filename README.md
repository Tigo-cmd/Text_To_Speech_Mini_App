# Text-to-Speech Frontend Application

A modern, responsive React application that converts text to speech using a backend TTS API. Built with TypeScript, Tailwind CSS, and modern web technologies.

## ✨ Features

### Core Functionality
- **Text Input**: Clean textarea with character counter (5,000 character limit)
- **Voice Selection**: Dropdown menu with available voices from backend
- **Audio Playback**: Full-featured HTML5 audio player with:
  - Play/pause controls
  - Progress scrubbing
  - Volume control
  - Time display
  - Download functionality

### User Experience
- **Loading States**: Smooth loading indicators during processing
- **Error Handling**: Comprehensive error messaging with retry functionality
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Dark Mode**: Automatic system preference detection with manual toggle
- **Accessibility**: ARIA labels, keyboard navigation, and focus management

### Technical Features
- **Polling System**: Automatic retry mechanism for backend processing
- **Request Timeout**: 30-second timeout with abort controller
- **Error Recovery**: Graceful fallback for failed API requests
- **Type Safety**: Full TypeScript implementation
- **Modular Architecture**: Clean component separation and reusability

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A running TTS backend API (see API Configuration below)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd text-to-speech-frontend
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and set your API endpoint:
```env
VITE_API_BASE_URL=http://localhost:3000
```

3. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 API Configuration

### Required Backend Endpoints

Your backend API must provide these endpoints:

#### 1. Convert Text to Speech
```http
POST /api/tts
Content-Type: application/json

{
  "text": "Hello world",
  "voice": "optional-voice-id",
  "format": "mp3"
}
```

**Response:**
```json
{
  "taskId": "unique-task-identifier"
}
```

#### 2. Retrieve Generated Audio
```http
GET /api/tts/{taskId}
```

**Responses:**
- `202 Accepted` - Still processing (frontend will retry)
- `200 OK` - Audio ready (returns binary audio data with `audio/mpeg` or `audio/wav` content-type)
- `404 Not Found` - Task not found
- `500 Internal Server Error` - Processing failed

#### 3. Get Available Voices (Optional)
```http
GET /api/tts/voices
```

**Response:**
```json
[
  {
    "id": "voice-1",
    "name": "Sarah (Neural)",
    "language": "en-US",
    "gender": "female"
  },
  {
    "id": "voice-2",
    "name": "John (Neural)",
    "language": "en-US", 
    "gender": "male"
  }
]
```

### API Configuration Options

Set these environment variables in your `.env` file:

```env
# Backend API base URL (required)
VITE_API_BASE_URL=http://localhost:3000

# Optional: Custom timeout settings
VITE_REQUEST_TIMEOUT=30000
VITE_MAX_RETRIES=10
VITE_RETRY_DELAY=2000
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AudioPlayer.tsx  # Full-featured audio player
│   ├── ErrorMessage.tsx # Error display with retry
│   ├── LoadingSpinner.tsx # Loading indicators
│   ├── TextToSpeechForm.tsx # Main form component
│   ├── ThemeToggle.tsx  # Dark/light mode toggle
│   └── VoiceSelector.tsx # Voice selection dropdown
├── services/           # API integration layer
│   └── api.ts          # TTS API client with error handling
├── types/              # TypeScript definitions
│   └── tts.ts          # TTS-related interfaces
├── App.tsx             # Main application component
├── index.css           # Global styles and utilities
└── main.tsx            # Application entry point
```

## 🛠 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
```

## 🎨 Customization

### Styling
The app uses Tailwind CSS with a clean, modern design system:
- **Colors**: Blue primary, gray neutrals, semantic colors for states
- **Typography**: Inter font family with proper hierarchy
- **Spacing**: 8px grid system
- **Components**: Consistent border radius, shadows, and transitions

### Theme Support
Automatic dark mode detection with manual override:
- Respects system preference
- Persistent user choice in localStorage
- Smooth transitions between themes

### Accessibility Features
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators
- Reduced motion respect
- High contrast support

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` | Yes |

## 🚦 Error Handling

The application includes comprehensive error handling:

- **Network Errors**: Automatic retry with exponential backoff
- **Timeout Handling**: 30-second request timeout with user feedback  
- **Validation**: Client-side input validation with helpful messages
- **API Errors**: Proper error message display from backend responses
- **Audio Errors**: Graceful handling of audio playback issues

## 🧪 Testing Your API

You can test your backend API endpoints using curl:

```bash
# Test text submission
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","format":"mp3"}'

# Test audio retrieval (replace TASK_ID with actual ID)
curl -X GET http://localhost:3000/api/tts/TASK_ID \
  --output test-audio.mp3

# Test voices endpoint
curl -X GET http://localhost:3000/api/tts/voices
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
1. Check the browser console for error messages
2. Verify your backend API is running and accessible
3. Confirm environment variables are set correctly
4. Test API endpoints directly using curl or Postman

## 🔮 Future Enhancements

Potential improvements for future versions:
- **Batch Processing**: Convert multiple texts simultaneously
- **Audio History**: Save and manage previous conversions
- **Custom Voices**: Upload and use custom voice models
- **SSML Support**: Advanced speech markup language features
- **WebSocket**: Real-time processing status updates
- **Audio Editing**: Basic trim, fade, and speed controls