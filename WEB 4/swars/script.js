const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');

let isWarping = false;
let warpSpeed = 0;

let meteors = [];
let stars = [];

const isMobile = window.innerWidth < 768;
const meteorCount = isMobile ? 4 : 10;
const starCount = isMobile ? 80 : 300;

let mouseX = 0;
let mouseY = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isWarping) return;

        isWarping = true;
        document.querySelectorAll('#ui-container, .starwars-title, .starwars-intro, .faction-banner').forEach(el => {
            el.classList.add('zoom-out');
        });

        let nextPage = 'index.html';
        const buttonText = btn.textContent.trim();
        
        if (buttonText === 'View Rebel') {
            nextPage = 'galactic-empire.html';
        } else if (buttonText === 'View Galactic') {
            nextPage = 'rebel alliance.html';
        } else if (buttonText === 'Approach') {
            nextPage = 'index.html';
        } else if (buttonText === 'Back') {
            nextPage = 'index.html';
        }

        setTimeout(() => {
            document.querySelector('.warp-overlay').classList.add('active');
        }, 2000);

        setTimeout(() => {
            window.location.href = nextPage;
        }, 2800);
    });
});

if (!isMobile) {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (isWarping) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});


class Star {
    constructor() { this.init(); }

    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.parallaxFactor = Math.random() * 0.05;
        this.size = Math.random() * 1.5;
        this.alpha = Math.random();
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;

        const dx = this.x - canvas.width / 2;
        const dy = this.y - canvas.height / 2;
        this.angle = Math.atan2(dy, dx);
        this.dist = Math.sqrt(dx * dx + dy * dy);
        this.velocity = 0;
    }

    draw() {
        if (!isWarping) {
            const offsetX = (canvas.width / 2 - mouseX) * this.parallaxFactor;
            const offsetY = (canvas.height / 2 - mouseY) * this.parallaxFactor;

            this.alpha += this.twinkleSpeed;
            if (this.alpha > 1 || this.alpha < 0) this.twinkleSpeed = -this.twinkleSpeed;

            ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(this.alpha)})`;
            ctx.beginPath();
            ctx.arc(this.baseX + offsetX, this.baseY + offsetY, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            this.velocity += warpSpeed;
            this.dist += this.velocity;

            const newX = canvas.width / 2 + Math.cos(this.angle) * this.dist;
            const newY = canvas.height / 2 + Math.sin(this.angle) * this.dist;

            const trailLen = this.velocity * 3;
            const prevX = newX - Math.cos(this.angle) * trailLen;
            const prevY = newY - Math.sin(this.angle) * trailLen;

            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, warpSpeed / 10)})`;
            ctx.lineWidth = this.size;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(newX, newY);
            ctx.stroke();

            if (newX < 0 || newX > canvas.width || newY < 0 || newY > canvas.height) {
                this.dist = Math.random() * 50;
                this.velocity = 0;
                this.angle = Math.random() * Math.PI * 2;
            }
        }
    }
}


class Meteor {
    constructor() { this.init(); }
    init() {
        this.x = Math.random() * canvas.width + 300;
        this.y = Math.random() * -200 - 100;
        this.speed = Math.random() * 8 + 6;
        this.size = Math.random() * 1.5 + 0.5;
        this.angle = (Math.PI / 4) + (Math.random() * 0.1 - 0.05);
        this.vx = Math.cos(this.angle) * -this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.length = Math.random() * 150 + 80;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -this.length || this.y > canvas.height + this.length) this.init();
    }
    draw() {
        const tailX = this.x - Math.cos(this.angle) * -this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;
        const grd = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        grd.addColorStop(0, "rgba(255, 255, 255, 1)");
        grd.addColorStop(1, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grd;
        ctx.lineWidth = this.size;
        ctx.lineCap = "round";
        ctx.stroke();
    }
}

function setup() {
    resize();
    meteors = []; stars = [];
    for (let i = 0; i < meteorCount; i++) meteors.push(new Meteor());
    for (let i = 0; i < starCount; i++) stars.push(new Star());
}

function loop() {
    if (isWarping) {
        warpSpeed += 0.5;
        ctx.fillStyle = "rgba(10, 15, 30, 0.2)";
    } else {
        ctx.fillStyle = "rgba(10, 15, 30, 0.4)";
    }

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => s.draw());
    if (!isWarping) {
        meteors.forEach(m => { m.update(); m.draw(); });
    }

    requestAnimationFrame(loop);
}

window.addEventListener('resize', setup);
setup();
loop();

