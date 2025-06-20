// White-label theme configuration
export const defaultTheme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
      light: '#bdc3c7'
    },
    status: {
      success: '#27ae60',
      warning: '#f39c12',
      error: '#e74c3c',
      info: '#3498db'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      success: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
      warning: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      error: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%'
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 32px rgba(31, 38, 135, 0.37)',
    xl: '0 12px 48px rgba(31, 38, 135, 0.5)'
  },
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'source-code-pro, Menlo, Monaco, Consolas, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
      xxxl: '2rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px'
  },
  zIndex: {
    dropdown: 1000,
    modal: 1050,
    tooltip: 1070,
    overlay: 1080
  }
};

// Brand customization presets
export const brandPresets = {
  magistrala: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '#667eea',
      secondary: '#764ba2'
    }
  },
  corporate: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '#2c3e50',
      secondary: '#34495e'
    }
  },
  ocean: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '#3498db',
      secondary: '#2980b9'
    }
  },
  forest: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '#27ae60',
      secondary: '#2ecc71'
    }
  },
  sunset: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '#e74c3c',
      secondary: '#f39c12'
    }
  },
  purple: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '#9b59b6',
      secondary: '#8e44ad'
    }
  },
  choovio: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '#2C5282',
      secondary: '#ED8936',
      accent: '#805AD5',
      background: '#F7FAFC',
      surface: '#FFFFFF',
      text: {
        primary: '#2D3748',
        secondary: '#718096'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #2C5282 0%, #3182CE 100%)',
        secondary: 'linear-gradient(135deg, #ED8936 0%, #F6AD55 100%)',
        accent: 'linear-gradient(135deg, #805AD5 0%, #9F7AEA 100%)'
      }
    }
  }
};

// Theme utility functions
export const createCustomTheme = (customizations) => {
  return {
    ...defaultTheme,
    ...customizations,
    colors: {
      ...defaultTheme.colors,
      ...customizations.colors
    }
  };
};

export const getThemeValue = (theme, path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme);
};

export default defaultTheme;