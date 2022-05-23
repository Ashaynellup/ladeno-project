import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"
import App from "./App"
import "./index.css"
import { MantineProvider } from "@mantine/core"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        colorScheme: "light",
        fontFamily: "Roboto, sans-serif",
        headings: { fontFamily: "Roboto, sans-serif" },
        primaryColor: "baseColor",
        colors: {
          baseColor: [
            "#eaecff",
            "#c6c9f0",
            "#a0a5df",
            "#7c80d0",
            "#575cc2",
            "#3d43a8",
            "#2f3484",
            "#212560",
            "#12163c",
            "#06061a",
          ],
        },
      }}
    >
      <Router>
        <App />
      </Router>
    </MantineProvider>
  </React.StrictMode>
)
