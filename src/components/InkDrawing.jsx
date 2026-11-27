import journalStillLife from '../assets/journal-still-life.png';
import camera from '../assets/ink-camera.png';
import microphone from '../assets/ink-microphone.png';
import diary from '../assets/ink-diary.png';
import vase from '../assets/ink-vase.png';
import candle from '../assets/ink-candle.png';
import cup from '../assets/ink-cup.png';
import letter from '../assets/ink-letter.png';
import clover from '../assets/ink-clover.png';

import clockInk from '../assets/ink-clock.png';
import keyInk from '../assets/ink-key.png';
import glassesInk from '../assets/ink-glasses.png';
import pearInk from '../assets/ink-pear.png';
import teapotInk from '../assets/ink-teapot.png';

export const drawings = {
  clock: { src: clockInk, width: 148, height: 176, label: 'Clock' },
  key: { src: keyInk, width: 74, height: 176, label: 'Key' },
  glasses: { src: glassesInk, width: 176, height: 68, label: 'Glasses' },
  pear: { src: pearInk, width: 138, height: 176, label: 'Pear' },
  teapot: { src: teapotInk, width: 176, height: 141, label: 'Teapot' },
  stillLife: { src: journalStillLife, width: 376, height: 391, label: 'Journal and clover flowers' },
  photo: { src: camera, width: 318, height: 322, label: 'Camera' },
  voice: { src: microphone, width: 82, height: 172, label: 'Microphone' },
  text: { src: diary, width: 172, height: 149, label: 'Diary' },
  vase: { src: vase, width: 138, height: 172, label: 'Vase' },
  candle: { src: candle, width: 68, height: 172, label: 'Candle' },
  cup: { src: cup, width: 172, height: 126, label: 'Teacup' },
  letter: { src: letter, width: 159, height: 172, label: 'Letter' },
  clover: { src: clover, width: 136, height: 172, label: 'Clover' },
};

export default function InkDrawing({ name, className = '' }) {
  const { src, width, height } = drawings[name];
  return <img className={'ink-drawing ' + className} src={src} width={width} height={height} alt="" />;
}
