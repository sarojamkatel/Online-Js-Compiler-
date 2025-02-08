// server.ts
import { ChildProcess, spawn } from "child_process";
import cors from "cors";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

const app = express();
app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket: Socket) => {
  console.log("A user connected");

  // Spawn a TypeScript server process
  const tsServer = spawn("tsserver", ["--stdio"]);
  let buffer = "";
  let seq = 0;

  // Handle data received from TypeScript server
  tsServer.stdout.on("data", (data: Buffer) => {
    buffer += data.toString();
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const message = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (message.startsWith("{")) {
        try {
          const response = JSON.parse(message);
          if (response.type === "response") {
            if (response.command === "completions" && response.body) {
              socket.emit("completion", response.body);
            } else if (response.command === "semanticDiagnosticsSync") {
              socket.emit("diagnostics", response.body);
            }
          }
        } catch (error) {
          console.error("Error parsing TS server response:", error);
        }
      }
    }
  });

  // Handle errors from TypeScript server
  tsServer.stderr.on("data", (data: Buffer) => {
    console.error(`TypeScript Server Error: ${data}`);
  });

  // Handle incoming code updates from clients
  socket.on("codeUpdate", (code: string) => {
    sendOpenRequest(tsServer, code);
    sendCompletionRequest(tsServer, code);
    sendDiagnosticsRequest(tsServer);
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
    tsServer.kill();
  });

  /**
   * Sends an open request to the TypeScript server to open a virtual file.
   * @param tsServer - The TypeScript server process.
 Refined version of KDD Cup 1999 data sets

Filter-based and wrapper based feature selection

ANN with wrapper based selection gives accuracy of 94.02%

SVM gives accuracy of 82.34%
   * @param code - The code content to be sent.
   */
  function sendOpenRequest(tsServer: ChildProcess, code: string) {
    const openRequest = {
      seq: seq++,
      type: "request",
      command: "open",
      arguments: {
        file: "/virtual.ts",
        fileContent: code,
        scriptKindName: "TS",
      },
    };
    tsServer.stdin.write(JSON.stringify(openRequest) + "\n");
  }

  /**
   * Sends a completion request to the TypeScript server to get code completions.
   * @param tsServer - The TypeScript server process.
   * @param code - The code content to be used for completion.
   */
  function sendCompletionRequest(tsServer: ChildProcess, code: string) {
    const completionRequest = {
      seq: seq++,
      type: "request",
      command: "completions",
      arguments: {
        file: "/virtual.ts",
        line: 1,
        offset: code.length + 1,
        prefix: code.split(/\s/).pop() || "",
      },
    };
    tsServer.stdin.write(JSON.stringify(completionRequest) + "\n");
  }

  /**
   * Sends a diagnostics request to the TypeScript server to ge
 Refined version of KDD Cup 1999 data sets

Filter-based and wrapper based feature selection

ANN with wrapper based selection gives accuracy of 94.02%

SVM gives accuracy of 82.34%t semantic diagnostics.
   * @param tsServer - The TypeScript server process.
   */
  function sendDiagnosticsRequest(tsServer: ChildProcess) {
    const diagnosticsRequest = {
      seq: seq++,
      type: "request",
      command: "semanticDiagnosticsSync",
      arguments: { file: "/virtual.ts" },
    };
    tsServer.stdin.write(JSON.stringify(diagnosticsRequest) + "\n");
  }
});

const PORT = 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(` lsp Server running on port ${PORT}`);
});
