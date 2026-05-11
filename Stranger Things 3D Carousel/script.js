// Image Configuration (Must match the IDs in the HTML IMG tags)
const images = [
    'src/images/mike.png',
    'src/images/jane.png',
    'src/images/will.png',
    'src/images/dustin.png',
    'src/images/max.png',
    'src/images/lucas.png',
    'src/images/steve.png',
    'src/images/nancy.png',
    'src/images/jonathan.png'
];

const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.card');
const bgLayers = [document.getElementById('bg1'), document.getElementById('bg2')];

const total = cards.length;
const radius = 380;
const angleStep = 360 / total;
let currentBgIndex = 0;

// Setup initial positions
cards.forEach((card, i) => {
  const theta = angleStep * i;
  card.style.transform = `rotateY(${theta}deg) translateZ(${radius}px)`;
});
bgLayers[0].style.backgroundImage = `url(${images[0]})`;

let currentAngle = 0;
let targetAngle = 0;
let isDragging = false;
let startX = 0;
let startAngle = 0;
let isHovering = false;
let lastActiveIndex = -1;

function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

function animate() {
  if (isDragging) {
    currentAngle = targetAngle;
  } else if (isHovering) {
    currentAngle = lerp(currentAngle, targetAngle, 0.1);
  } else {
    targetAngle -= 0.2; 
    currentAngle = lerp(currentAngle, targetAngle, 0.1); 
  }

  carousel.style.transform = `rotateY(${currentAngle}deg)`;
  updateActiveCard();
  requestAnimationFrame(animate);
}
animate();

cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        // Double check: Only allow hover if pointer-events didn't catch it
        // (This acts as a secondary safety check)
        if(card.style.pointerEvents === 'none') return;

        isHovering = true;
        const index = parseInt(card.dataset.index);
        const cardAngle = index * angleStep;
        
        const currentRest = targetAngle; 
        const baseTarget = -cardAngle;
        const rounds = Math.round((currentRest - baseTarget) / 360);
        targetAngle = baseTarget + (rounds * 360);
    });

    card.addEventListener('mouseleave', () => {
        isHovering = false;
    });
});

document.addEventListener('mousedown', e => {
  isDragging = true;
  startX = e.clientX;
  startAngle = targetAngle;
  document.body.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const delta = e.clientX - startX;
  targetAngle = startAngle + (delta * 0.5);
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.cursor = 'default';
});

function updateActiveCard() {
    const normalizedAngle = ((-currentAngle % 360) + 360) % 360;
    const activeIndex = Math.round(normalizedAngle / angleStep) % total;

    if (activeIndex !== lastActiveIndex) {
        lastActiveIndex = activeIndex;
        changeBackground(activeIndex);
    }

    cards.forEach((card, index) => {
        // Calculate distance in steps from the active card
        // We handle the wrap-around (e.g., if total is 6, distance between 0 and 5 is 1)
        let distance = Math.abs(index - activeIndex);
        if (distance > total / 2) distance = total - distance;

        if (index === activeIndex) {
            // ACTIVE CARD (Center)
            card.classList.add('active');
            card.style.transform = `rotateY(${index * angleStep}deg) translateZ(${radius}px) scale(1.1)`;
            card.style.opacity = 1;
            card.style.pointerEvents = 'auto'; // Fully interactable
        } 
        else if (distance <= 1) {
             // IMMEDIATE NEIGHBORS (Left and Right)
            card.classList.remove('active');
            card.style.transform = `rotateY(${index * angleStep}deg) translateZ(${radius}px) scale(1)`;
            card.style.opacity = 0.8; 
            card.style.pointerEvents = 'auto'; // Interactable so you can click/hover to spin
        } 
        else {
            // BACK CARDS (Hidden/Background)
            card.classList.remove('active');
            card.style.transform = `rotateY(${index * angleStep}deg) translateZ(${radius}px) scale(1)`;
            card.style.opacity = 0.3; // Dim them out
            card.style.pointerEvents = 'none'; // DISABLE HOVER completely
        }
    });
}

function changeBackground(index) {
    const nextLayerIndex = (currentBgIndex + 1) % 2;
    const nextLayer = bgLayers[nextLayerIndex];
    const currentLayer = bgLayers[currentBgIndex];

    nextLayer.style.backgroundImage = `url(${images[index]})`;
    nextLayer.classList.add('visible');
    currentLayer.classList.remove('visible');
    currentBgIndex = nextLayerIndex;
}