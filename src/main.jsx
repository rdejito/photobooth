import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import LivePhotobooth from './LivePhotobooth.jsx';
import muiTheme from './photobooth/muiTheme.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <LivePhotobooth />
    </ThemeProvider>
  </React.StrictMode>,
);
