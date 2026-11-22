# DNSC Class Scheduling System (Stages 1-5, frontend)
Vue 3 + Vite + Tailwind v4 + Pinia + vue-router. All data is mock and shared through one store.

    npm install
    npm run dev      # start the app
    npm test         # workflow + UI smoke tests (jsdom)
    npm run build

Demo logins (password: password123)
- chair@dnsc.edu.ph       Program Chairperson (BSIT)
- dean@dnsc.edu.ph        Dean (Institute of Computing)
- instructor@dnsc.edu.ph  Instructor (starts with no saved courses on purpose)
Register Jose Lim (jose.lim@dnsc.edu.ph), Carla Mendoza (carla.m@dnsc.edu.ph), Mark Villanueva (mark.v@dnsc.edu.ph)
or Liza Ramos (liza.r@dnsc.edu.ph) on the sign-up page.

Data lives in src/data/mockData.js and src/stores/schedule.js (persisted in localStorage key css_schedule_v2).
To reset the demo data, clear that key in the browser's Application tab.
Backend hooks: src/services/mailer.js (approval email) and the store actions. Auth is a frontend mock only.
