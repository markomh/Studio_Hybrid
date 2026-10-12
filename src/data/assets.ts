import { AssetCategory } from '../types';

export const ASSET_CATEGORIES: AssetCategory[] = [
  {
    id: 'mascots',
    name: 'Mascots & Characters',
    icon: '👾',
    items: [
      { id: 'm1', title: 'Rocket Ship', category: 'mascots', tags: ['space', 'start'], emoji: '🚀' },
      { id: 'm2', title: 'Mars Planet', category: 'mascots', tags: ['space', 'finish'], emoji: '🪐' },
      { id: 'm3', title: 'Astronaut Cat', category: 'mascots', tags: ['animal', 'space'], emoji: '🐱' },
      { id: 'm4', title: 'Little Alien', category: 'mascots', tags: ['space', 'cute'], emoji: '👽' },
      { id: 'm5', title: 'Race Car', category: 'mascots', tags: ['vehicle', 'speed'], emoji: '🏎️' },
      { id: 'm6', title: 'Checkered Flag', category: 'mascots', tags: ['racing', 'finish'], emoji: '🏁' },
      { id: 'm7', title: 'T-Rex Dinosaur', category: 'mascots', tags: ['dino', 'jurassic'], emoji: '🦖' },
      { id: 'm8', title: 'Volcano Island', category: 'mascots', tags: ['island', 'finish'], emoji: '🌋' },
      { id: 'm9', title: 'Treasure Chest', category: 'mascots', tags: ['pirate', 'goal'], emoji: '🪙' },
      { id: 'm10', title: 'Crown Champion', category: 'mascots', tags: ['trophy', 'win'], emoji: '🏆' },
    ],
  },
  {
    id: 'icons',
    name: 'Start & Goal Icons',
    icon: '🎯',
    items: [
      { id: 'ic1', title: 'Green Flag', category: 'icons', tags: ['start'], emoji: '🚩' },
      { id: 'ic2', title: 'Target Bullseye', category: 'icons', tags: ['finish'], emoji: '🎯' },
      { id: 'ic3', title: 'Sparkling Star', category: 'icons', tags: ['reward'], emoji: '⭐' },
      { id: 'ic4', title: 'Glowing Gem', category: 'icons', tags: ['crystal'], emoji: '💎' },
      { id: 'ic5', title: 'Key to Castle', category: 'icons', tags: ['quest'], emoji: '🔑' },
      { id: 'ic6', title: 'Compass Guide', category: 'icons', tags: ['adventure'], emoji: '🧭' },
    ],
  },
  {
    id: 'stickers',
    name: 'Reward Badges & Stickers',
    icon: '✨',
    items: [
      { id: 'st1', title: 'Maze Master', category: 'stickers', tags: ['achievement'], emoji: '🥇' },
      { id: 'st2', title: 'Super Brain', category: 'stickers', tags: ['smart'], emoji: '🧠' },
      { id: 'st3', title: '100% Solved', category: 'stickers', tags: ['complete'], emoji: '💯' },
      { id: 'st4', title: 'Party Popper', category: 'stickers', tags: ['celebrate'], emoji: '🎉' },
    ],
  },
  {
    id: 'borders',
    name: 'Decorative Borders & Frames',
    icon: '🖼️',
    items: [
      { id: 'bd1', title: 'Minimalist Clean', category: 'borders', tags: ['border', 'clean'], emoji: '◽' },
      { id: 'bd2', title: 'Double Line Classic', category: 'borders', tags: ['border', 'double'], emoji: '⏸️' },
      { id: 'bd3', title: 'Dotted Border', category: 'borders', tags: ['border', 'dots'], emoji: '🔲' },
      { id: 'bd4', title: 'Cosmic Starfield Frame', category: 'borders', tags: ['border', 'space'], emoji: '✨' },
    ],
  },
];
