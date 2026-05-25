// ./assets/images/Artifacts.js

/**
 * ARCHITECTURAL NOTE:
 * The static imports requested below are commented out because Vite requires all strictly-imported 
 * files to exist on the filesystem at compilation/build time. Since files like 'bar1.png' are missing, 
 * using static imports would cause the app to crash with a "Failed to resolve import" compilation error.
 * 
 * To handle this gracefully and respect "please ignore if image is not available inside images folder",
 * we use Vite's `import.meta.glob` to dynamically discover existing files, paired with a safe 
 * ES6 Proxy fallback that returns a 1x1 transparent image for any requested image that does not exist.
 * 
 * Here is your requested code structure as a reference (commented out to keep the build working):
 * 
 * import pirateImg from './pirate_island_quest_map_1779210700182.png';
 * import Ball from './b1all.png';
 * import Balloons from './balloons1.png';
 * import bar from './bar1.png';
 * import chill from './chilling1.png';  
 * import bear from './Circus bear1.png';
 * ...
 */

const modules = import.meta.glob('./*', { eager: true });

const imageMap = {};
const transparentPlaceholder = 'data:image/png;base64,iVBORg0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Extract URLs from dynamically resolved modules
for (const path in modules) {
  const filename = path.replace(/^\.\//, '');
  if (filename === 'Artifacts.js') continue;

  const module = modules[path];
  const url = module.default || module;
  if (url) {
    imageMap[filename] = url;
    imageMap[filename.toLowerCase()] = url;
  }
}

// Exact mappings requested by the user
const requestedMappings = {
  'pirate.png': 'pirate_island_quest_map_1779210700182.png',
  'b1all.png': 'b1all.png',
  'balloons1.png': 'balloons1.png',
  'bar1.png': 'bar1.png',
  'chilling1.png': 'chilling1.png',
  'bear1.png': 'Circus bear1.png',
  'beach-volleyball.png': 'beach-volleyball.png',
  'Circus elephant.png': 'Circus elephant.png',
  'big-house1.png': 'big-house1.png',
  'Carnival elephant.png': 'Carnival elephant.png',
  'Carnival Elephant2.png': 'Carnival Elephant2.png',
  'circus-tent.png': 'circus-tent.png',
  'coconut-drink.png': 'coconut-drink.png',
  'coconuts.png': 'coconuts.png',
  'coin.png': 'coin.png',
  'Commando.png': 'Commando.png',
  'Cop.png': 'Cop.png',
  'country-house.png': 'country-house.png',
  'deck-chair.png': 'deck-chair.png',
  'doctor.png': 'doctor.png',
  'BeachParty.png': 'BeachParty.png',
  'eagle.png': 'eagle.png',
  'elementary.png': 'elementary.png',
  'family.png': 'family.png',
  'flamingo-float.png': 'flamingo-float.png',
  'Gorilla.png': 'Gorilla.png',
  'Guard.png': 'Guard.png',
  'gun.png': 'gun.png',
  'gymnast.png': 'gymnast.png',
  'hot-air-balloon.png': 'hot-air-balloon.png',
  'howler-monkey.png': 'howler-monkey.png',
  'human-cannonball.png': 'human-cannonball.png',
  'juggler.png': 'juggler.png',
  'kayaking.png': 'kayaking.png',
  'kids.png': 'kids.png',
  'king.png': 'king.png',
  'lighthouse.png': 'lighthouse.png',
  'map.png': 'map.png',
  'nurse.png': 'nurse.png',
  'nursing.png': 'nursing.png',
  'palm-tree.png': 'palm-tree.png',
  'parrot.png': 'parrot.png',
  'pirate-ship.png': 'pirate-ship.png',
  'play.png': 'play.png',
  'queen.png': 'queen.png',
  'rat.png': 'rat.png',
  'red-panda.png': 'red-panda.png',
  'road-sign.png': 'road-sign.png',
  'sand-bucket.png': 'sand-bucket.png',
  'sand-castle.png': 'sand-castle.png',
  'sea.png': 'sea.png',
  'seal.png': 'seal.png',
  'Sherif.png': 'Sherif.png',
  'skull.png': 'skull.png',
  'skyscraper.png': 'skyscraper.png',
  'Soldier.png': 'Soldier.png',
  'students.png': 'students.png',
  'summer.png': 'summer.png',
  'surfist.png': 'surfist.png',
  'taj-mahal.png': 'taj-mahal.png',
  'Traffic Police.png': 'Traffic Police.png',
  'Trafic Policman.png': 'Trafic Policman.png',
  'unicycle.png': 'unicycle.png',
  'university.png': 'university.png',
  'villa.png': 'villa.png',
  'volleyball-player.png': 'volleyball-player.png',
  'water-rafting.png': 'water-rafting.png',
  'writting.png': 'writting.png',
  'zoo.png': 'zoo.png',
  'WildlifePark.png': 'WildlifePark.png',
};

export const images = new Proxy(imageMap, {
  get(target, prop) {
    if (typeof prop !== 'string') return undefined;

    // 1. Direct checks on raw imageMap
    if (target[prop]) return target[prop];

    const lowerProp = prop.toLowerCase();
    if (target[lowerProp]) return target[lowerProp];

    // 2. Map logical alias to file name
    const destFile = requestedMappings[prop] || requestedMappings[lowerProp];
    if (destFile) {
      if (target[destFile]) return target[destFile];
      if (target[destFile.toLowerCase()]) return target[destFile.toLowerCase()];
    }

    // 3. Fallback: fuzzy/partial match
    const sanitizedProp = lowerProp.replace(/[^a-z0-9]/g, '');
    for (const key in target) {
      const sanitizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sanitizedKey === sanitizedProp || sanitizedKey.includes(sanitizedProp) || sanitizedProp.includes(sanitizedKey)) {
        return target[key];
      }
    }

    // 4. Clean transparent placeholder fallback for missing files
    return transparentPlaceholder;
  }
});
