# Video Chat Application

A real-time video chat application built with LiveKit, Express, and WebRTC.

## Features

- Real-time video and audio communication
- Screen sharing
- Multiple participants support
- Mute/unmute microphone
- Enable/disable camera
- Responsive UI

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- LiveKit account and credentials

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd video-chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your LiveKit credentials:
```env
LIVEKIT_HOST=your_livekit_host
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
PORT=3000
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Development

To run the server in development mode with auto-reload:
```bash
npm run dev
```

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server in development mode
- `npm run setup` - Install all dependencies
- `npm run install-deps` - Install production dependencies

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| LIVEKIT_HOST | Your LiveKit server URL | Yes |
| LIVEKIT_API_KEY | Your LiveKit API key | Yes |
| LIVEKIT_API_SECRET | Your LiveKit API secret | Yes |
| PORT | Server port (default: 3000) | No |

## Project Structure

```
video-chat-app/
├── server.js         # Express server and LiveKit configuration
├── app.js            # Client-side application logic
├── index.html        # Main HTML file
├── styles.css        # CSS styles
├── package.json      # Project dependencies and scripts
├── .env              # Environment variables (not in git)
└── .env.example      # Example environment variables
```

## Troubleshooting

1. **Cannot find module 'dotenv'**
   - Run `npm install dotenv`

2. **Port already in use**
   - Change the PORT in .env file or kill the process using the port

3. **LiveKit connection issues**
   - Verify your LiveKit credentials in .env file
   - Check your network connection
   - Ensure LiveKit server is accessible

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 