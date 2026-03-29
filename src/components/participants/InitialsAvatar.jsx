// Muted, ink-washed palette — desaturated to sit naturally on washi paper
const COLORS = [
  '#C4637A', // sakura
  '#5E7B62', // dried moss
  '#7B6EA0', // wisteria
  '#5B86A0', // indigo wash
  '#A07050', // persimmon
  '#7A9088', // celadon
  '#A06070', // deep sakura
  '#4A7A6A', // pine
];

function getInitials(name) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return words[0][0].toUpperCase();
}

function getColor(name) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

export default function InitialsAvatar({ name, sx }) {
  const initials = getInitials(name);
  const color = getColor(name);

  return (
    <div
      className="initials-avatar"
      style={{ backgroundColor: color, ...sx }}
      role="img"
      aria-label={name}
    >
      {initials}
    </div>
  );
}
