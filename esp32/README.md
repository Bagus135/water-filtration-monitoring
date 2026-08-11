# ESP32

This directory contains the firmware for the ESP32-based water quality monitoring system.

The ESP32 firmware is developed using **PlatformIO** with the **Arduino framework** and is responsible for sensor data acquisition, water quality monitoring, relay control, and communication with the WebSocket server.

## Framework and Development Platform

This project uses:

- **PlatformIO** — development and build environment
- **Arduino Framework** — embedded development framework
- **ESP32 DOIT DevKit V1** — target development board

The project configuration is defined in:

```text
esp32/
└── platformio.ini
```

Example configuration:

```ini
[env:esp32doit-devkit-v1]
platform = espressif32
board = esp32doit-devkit-v1
framework = arduino
monitor_speed = 115200
upload_speed = 115200
```

## Responsibilities

The ESP32 firmware handles:

- pH sensor data acquisition
- TDS sensor data acquisition
- Turbidity sensor data acquisition
- Before and after filtration measurements
- ADC data processing and averaging
- Relay control
- IR sensor input
- Wi-Fi connection
- WPA2-Enterprise authentication using PEAP + MSCHAPv2
- WebSocket/WSS communication
- Periodic sensor data transmission
- Automatic WebSocket reconnection

## Project Structure

```text
esp32/
├── include/
├── lib/
├── src/
│   ├── env.h
│   └── main.cpp
├── test/
├── .gitignore
├── platformio.ini
└── README.md
```

### `src/`

Contains the main ESP32 firmware.

```text
src/
└── main.cpp
```

`main.cpp` contains the implementation for:

- Sensor reading
- Sensor data processing
- Relay control
- Wi-Fi connection
- WPA2-Enterprise authentication
- WebSocket connection
- JSON data transmission


# Environment Configuration

This project uses an `env.h` file to store sensitive configuration such as Wi-Fi credentials and the WebSocket authentication token.

## File Structure

```text
src/
├── env.h
```

## 1. Create `env.h`

Create a file named `env.h` inside the `src/` directory:

```text
src/env.h
```

Add the following configuration:

```cpp
#ifndef ENV_H
#define ENV_H

// ==============================
// Wi-Fi Configuration
// ==============================

const char* ssid = "INTEGRA";

// WPA2-Enterprise PEAP + MSCHAPv2
const char* wifi_identity = "username@domain";
const char* wifi_username = "username@domain";
const char* wifi_password = "YOUR_WIFI_PASSWORD";

// ==============================
// WebSocket Configuration
// ==============================

const char* device_token = "YOUR_DEVICE_TOKEN";

#endif
```

## 2. Wi-Fi Configuration

The project uses **WPA2-Enterprise** with:

```text
Security        : WPA2-Enterprise
EAP Method      : PEAP
Inner Auth      : MSCHAPv2
Identity        : username@domain
Username        : username@domain
Password        : Wi-Fi password
```

Replace the placeholder values with your actual credentials:

```cpp
const char* wifi_identity = "username@domain";
const char* wifi_username = "username@domain";
const char* wifi_password = "YOUR_WIFI_PASSWORD";
```

For example:

```cpp
const char* wifi_identity = "student@domain.ac.id";
const char* wifi_username = "student@domain.ac.id";
const char* wifi_password = "your-password";
```

> Do not use the example credentials above. Replace them with your own account.


## 3. WebSocket Token

The `device_token` is used to authenticate the ESP32 when connecting to the WebSocket server.

```cpp
const char* device_token = "YOUR_DEVICE_TOKEN";
```

Replace `YOUR_DEVICE_TOKEN` with the token configured on the backend server.

Example:

```cpp
const char* device_token = "your-secret-device-token";
```

## 4. Security

The `env.h` file contains sensitive information.

**Do not commit the actual `env.h` file to Git.**

Add the following to `.gitignore`:

```gitignore
src/env.h
```

This prevents the file from being tracked by Git.
