import { colors as previousColours } from './mockData';

export const leafPalette = [
  { value: '#e098ac', label: 'Sea Pink', text: '#441910' },
  { value: '#a6c9dd', label: 'Crystal Blue', text: '#441910' },
  { value: '#68002c', label: 'Beet Red', text: '#fffdfb' },
  { value: '#9db6c5', label: 'Soft Slate', text: '#441910' },
  { value: '#cd9d99', label: 'Dusty Rose', text: '#441910' },
  { value: '#441910', label: 'Rum Raisin', text: '#fffdfb' },
];

export function leafColour(storedColour) {
  const value = typeof storedColour === 'string' ? storedColour.toLowerCase() : '';
  const exact = leafPalette.find(option => option.value === value);
  return exact ?? leafPalette[previousColours.indexOf(value)] ?? leafPalette[0];
}
