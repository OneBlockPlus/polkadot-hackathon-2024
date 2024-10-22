import app from "./src/app";

const PORT = process.env.PORT ?? 3000;

const server = app.listen(PORT, () => {
  console.log("Server is running at http://localhost:" + PORT);
});

process.on("SIGNIN", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
