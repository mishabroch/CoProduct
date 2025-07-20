import { GlobalStyles as MuiGlobalStyles } from "@mui/material";

const GlobalStyles = () => {
  return (
    <MuiGlobalStyles
      styles={{
        body: {
          margin: 0,
          overflow: "hidden",
          font: '20px "DMMono", sans-serif',
        },

        "#root": {
          width: "100vw",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          overflowY: "auto",
          /* background: theme.palette.background1,
          color: theme.palette.text1Inverted,
          backgroundImage: `url('/images/pattern/pattern-${theme.palette.customMode}.png')`, */
          backgroundSize: "100% 100%",
          backgroundRepeat: "repeat",
        },

        /* width */
        "::-webkit-scrollbar": {
          width: "10px",
          height: "10px",
        },

        /* Track */
        "::-webkit-scrollbar-track": {
          background: "transparent",
        },

        /* Handle */
        "::-webkit-scrollbar-thumb": {
          background: "rgba(13, 73, 122, 0.1),",
        },

        /* Handle on hover */
        "::-webkit-scrollbar-thumb:hover": {
          background: "rgba(255, 255, 255, 0.2)",
        },
      }}
    />
  );
};

export default GlobalStyles;
