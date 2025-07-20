import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { observer } from "mobx-react-lite";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import FeatureRequestDetail from "./modules/FeatureRequestDetail";
import FeatureRequestDashboard from "./modules/FeatureRequestDashboard";
import GlobalStyles from "./GlobalStyles";

// Создаем кастомную тему MUI
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});

// Главный компонент с роутингом
const App: React.FC = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <FeatureRequestDashboard />,
    },
    {
      path: "/feature-request/:id",
      element: <FeatureRequestDetail />,
    },
  ]);

  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
      <CssBaseline />
      <GlobalStyles />
    </ThemeProvider>
  );
};

export default observer(App);
