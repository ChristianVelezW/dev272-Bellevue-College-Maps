# App Wireframes & User Flow

## Tooling

Tooling: Figma

Figma link: [BC Maps Wireframes](https://www.figma.com/design/uKpzNeRSvQClWd1oo06RCQ)

## User Flow Diagram

user-flow.png: shows the tabs, pushed screens, modals, and dynamic routes.

<img src="user-flow.png" width="800">

## MVP Screen Wireframes

| Preview | Screen image | Route (file in the code) | Type |
|---|---|---|---|
| <img src="map.png" width="150"> | map.png | src/app/(tabs)/index.tsx | Tab |
| <img src="search.png" width="150"> | search.png | src/app/(tabs)/search.tsx | Tab |
| <img src="profile.png" width="150"> | profile.png | src/app/(tabs)/profile.tsx | Tab |
| <img src="building-detail.png" width="150"> | building-detail.png | src/app/building/[id].tsx | Pushed screen (dynamic route) |
| <img src="navigate.png" width="150"> | navigate.png | src/app/navigate/[roomId].tsx | Pushed screen (dynamic route) |
| <img src="save-place.png" width="150"> | save-place.png | src/app/place/new.tsx | Modal (form 1) |
| <img src="report-issue.png" width="150"> | report-issue.png | src/app/report.tsx | Modal (form 2) |