# Sprint N Closeout — Team Just Wireframes / BC Maps

**Sprint dates:** <Tue Nov 10> – <Tue Nov 17>
**Closeout commit:** (https://github.com/ChristianVelezW/dev272-Bellevue-College-Maps/pull/38)
**Board:** https://github.com/users/ChristianVelezW/projects/1/views/1
**Attendees at closeout:** Salem, Christian, Eyob, Andrew

## 1. Sprint goal and outcome

**Goal (from planning):** Create core screens and basic navigation throughout the app. Setup skeleton.

**Outcome:** <Met> — Successfully created our 3 main screens along with stacked screens. Added basic data and styling that is consistent across all screens, and matches our wireframes. 

## 2. Completed

| Issue | Title                                   | Owner     | PR  | Reviewer       |
| ----- | --------------------------------------- | --------- | --- | -------------- |
| #14   | Setup App Navigation Structure          | Andrew    | #27 | Christian      |
| #15   | Create Building Detail Screen           | Eyob      | #28 | Salem          |
| #17   | Create Campus Search and Location Entry | Eyob      | #32 | Christian      |
| #18   | Create Profile Screen                   | Andrew    | #29 | Salem          |
| #25   | Reusable UI Components                  | Salem     |
| #19   | Test Initial App Structure              | Christian | 

## 3. Unfinished or carried over

| Issue | Title                        | Owner | Status      | Why, and what happens next                                     |
| ----- | ---------------------------- | ----- | ----------- | -------------------------------------------------------------- |
| #16   | Create Map Display Screen UI | Eyob  | In progress | Agreed it would be better to implement later due to large scope|
| #24   | Create Active Navigation     | Andrew| In progress | Already have basic navigation, this is just to build upon this |

## 4. Bugs and blockers

| Issue | Title                                                | Impact (blocking / moderate / minor) | Owner | Status       |
| ----- | ---------------------------------------------------- | ------------------------------------ | ----- | ------------ |
| #25   | Title being hidden behind Android and IOS notch.     | moderate                             | Salem | Fixed in #31 |
| #25   | Accessibility roles missing, ScrollView sizing       | moderate                             | Salem | Fixed in #31 |

## 5. Retrospective

**What worked well**

- Check-in meetings are efficient and members are working well together
- No major problems in skeleton creation

**What did not work well**

- Merge conflict resolution should be handled differently to prevent similar errors and blockers. 

**Kudos**

- Eyob - is very busy but still does great work and has worked ahead already for this coming week. 
- Andrew - For going with the flow and working wherever he is needed, responds to messages very quickly
- Salem - For keeping the team organized
- Christian - Handling merge conflict

**Action items for next sprint**
| Action           | Owner     | Done by            |
| ---------------- | --------- | ------------------ |
| Create Database  | Christian | Friday, Nov 20th   |
| Merge Map PR     | Everyone  | Thursday, Nov 19th |

## 6. Next sprint priorities

1. Create Supabase with data
2. Replace mock functions with api layer
3. useQuery and loading states
4. useMutation for validation
5. Map Screen

## 7. Hours (team total, approximate)

| Member.  | Hours | Focus                          |
| -------- | ----- | ------------------------------ |
| Salem    | 6     | UI Components, error fixing    |
| Christian| 6     | Testing, Conflict management   |
| Andrew   | 6     | Navigation, Profile            |
| Eyob     | 6     | Buidling Details, Campus Search|