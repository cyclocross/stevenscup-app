# Initial plan

Date: 25.07.2025 10:00

## Initial product and architecture request

Show me a way how to build a web application for cyclocross competition series rankings.

### Data model overview

Series
  - id, name, begin, end, description
  - events[] (one-to-many)
  - contests[] (one-to-many)

Event
  - id, series_id, date, location, club
  - races[] (one-to-many)

Contest
  - id, series_id, name, age_group, gender
  - point_system (participation_points, placement_points[])
  - cyclist_contests[] (one-to-many)

Race
  - id, event_id, contest_id, start_time, duration
  - participations[] (one-to-many)

Cyclist
  - id, name, club, license_number
  - cyclist_participations[] (one-to-many)

CyclistContest
  - id, cyclist_id, contest_id, bib_number, status
  - participations[] (one-to-many)

Participation
  - id, cyclist_contest_id, race_id
  - registered, participated, position
  - is_provisional, created_at, updated_at


### First features

  - Cyclist participates in one contest. Each contest is assigned to a race (20-60 minutes). One race can host multiple contests. Within one race cyclist bib numbers are all unique. Bib number is not unique in distinct races.
  - Cyclist can sign-in for a race, participate in a race, finish with placement or not finish the race
  - Cyclist gets points when he starts in the race. Upon finish there is a fixed point amount for every position. 
  - Race staff wants to quickly upload provisional ranking to see which cyclist is the new leader and who belongs to top ten
  - Provisional rankings are published publicly, cyclists can see if they on the podium or will get prizes.
  - Race staff has an admin interface to change the data
  - Race staff can create/update series, contests, events, races
  - Race staff can duplicate events with attached races or copy races configuration from another event
  - Cyclists register for a race on a external page (this cannot be changed), race staff can import a snapshot of registrations (PDF, Excel, CSV) in a simple way (AI based?)
 
### Additional notes

  - App will be used mostly from mobile devices, often with connection problems
  - I'd prefer to use LLM calls to parse imports, it should improve the UX and keep support costs low
  - Once official ranking are created on the external page should be uploaded or fetched from the link. Maybe 
    a regular cron job could scrap the the external page with final results and keep the app data up to date.App should be hosted with low or no cost, it's voluntary project.I'd like to use my experience as developer in: typescript, vercel @ai-sdk, vercel hosting, drizzle, next.js.Don't generate any code, just make a plan how to approach this project.


