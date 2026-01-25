# Organica

![React](https://img.shields.io/badge/react-v18.2.0-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6-yellow.svg)

## Overview

A refined version of the original Keeper-App, built after months of real-world use and valuable insights. This iteration brings enhanced features, improved usability, and a cleaner design, all inspired by practical experience. Organica aims to provide a smoother, more efficient note-taking and task management experience while incorporating new tools like TipTap for flexible and dynamic content editing. A fresh start for an even better Keeper experience!

## Features

- **Create Notes**: Add new notes with a title and content.
- **Delete Notes**: Remove notes when they are no longer needed.
- **Responsive Design**: Adapts to various screen sizes for mobile and desktop use.
- **Dynamic Rendering**: Utilizes React's state and props for dynamic UI updates.

## Technologies Used

- **React**: Frontend library for building user interfaces.
- **JavaScript (ES6)**: Scripting language for dynamic content.
- **CSS**: Styling the application.
- **HTML**: Structuring the web pages.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alancleetus/Organica.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd Organica
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Usage

- Open your browser and go to `http://localhost:5173` to see the application in action.
- Add, delete, and manage your notes effortlessly.

## Project Structure

- **public/**: Contains the HTML template and static assets.
- **src/**: Contains the React components and main application logic.
  - **components/**: Reusable UI components.
  - **App.js**: Main application component.
  - **index.js**: Entry point of the application.

## Automated Testing

This project includes a production-style end-to-end (E2E) test suite built with Playwright to validate critical user flows against a real application backed by Firebase.

### Testing Approach
- **Framework:** Playwright
- **Test Type:** End-to-end (UI-driven)
- **Auth Provider:** Firebase Authentication (test-only user)
- **Data Store:** Firestore (tests create and clean up their own data)
- **Accessibility:** automated WCAG checks using axe-core + Playwright (login and main flows)

### Coverage
**Authentication & Routing**
- Successful login redirects authenticated users to `/main`
- Invalid login attempts surface error feedback
- Route guards enforce access rules:
  - Unauthenticated users are redirected from protected routes
  - Authenticated users are redirected away from public-only routes

**Core Application Flows**
- Create, edit, and delete notes
- Verify persisted data is rehydrated after page refresh
- Validate UI behavior across authenticated sessions

### Test Design Considerations
- Stable selectors are implemented using `data-testid` on interactive elements
- Material UI inputs expose test hooks via underlying input props for reliability
- Test data uses unique prefixes to avoid collisions and ensure isolation
- Cleanup is performed within tests to keep the Firestore database clean

### Running Tests Locally
```bash
npx playwright install
npx playwright test
npx playwright show-report
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgements

- Inspired by the Google Keep application.
- Original Keeper-App code developed as part of a React course.

## Contact

For any inquiries or feedback, please reach out to [alancleetus](https://github.com/alancleetus).

---

Happy coding!
