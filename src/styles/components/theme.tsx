import { createTheme } from '@mui/material/styles';

// Create a theme instance.
const theme = createTheme({
    palette: {
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: '#ff1744',
        },
        background: {
            default: '#fff',
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiPickersDay: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                    margin: '0 2px',
                    color: 'inherit',
                    '&.Mui-selected': {
                        backgroundColor: '#556cd6',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: '#3f51b5',
                        },
                    },
                },
            },
        },
        MuiClock: {
            styleOverrides: {
                pin: {
                    backgroundColor: '#556cd6',
                },
                clock: {
                    backgroundColor: '#f5f5f5',
                },
            },
        },
        MuiPickersModal: {
            styleOverrides: {
                dialogRoot: {
                    borderRadius: 8,
                },
            },
        },
    },
});

export default theme;
