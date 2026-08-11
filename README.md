# 💧 Water Quality Monitor

## Project Description

This project is a full-stack Internet of Things (IoT) system designed for real-time monitoring of a water filtration process. It integrates microcontroller hardware for sensor data acquisition with a modern web interface for data visualization.

The system consists of two main components:

1. **Hardware (ESP32):** Responsible for reading data from water filtration sensors and transmitting the data to the server.
2. **Web Interface (Frontend):** Built with Next.js to render the analytics dashboard, receive real-time data via a WebSocket connection, and display it to the user.

## Tech Stack

- **IoT / Hardware:** ESP32, C/C++, PlatformIO.
- **Frontend:** Next.js (React), TypeScript, Tailwind CSS.
- **Data Communication:** WebSocket (Real-time bidirectional connection).

## Repository Structure

This repository uses a simple monorepo approach, separating the microcontroller environment from the web development environment:

- `/esp32/` - Contains the C/C++ microcontroller source code configured using the PlatformIO structure.
- `/frontend/` - Contains the Next.js web application, user interface functionality, WebSocket server, and custom hooks (such as `useReadSocket`).

## Prerequisites

Before running this project, ensure your system has the following installed:

- [Node.js](https://nodejs.org/) (version 18 or newer)
- [PlatformIO IDE](https://platformio.org/) (as a VS Code Extension)
- ESP32 Board & relevant Sensor Modules (e.g., Turbidity, TDS, Flow Meter).

## Getting Started

### 1. ESP32 Configuration and Upload

1. Open the `/esp32` folder using VS Code with the PlatformIO extension installed[cite: 1].
2. Open the `src/main.cpp` file (or the relevant configuration file) and adjust your WiFi credentials (SSID & Password) as well as the **IP Address** of your WebSocket Server[cite: 1].
3. Connect the ESP32 board to your computer.
4. Build and Upload the code via the PlatformIO menu.

### 2. Running the Frontend & WebSocket Server

1. Open your terminal and navigate to the frontend directory[cite: 1]:

```bash
cd frontend
```

2. Install all project dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open http://localhost:3000 in your browser to access the water monitoring dashboard.

## Author

Bagus Mustaqim (main man):

- LinkedIn: https://linkedin.com/in/bagus-mustaqim-1a858325b/

Muhammad Fachrezi Barus (Front-end UI):

- LinkedIn: https://www.linkedin.com/in/muhammad-fachrezi-barus/
