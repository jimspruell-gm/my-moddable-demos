import {Server} from "http";

const PORT = 8080;
const JSON_HEADERS = ["Content-Type", "application/json"];

let requests = 0;

const server = new Server({port: PORT});

server.callback = function(message, value, etc) {
	// "this" is the current request, not the server
	if (Server.status === message) {
		this.path = value;
		this.method = etc;
		trace(`${etc} ${value}\n`);
	}

	if (Server.prepareResponse === message) {
		if (("GET" !== this.method) || ("/status" !== this.path)) {
			trace(`404 ${this.method} ${this.path}\n`);
			return {status: 404, headers: JSON_HEADERS, body: JSON.stringify({error: "Not found"})};
		}

		requests += 1;
		trace(`200 /status (request ${requests})\n`);
		return {
			headers: JSON_HEADERS,
			body: JSON.stringify({
				device: "moddable-six",
				message: "Hello from XS JavaScript",
				requests
			})
		};
	}
};

trace(`API listening on port ${PORT}\n`);
