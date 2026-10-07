// Usage: node client.mjs <ESP-IP-address>
const host = process.argv[2];
const TIMEOUT_MS = 5000;

if (!host) {
	console.error("Usage: node client.mjs <ESP-IP-address>");
	process.exit(1);
}

// Wrap IPv6 addresses in brackets, e.g. fe80::1 -> [fe80::1]
const hostPart = (host.includes(":") && !host.startsWith("[")) ? `[${host}]` : host;
const url = `http://${hostPart}:8080/status`;

// Use AbortSignal.timeout when available, otherwise fall back to a manual timer
let timer;
let signal;
if (typeof AbortSignal.timeout === "function")
	signal = AbortSignal.timeout(TIMEOUT_MS);
else {
	const controller = new AbortController();
	timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	signal = controller.signal;
}

try {
	const response = await fetch(url, {signal});
	if (!response.ok)
		throw new Error(`HTTP ${response.status} ${response.statusText}`);
	console.log(await response.json());
} catch (error) {
	const reason = ("TimeoutError" === error.name || "AbortError" === error.name)
		? `timed out after ${TIMEOUT_MS} ms`
		: (error.cause?.message ?? error.message);
	console.error(`Request to ${url} failed: ${reason}`);
	process.exitCode = 1;
} finally {
	clearTimeout(timer);
}
