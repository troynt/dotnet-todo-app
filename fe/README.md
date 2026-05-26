# bun-react-tailwind-template

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## gRPC Web Developer Tools

This project is pre-configured with the `connect-devtools` interceptor. All gRPC-Web requests, responses, and errors are automatically logged to the gRPC Web Developer Tools extension.

### Installation

1. Install the extension for your preferred browser:
   - [Chrome Web Store](https://chrome.google.com/webstore/detail/grpc-web-developer-tools/kanmilmfkjnoladbbamlclhccicldjaj)
   - [Firefox Add-Ons](https://addons.mozilla.org/en-US/firefox/addon/grpc-web-developer-tools/)
2. Open your browser's developer tools (`F12`).
3. Select the **gRPC** tab.
4. Run the application and interact with it (e.g., managing todo items/lists) to see the gRPC payloads logged in real-time.
