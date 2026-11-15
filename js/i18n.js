window.RA = window.RA || {};

RA.i18n = (function () {
  const S = {
    en: {
      title: 'MISSION:CRIMSON',
      subtitle: 'Survive on Mars, find the 6 pieces of your ship and fly back to Earth!',
      story: 'Your spaceship broke during landing and 6 of its pieces were scattered across Mars. The Martians have set up riddle traps. Every wrong answer brings a Martian closer…',
      chooseLevel: 'Choose a level',
      lvl_easy: 'Cadet', lvl_easy_d: 'ages 7–9',
      lvl_normal: 'Astronaut', lvl_normal_d: 'ages 10–12',
      lvl_hard: 'Mission Planner', lvl_hard_d: 'parents & classrooms',
      start: 'Start the mission 🚀',
      sources: '📚 NASA sources',
      controlsTitle: 'Controls',
      ctrl_move: 'Move',
      ctrl_run: 'Run (uses twice the oxygen)',
      ctrl_scan: 'Scanner: points to the nearest piece (−10 ⚡)',
      ctrl_action: 'Base menu / launch the ship',
      ctrl_answer: 'Yes / No to questions',
      ctrl_pause: 'Pause',
      keysAnswer: 'Y / N',
      keyYes: 'Y', keyNo: 'N',
      t_run: 'Run', t_action: 'Space',

      res_o2: 'Oxygen', res_energy: 'Energy', res_health: 'Health',
      parts: 'Pieces',
      solExplain: 'Sol = one day on Mars (24 hours and 40 minutes)',
      newSol: '🌅 Sol {n} has begun!',
      nightFalls: '🌙 Night has fallen. Solar panels can\'t charge.',

      yes: 'Yes', no: 'No',
      trapTitle: '👾 Martian trap!',
      guardTitle: '🛸 The {part} is guarded!',
      trapSub: 'Answer correctly to get through.',
      correct: 'Correct! ✅', wrong: 'Wrong! ❌',
      didYouKnow: 'Did you know…',
      disarmCost: 'You disarmed the trap: −{n} ⚡',
      partCost: 'You collected the part: −{n} ⚡',
      penalty: 'You lost: −{n} {res}',
      alienCloser: '👽 The Martian is getting closer!',
      alienBack: '👽 The Martian takes a step back!',
      continue: 'Continue',
      source: 'Source',

      missionTitle: '🧑‍🚀 Your mission',
      missionLines: [
        'Find the <b>6 pieces</b> of the ship. They are hidden in 6 regions of Mars.',
        'Outside the base your <b>oxygen</b> runs out. Go back to the base to make more.',
        '<b>Energy</b> charges at the base, only in daylight. Press <kbd>E</kbd> for the scanner.',
        'If a <b>solar storm</b> comes, hide in the base or in a cave!',
        'When you have them all, go to the ship 🚀 and press <kbd>Space</kbd>.'
      ],
      letsGo: 'Let\'s go! 🚀',

      baseTitle: 'Base',
      baseText: 'You are safe here and use no oxygen. In daylight the solar panels charge your energy.',
      baseO2: '🫁 Make oxygen',
      baseO2d: '−{e} ⚡ → +{o} 🫁 · The oxygen machine needs electricity, like MOXIE on Perseverance.',
      baseRest: '🌱 Eat & rest',
      baseRestd: '−{e} ⚡ → +{h} ❤️ · Your food grows in the base greenhouse under LED lights, and the lights need electricity (like NASA\'s Veggie garden on the space station). Time passes and night may fall.',
      baseCall: '📡 Call Earth',
      baseCalld: '−{e} ⚡ · Mission Control will mark a piece on your map. Today a message needs about {m} minutes to reach Earth and {m} more for the answer to come back, so you wait {s} seconds.',
      callSent: '📡 Message sent to Earth! The answer arrives in about {s} seconds.',
      callWaiting: '📡 Still waiting for Earth\'s answer…',
      callAnswer: '📡 Earth answered: the {part} is marked on your map!',
      baseLeave: '🚪 Go outside',
      noEnergy: 'Not enough energy!',
      o2Full: 'Oxygen is already full.',
      healthFull: 'Health is already full.',
      rested: 'You ate and rested. About {h} hours went by.',

      hintBase: 'Press Space for the base menu',
      hintCharging: '☀️ Charging energy…',
      hintNoSun: '🌙 Night: panels are not charging',
      hintShipMissing: '🚀 {n} pieces missing before launch',
      hintShipReady: '🚀 Press Space to launch!',
      hintCave: '⛰️ Cave: you are protected from radiation here',

      scanNo: 'You need {n} ⚡ for the scanner',
      scanAll: 'You found every piece! Go back to the ship 🚀',
      scanOn: '📡 Scanner: the nearest piece is {m} meters away',
      found: 'Found: {part}! ({n}/6)',
      lowO2: '⚠️ Low oxygen! Go back to the base!',
      lowHealth: '⚠️ Your health is low! Rest at the base.',

      stormWarn: '📡 Message from Earth: SOLAR STORM! Hide in the base or a cave! ({s} s)',
      stormActive: '☢️ Particle storm! Stay in shelter! ({s} s)',
      stormSafe: '🛡️ You are protected',
      stormExposed: '☢️ You are exposed! Losing health!',
      stormOverTitle: '☀️ The storm has passed',
      stormHit: 'The storm caught you outside and you lost health.',
      stormNoHit: 'You were in shelter. Well done! 🛡️',
      stormReal: 'This storm was based on a real event:',
      stormWhy: 'Particles travel slower than light, so there is a little time for a warning. But back then, a message from Earth would have needed about {m} minutes to reach Mars. That is why astronauts must be able to make decisions on their own.',
      archive: '📁 NASA ARCHIVE',
      live: '🔴 LIVE NASA DATA',

      liveLoading: '⏳ Connecting to NASA\'s DONKI space weather database…',
      liveOk: '🔴 Live from NASA DONKI: the strongest solar flare of the last {d} days was {cls} ({date}). You will meet it in the game!',
      liveNone: '🔴 Live from NASA DONKI: no flares in the last {d} days. You will play with archived events.',
      liveFail: '📁 No connection to NASA: you will play with real archived events from DONKI.',
      liveEventTitle: 'Solar flare {cls}: just days ago!',
      liveEventText: 'This flare ({cls}) really happened on the Sun on {date}. NASA recorded it in the DONKI space weather database.',

      caughtTitle: '👽 Caught!',
      caughtText: 'The Martian carried you back to the base and hid the {part} again. Go find it!',
      caughtTextNone: 'The Martian carried you back to the base.',

      pausedTitle: '⏸ Paused',
      resume: '▶ Resume',
      restart: '↺ Main menu',

      winTitle: '🚀 You made it! Heading home to Earth!',
      loseTitle: 'Mission failed… this time!',
      loseO2: 'You ran out of oxygen. A rescue ship brought you back to Earth.',
      loseHealth: 'Your health got too low. A rescue ship brought you back to Earth.',
      loseTip: 'Tip: head back to the base before your oxygen gets low, and watch out for storms!',
      statTime: 'Time', statSols: 'Sols', statCorrect: 'Correct', statWrong: 'Wrong', statParts: 'Pieces',
      badges: '🏅 Badges', noBadges: 'Play again to earn badges!',
      learned: '🧠 What you learned',
      planners: '🛰️ What real mission planners do',
      plannersLines: [
        'They budget power: every unit spent on oxygen is missing from science or communication.',
        'They watch space weather (like in DONKI) and design shelters for solar storms.',
        'They plan for communication delay: Earth answers minutes later, so crews must be able to decide on their own.'
      ],
      playAgain: '↺ Play again (new map)',
      home: 'Main menu',
      back: '← Back',

      sourcesTitle: '📚 Where the facts come from',
      sourcesIntro: 'The science in this game comes from NASA. Solar storms are real events from the DONKI space weather archive. When online, the game also fetches the latest strong solar flare live from DONKI. Archived data is always labeled "Archive".',
      eventsTitle: '☀️ Solar events in the game',
      dataTitle: '🛰️ Datasets',
      ccmcAck: 'We acknowledge the Community Coordinated Modeling Center (CCMC) at Goddard Space Flight Center for the use of DONKI, https://ccmc.gsfc.nasa.gov/DONKI/.',
      notEndorsed: 'MISSION:CRIMSON is a NASA Space Apps Challenge project. It is not made or endorsed by NASA.',

      badge_o2: '🫁 Oxygen Master', badge_o2d: 'Oxygen never dropped below 20',
      badge_storm: '🛡️ Storm Chaser', badge_stormd: 'No storm caught you outside',
      badge_brain: '🧠 Mars Brain', badge_braind: 'At least 80% correct answers',
      badge_fast: '⚡ Speedy Explorer', badge_fastd: 'Finished in under 20 minutes',
      badge_brave: '👽 Fearless', badge_braved: 'The Martian never got closer than 2 steps',

      region_jezero: 'Jezero Crater',
      region_gale: 'Gale Crater',
      region_dunes: 'Sand Dunes',
      region_valles: 'Valles Marineris',
      region_olympus: 'Olympus Mons',
      region_polar: 'Polar Ice Cap',
      part_engine: 'Engine',
      part_antenna: 'Antenna',
      part_panel: 'Solar panel',
      part_fuel: 'Fuel tank',
      part_shield: 'Heat shield',
      part_computer: 'Navigation computer',
      base: 'Base',
      ship: 'Ship',
      cave: 'Cave'
    }
  };

  const lang = 'en';

  function t(key, vars) {
    let s = S.en[key];
    if (s === undefined) return key;
    if (typeof s === 'string' && vars) {
      s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    }
    return s;
  }

  function apply(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(el => {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    (root || document).querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    document.documentElement.lang = lang;
    document.title = t('title');
  }


  return { t, apply, get lang() { return lang; } };
})();
