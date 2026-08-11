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