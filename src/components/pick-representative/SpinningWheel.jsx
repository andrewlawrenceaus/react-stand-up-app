import { useRef, useEffect, useCallback, useState } from 'react';
import { getColor } from '../participants/InitialsAvatar';

const SPIN_DURATION = 4500;
const MIN_EXTRA_TURNS = 5;
const MAX_EXTRA_TURNS = 8;
const POINTER_COLOR = '#C4637A';
const BORDER_COLOR = '#D8CCBF';
const CANVAS_SIZE = 360;
const WHEEL_RADIUS = 155;
const TEXT_MAX_CHARS = 14;

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function truncateName(name) {
  if (name.length <= TEXT_MAX_CHARS) return name;
  return name.slice(0, TEXT_MAX_CHARS - 1) + '\u2026';
}

export default function SpinningWheel({ participants, onSpinComplete }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const segmentAngle = (2 * Math.PI) / participants.length;

  const drawWheel = useCallback((rotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw segments
    for (let i = 0; i < participants.length; i++) {
      const startAngle = i * segmentAngle + rotation;
      const endAngle = startAngle + segmentAngle;
      const color = getColor(participants[i].name);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, WHEEL_RADIUS, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Segment border
      ctx.strokeStyle = BORDER_COLOR;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw name
      const midAngle = startAngle + segmentAngle / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.font = '600 13px "Noto Sans JP", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 2;
      ctx.fillText(truncateName(participants[i].name), WHEEL_RADIUS - 14, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, WHEEL_RADIUS, 0, 2 * Math.PI);
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#FDFBF7';
    ctx.fill();
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer triangle (top center)
    const pointerSize = 16;
    ctx.beginPath();
    ctx.moveTo(cx, cy - WHEEL_RADIUS - pointerSize + 4);
    ctx.lineTo(cx - 10, cy - WHEEL_RADIUS - pointerSize - 14);
    ctx.lineTo(cx + 10, cy - WHEEL_RADIUS - pointerSize - 14);
    ctx.closePath();
    ctx.fillStyle = POINTER_COLOR;
    ctx.fill();
    ctx.strokeStyle = '#A84F66';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [participants, segmentAngle]);

  // Draw on mount and when participants change
  useEffect(() => {
    rotationRef.current = 0;
    setIsSpinning(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    drawWheel(0);
  }, [participants, drawWheel]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Pre-select random winner
    const winnerIndex = Math.floor(Math.random() * participants.length);

    // Calculate target rotation:
    // The pointer is at the top (- PI/2 or 3PI/2 direction).
    // We want the winner's segment midpoint to be at the top.
    // Segment midpoint angle = winnerIndex * segmentAngle + segmentAngle / 2
    // For that to align with top (- PI/2), we need:
    // rotation + midAngle = -PI/2 + 2*PI*k (mod 2PI)
    const winnerMidAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    const targetOffset = -Math.PI / 2 - winnerMidAngle;

    // Add random extra full turns
    const extraTurns = MIN_EXTRA_TURNS + Math.random() * (MAX_EXTRA_TURNS - MIN_EXTRA_TURNS);
    const targetRotation = rotationRef.current + extraTurns * 2 * Math.PI + targetOffset - rotationRef.current % (2 * Math.PI);

    // Ensure we always spin forward at least MIN_EXTRA_TURNS
    const finalTarget = targetRotation > rotationRef.current + MIN_EXTRA_TURNS * 2 * Math.PI
      ? targetRotation
      : targetRotation + 2 * Math.PI;

    const startRotation = rotationRef.current;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const easedProgress = easeOutQuart(progress);

      const currentRotation = startRotation + (finalTarget - startRotation) * easedProgress;
      rotationRef.current = currentRotation;
      drawWheel(currentRotation);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        animFrameRef.current = null;
        setIsSpinning(false);
        onSpinComplete(participants[winnerIndex]);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="pick-rep__wheel-area">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="pick-rep__canvas"
      />
      <div className="pick-rep__legend">
        {participants.map(p => (
          <span key={p.id} className="pick-rep__legend-item">
            {p.name}
          </span>
        ))}
      </div>
      <button
        className="duck-btn duck-btn--primary pick-rep__spin-btn"
        onClick={spin}
        disabled={isSpinning}
      >
        {isSpinning ? 'Spinning\u2026' : 'Spin the Wheel'}
      </button>
    </div>
  );
}
