import cors from "cors";
import express from "express";
import helmet from "helmet";
import config from "./config";
import { genericErrorHandler, notFoundError } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import router from "./routes";

const app = express();

// Security and CORS configurations
app.use(helmet());
// app.use(cors());
// app.use(cors({
//   origin: "http://localhost:5173", // Allow requests from your frontend
// }));
app.use(cors({
  origin: "http://localhost:5173", // Allow frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Specify allowed methods
  credentials: true // Allow credentials
}));

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use(router);

// Error handling
app.use(genericErrorHandler);
app.use(notFoundError);

// Start server
app.listen(config.port, () => {
  console.log(`Server started listening on port: ${config.port}`);
});
