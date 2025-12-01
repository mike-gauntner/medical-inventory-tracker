// Theme Toggle Functionality
class ThemeToggle {
  constructor() {
    this.themeToggle = document.createElement('button');
    this.themeToggle.className = 'theme-toggle';
    this.themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    this.themeToggle.setAttribute('title', 'Toggle dark mode');
    
    // Add SVG icons for light and dark mode
    this.themeToggle.innerHTML = `
      <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
      <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
    
    // Add event listener
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Initialize theme
    this.initTheme();
  }
  
  // Initialize theme from localStorage or system preference
  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.setAttribute('data-theme-preference', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme-preference');
    }
    
    // Add the toggle button to the page
    document.body.appendChild(this.themeToggle);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.documentElement.setAttribute('data-theme-preference', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme-preference');
        }
      }
    });
  }
  
  // Toggle between light and dark theme
  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme-preference') === 'dark';
    
    if (isDark) {
      document.documentElement.removeAttribute('data-theme-preference');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme-preference', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  }
}

// Initialize the theme toggle when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeToggle();
});
