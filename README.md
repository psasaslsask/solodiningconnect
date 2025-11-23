# SoloDiningConnect

SoloDiningConnect is a React web app that helps solo diners discover welcoming restaurants, connect with other diners, and manage reservations. The project uses Firebase for authentication and Firestore-backed booking management.

## Quick start

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the dev server**
   ```bash
   npm start
   ```
   The app is served at [http://localhost:3000](http://localhost:3000).

> The included Firebase configuration (`src/firebase.js`) is ready for local exploration. If you have your own Firebase project, update that file with your credentials before starting the app.

## What you can do

- Create an account and sign in with Firebase Auth.
- Browse solo-friendly restaurants, sort them by key criteria, and add new entries.
- Book a restaurant and manage bookings stored in Firestore (view, edit, cancel).
- Explore other solo diners and review or edit your profile details.

## Design language

The UI uses a neutral, content-forward palette (slate and neutral shades) with restrained shadows and simple typography to mirror production booking sites. When adding new screens, follow the same approach: white card backgrounds, slate text, subtle borders, and hover states that nudge rather than distract.

## Guided walkthrough (try the components step by step)

Use this checklist to click through the main flows:

1. **Land on the Welcome page**
   - Read the brief description and choose either **“I’m a restaurant owner”** or **“I’m a solo diner”** to jump to sign-up.
2. **Create an account**
   - On **/signup**, enter an email and password. Submission automatically signs you in and redirects to **/home**.
3. **Review the Home hub**
   - From **/home**, choose a card to explore: **Explore Restaurants**, **Explore Diners**, or **My Bookings**.
4. **Explore restaurants and book one**
   - On **/restaurants**, try the sort buttons (Ambiance, Service, Menu, Overall Score).
   - Add a restaurant using the **“Add a New Restaurant”** form (scores are averaged into the Solo Score).
   - Click any restaurant card to open the booking modal, pick a date/time/guest count, and confirm to save it to Firestore.
5. **Check and modify your bookings**
   - Open **/bookings** from the home cards or navbar.
   - Each booking card lets you **Cancel** or **Modify**. Use **Modify** to adjust date/time/guests and **Save Changes** to write updates back to Firestore.
6. **Browse other diners**
   - Visit **/diners** to see sample solo diner profiles.
7. **Update your profile**
   - Go to **/profile** to view or edit your saved details.
8. **Log out**
   - Use the navbar **Logout** action (available on authenticated routes) to end your session.

Feel free to repeat steps 4–5 with different restaurants to see Firestore updates reflected live on the **My Bookings** page.

## Available scripts

- `npm start` — Start the development server.
- `npm test` — Run tests in watch mode.
- `npm run build` — Create a production build in `build/`.

## Project structure highlights

- `src/App.js` — Route configuration with protected routes for signed-in users.
- `src/pages/` — Page-level components such as **HomePage**, **RestaurantList**, **DinersPage**, **MyBookings**, **ProfilePage**, **LoginPage**, **SignupPage**, and **WelcomePage**.
- `src/components/` — Shared UI (e.g., navbar, protected route wrapper).
- `src/context/AuthContext.js` — Auth provider for Firebase sign-in/sign-up state.
- `src/data/restaurants.json` — Seed data for the restaurant list.
- `src/firebase.js` — Firebase app, Auth, and Firestore initialization.

## Notes for contributors

- The app uses React Router for navigation and Tailwind CSS utility classes for styling.
- Booking creation, edits, and cancellations are persisted under the authenticated user’s Firestore subcollection (`bookings/{userId}/items`).
- Avoid wrapping imports in try/catch; let bundler errors surface during development.
