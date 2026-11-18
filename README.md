## Our Team Project – BC Maps

### About the App

Our app is made to help students, faculty and visitors find places on the Bellevue College campus. Finding a classroom, office or building can be confusing especially, for new students or first time visitors. The goal of our app is to make campus travel easier by letting users search for a location and see exactly where it is. We want to create a simple easy to use experience that helps people spend time looking for rooms and more time going to the places they need to go.

## Team Members and Roles


| GitHub Username | Primary Role | Secondary Role |
| --- | --- | --- |
| TheAndyAndroid (Andrew) | UI/UX Designer | Frontend Developer |
| sa-lem666 (Salem) | Project Manager | UI/UX Designer |
| Z-eyob-Job (Eyob) | Backend Developer | Frontend Developer |
| ChristianVelezW (Christian) | QA Engineer | Backend / Frontend Developer |
| Everyone (if needed) | DevOps | |

## Screens

### Main Screens

| Screen | Route | Purpose |
| --- | --- | --- |
| Map | /(tabs)/index | Main screen for campus navigation |
| Search | /(tabs)/search | Search campus buildings and rooms, apply filters, and open building details |
| Profile | /(tabs)/profile | View saved places, manage navigation preferences, and access issue reporting |

### Additional Screens

| Screen | Route | Purpose |
| --- | --- | --- |
| Building Detail | /building/[id] | Main screen for campus navigation |
| Navigation | /navigate/[roomId] | Search campus buildings and rooms, apply filters, and open building details |
| Save Place | /place/new | View saved places, manage navigation preferences, and access issue reporting |
| Report an Issue | /report | Screen for reporting incorrect map information and other issues |

## Sprint 1 Goal

### Sprint 1 Functionality
The following functionality has been established during Sprint 1:

- Expo Router navigation with tab and stack layouts
- Search for campus buildings and rooms
- Filter search results by buildings, rooms, and accessibility
- View individual building details using dynamic routes
- Switch between available building floors
- View rooms listed on each building floor
- Navigate from a selected room to its directions screen.
- View sample saved locations on the Profile screen
- Change accessibility and stair avoidance preferences
- Access the Save a Place and Report an Issue screens
- Reusable UI components that can filter locations
- Typed campus building and room data with sample entries
  
*Note: Some screens currently contain placeholder content and dummy data. That is subject to change for sprint 2.

## Features that are planned and to be implemented during sprint 2

- Interactive campus maps
- Saving custom locations with validation
- Submitting issue reports with validation
- Remote data using Supabase

## Getting Started

To get the project running on your computer, make sure you have Node.js, pnpm, and Git installed first.


### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Create a .env file in the root directory of the project. Add the environment variables required by the application.

For our BC Maps app, the variables are reserved for backend and database configuration:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

*Note: We are going to be implementing the remote data using Supabase into Sprint 2

The actual values should be provided through the Supabase project settings. Do not commit private keys, passwords, or other secrets to GitHub.

### 3. Start the application

```bash
pnpm start
```

## Branch and Pull Request Rules

To keep our work organized and avoid accidentally overwriting someone else's changes, use the following Git workflow:

main is reserved for stable versions of the project.\
develop is our main integration branch. Completed features are merged here after review.\
Each team member should create a separate feature branch when working on something new.\
Branch names should describe the work being done.\
For example:
feature/home-screen

## Pull Request Guidelines:

Create a feature branch from the latest develop branch.\
Make your changes and commit your work.\
Push your branch to GitHub.\
Open a pull request targeting develop.\
Have at least one other team member review your pull request.\
Address any requested changes before merging.\
Once approved, merge the pull request into develop.\

*Please avoid pushing unfinished features directly to develop or main. Reviewing each other's work helps us catch mistakes early and keeps the project consistent.

## Commit Message Style

### General format

Try to use short, descriptive commit messages so everyone can understand what changed without having to inspect every file.

Commit types:

| Type | Purpose |
| --- | --- |
| feat | Adding a new feature |
| fix | Fixing a bug |
| style | UI or formatting changes |
| docs | Documentation updates |
| test | Adding or updating tests |


Examples:

```bash
git commit -m "feat: add search screen"
git commit -m "style: improve home screen layout"
```


## Our Development Goal

Our main goal is to build something that is useful to Bellevue College students and visitors. We will focus on making location searches straightforward, keeping the interface easy to understand, and testing the app to make sure it works as expected. As development progresses, we plan to improve the app based on feedback and the issues we discover along the way.
