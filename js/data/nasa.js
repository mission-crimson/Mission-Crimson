window.RA = window.RA || {};

RA.NASA = {
  DONKI_URL: 'https://ccmc.gsfc.nasa.gov/DONKI/',

  events: [
    {
      id: 'sep-2024-05-20', date: '2024-05-20', cls: '≈X12',
      url: 'https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm',
      en: { title: 'The great storm of May 2024',
            text: 'On May 20, 2024 a huge solar flare (about X12) sent particles to Mars. Curiosity\'s RAD detector measured 8,100 micrograys, about the same as 30 chest X-rays! A normal day there is about 210. It was the biggest radiation surge Curiosity has ever measured.' }
    },
    {
      id: 'flr-2024-05-14', date: '2024-05-14', cls: 'X8.7',
      url: 'https://ccmc.gsfc.nasa.gov/DONKI/',
      en: { title: 'X8.7 flare',
            text: 'On May 14, 2024 the Sun released an X8.7 flare from the same sunspot group that caused auroras on Earth a few days earlier. That same region of the Sun later turned towards Mars.' }
    },
    {
      id: 'flr-2024-10-03', date: '2024-10-03', cls: 'X9.0',
      url: 'https://ccmc.gsfc.nasa.gov/DONKI/',
      en: { title: 'X9.0 flare',
            text: 'On October 3, 2024 an X9.0 flare was recorded, one of the strongest of the current solar cycle. X-class flares are the most powerful kind.' }
    },
    {
      id: 'sep-2017-09-10', date: '2017-09-10', cls: 'X8.2',
      url: 'https://ccmc.gsfc.nasa.gov/DONKI/',
      en: { title: 'Auroras all over Mars',
            text: 'On September 10, 2017 an X8.2 flare sent particles to Mars. The particles arrived on September 11, and the radiation Curiosity measured on the ground was more than double any it had measured before. Also, the MAVEN spacecraft saw auroras across the whole planet.' }
    },
    {
      id: 'flr-2017-09-06', date: '2017-09-06', cls: 'X9.3',
      url: 'https://ccmc.gsfc.nasa.gov/DONKI/',
      en: { title: 'X9.3 flare',
            text: 'On September 6, 2017 the Sun released an X9.3 flare, the strongest of the solar cycle that began in December 2008.' }
    },
    {
      id: 'cme-2012-07-23', date: '2012-07-23', cls: 'CME',
      url: 'https://ccmc.gsfc.nasa.gov/DONKI/',
      en: { title: 'The storm that missed us',
            text: 'On July 23, 2012 a giant eruption from the Sun (a coronal mass ejection, CME) tore through Earth\'s orbit, but Earth was not there. It hit NASA\'s STEREO-A spacecraft instead.' }
    }
  ],

  sources: [
    { name: 'NASA DONKI: Space Weather Database', url: 'https://ccmc.gsfc.nasa.gov/DONKI/',
      en: 'Solar flares, coronal mass ejections (CMEs) and particle storms. The game\'s solar storms come from here.' },
    { name: 'NASA CCMC: DONKI API (FLR)', url: 'https://ccmc.gsfc.nasa.gov/news/major-updates/',
      en: 'The live connection: the game requests the flares of the last 30 days.' },
    { name: 'Curiosity RAD: May 2024 solar storm', url: 'https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm',
      en: 'Radiation measurements on the surface of Mars (8,100 micrograys on May 20, 2024).' },
    { name: 'NASA Mars Exploration', url: 'https://science.nasa.gov/mars/',
      en: 'Gravity, sol length, temperature, atmosphere, water and ice, moons, Olympus Mons, Valles Marineris.' },
    { name: 'Perseverance: MOXIE', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
      en: 'Making oxygen from Martian carbon dioxide. That is why oxygen costs energy in the game.' },
    { name: 'Opportunity & InSight', url: 'https://science.nasa.gov/mission/mer-opportunity/',
      en: 'The 2018 dust storm and dust on solar panels: why energy on Mars is never guaranteed.' },
    { name: 'NASA Veggie: growing food in space', url: 'https://www.nasa.gov/missions/station/veggie-will-expand-fresh-food-production-on-space-station/',
      en: 'Plants grow under red, blue and green LED lights. That is why food costs energy in the game.' },
    { name: 'NASA: communication delay beyond Earth orbit', url: 'https://ntrs.nasa.gov/citations/20250000703',
      en: 'A message between Mars and Earth can take up to 44 minutes there and back. That is why calling Earth makes you wait.' },
    { name: 'NASA OSDR: Open Science Data Repository', url: 'https://osdr.nasa.gov/',
      en: 'Research on astronaut health (bone, muscle) and on plants in space.' }
  ],

  liveEvent: null
};
