import React, { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const App: React.FC = () => {
  const [count, setCount] = useState(0);
  const [fileContent, setFileContent] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setFileContent("");
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Box mb={2}>
        <form>
          <Button variant="contained" component="label">
            Загрузить .txt файл
            <input
              type="file"
              accept=".txt"
              hidden
              onChange={handleFileChange}
            />
          </Button>
        </form>
        {fileContent && (
          <Box mt={2}>
            <Typography variant="h6">Содержимое файла:</Typography>
            <Box
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "#f5f5f5",
                p: 2,
                borderRadius: 1,
              }}
            >
              {fileContent}
            </Box>
          </Box>
        )}
      </Box>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <Button variant="contained">MUI Button</Button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};

export default App;
