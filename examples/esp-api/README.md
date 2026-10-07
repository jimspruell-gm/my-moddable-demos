# esp-api: Node.js desktop client → Moddable XS HTTP server on ESP32

A minimal desktop-to-device networking example:

```
Node.js client (client.mjs)  --HTTP GET /status-->  ESP32 HTTP server (main.js, port 8080)
```

- `main.js` runs on a Moddable Six (ESP32-S3) using the Moddable SDK HTTP `Server`.
- `client.mjs` runs on your Linux/macOS/Windows computer using Node's built-in `fetch` (no npm packages).

| File | Runs on | Purpose |
|---|---|---|
| `manifest.json` | build host | Moddable build manifest (base + network + HTTP) |
| `main.js` | ESP32 | HTTP server on port `8080` |
| `client.mjs` | desktop | Calls `http://<ip>:8080/status` and prints the JSON |

## API

| Request | Response |
|---|---|
| `GET /status` | `200`, `application/json`: `{"device":"moddable-six","message":"Hello from XS JavaScript","requests":N}` |
| anything else | `404`, `application/json`: `{"error":"Not found"}` |

`requests` increments on every successful `/status` call and resets when the device restarts.

## Prerequisites

- Node.js 18 or later (built-in `fetch`; `AbortSignal.timeout` is used when available).
- [Moddable SDK](https://github.com/Moddable-OpenSource/moddable) built for your host, with `MODDABLE` set and its tools (`mcconfig`, `xsbug`) on your `PATH`.
- ESP-IDF installed and set up as described in the Moddable [ESP32 getting started guide](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/devices/esp32.md) (`IDF_PATH` set and `export.sh` sourced).
- A Moddable Six connected by USB.
- A 2.4 GHz Wi-Fi network shared by the board and your computer.

## 1. Build and flash the ESP app

> **Note:** flashing this example replaces the app currently on the board.

From the repository root (Linux/macOS):

```bash
source "$IDF_PATH/export.sh"

# Optional: set the serial port if it is not detected automatically
export UPLOAD_PORT=/dev/ttyACM0

cd examples/esp-api
mcconfig -d -m -p esp32/moddable_six ssid="YOUR_WIFI_NAME" \
  password="YOUR_WIFI_PASSWORD"
```

On Windows (ESP-IDF command prompt), use `set UPLOAD_PORT=COM3` instead of `export`.

`-d` builds a debug app and connects it to `xsbug` (use `-dl` instead for the terminal-based `xsbug-log`). When the board joins Wi-Fi, the trace output shows its IP address followed by:

```
API listening on port 8080
```

You can also find the IP address in your router's connected-device list.

## 2. Run the desktop client

In a second terminal, from the repository root, pass the board's IP address (not `localhost`):

```bash
node examples/esp-api/client.mjs 192.168.1.123
```

Expected output:

```
{
  device: 'moddable-six',
  message: 'Hello from XS JavaScript',
  requests: 1
}
```

Run it again and `requests` increases. You can also try it with curl: `curl -i http://192.168.1.123:8080/status`.

On failure (bad IP, wrong network, HTTP error, or no response within 5 seconds) the client prints an error and exits with status `1`.

## Debugging notes

- Each request is logged with `trace()` and appears in `xsbug` (or `xsbug-log`).
- If the app is paused at an `xsbug` breakpoint, the device cannot respond and the client will likely hit its 5-second timeout. Resume the app and run the client again.

## Security note

This is a local-network demo only: it uses plain HTTP with **no authentication and no TLS**. Anyone on the same network can call the endpoint. Do not expose it to the internet or use it to control anything sensitive.
