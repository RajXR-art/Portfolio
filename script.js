// Interactive Particle Background Engine
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const mouse = { x: null, y: null, radius: 120 };

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Mouse tracking
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.size = Math.random() * 2 + 1;
        this.color = 'rgba(139, 92, 246, ' + (Math.random() * 0.4 + 0.1) + ')';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on borders
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Mouse attraction
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                this.x -= dx * force * 0.03;
                this.y -= dy * force * 0.03;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Initialize particles
const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 18000));
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

// Connect particles close to each other
function drawLines() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 110) {
                const alpha = (110 - distance) / 110 * 0.15;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    drawLines();
    requestAnimationFrame(animate);
}
animate();


// Scroll Entry Animations
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Keep active after scroll past
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));


// Custom Video Showcase and Modal Controllers
const modal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const projectCards = document.querySelectorAll('.project-card');

const video = document.getElementById('showcase-video');
const videoWrapper = document.getElementById('video-wrapper');
const bigPlayBtn = document.getElementById('big-play-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const muteBtn = document.getElementById('mute-btn');
const volumeHighIcon = document.getElementById('volume-high-icon');
const volumeMutedIcon = document.getElementById('volume-muted-icon');
const volumeSlider = document.getElementById('volume-slider');
const timelineContainer = document.getElementById('timeline-container');
const timelineBar = document.getElementById('timeline-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const fullscreenBtn = document.getElementById('fullscreen-btn');

const modalTitle = document.getElementById('modal-project-title');
const modalDesc = document.getElementById('modal-project-desc');

let controlsTimeout;

// Open modal and load specific video details
projectCards.forEach(card => {
    card.addEventListener('click', () => {
        const videoSrc = card.getAttribute('data-video-src');
        const title = card.getAttribute('data-project-title');
        const desc = card.getAttribute('data-project-desc');
        
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        
        // Reset player UI
        video.src = videoSrc;
        video.load();
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop page scrolling
        
        // Automatically play on open
        video.play().catch(e => {
            console.log("Auto-play blocked or error: ", e);
        });
    });
});

// Close modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    video.pause();
    video.src = ""; // Unload source to release bandwidth
}

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    // Close modal if clicked outer overlay
    if (e.target === modal) {
        closeModal();
    }
});

// Handle Esc Key to Close Modal
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});


// Custom Video Player Controls
function togglePlay() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

playPauseBtn.addEventListener('click', togglePlay);
bigPlayBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

video.addEventListener('play', () => {
    videoWrapper.classList.remove('paused');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    showControlsTemporarily();
});

video.addEventListener('pause', () => {
    videoWrapper.classList.add('paused');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
});

// Format seconds into MM:SS
function formatTime(timeInSeconds) {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Update time tracking
video.addEventListener('timeupdate', () => {
    const percent = (video.currentTime / video.duration) * 100;
    timelineBar.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(video.currentTime);
});

// Load metadata to show total length
video.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(video.duration);
    currentTimeEl.textContent = "0:00";
});

// Seek functionality
function seekVideo(e) {
    const rect = timelineContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * video.duration;
    video.currentTime = Math.min(Math.max(0, seekTime), video.duration);
}

// Enable drag to seek
let isDraggingTimeline = false;

timelineContainer.addEventListener('mousedown', (e) => {
    isDraggingTimeline = true;
    seekVideo(e);
});

window.addEventListener('mousemove', (e) => {
    if (isDraggingTimeline) {
        seekVideo(e);
    }
});

window.addEventListener('mouseup', () => {
    isDraggingTimeline = false;
});

// Volume control
function updateVolume() {
    video.volume = volumeSlider.value;
    if (video.volume === 0) {
        video.muted = true;
        volumeHighIcon.style.display = 'none';
        volumeMutedIcon.style.display = 'block';
    } else {
        video.muted = false;
        volumeHighIcon.style.display = 'block';
        volumeMutedIcon.style.display = 'none';
    }
}

volumeSlider.addEventListener('input', updateVolume);

muteBtn.addEventListener('click', () => {
    if (video.muted) {
        video.muted = false;
        volumeSlider.value = video.volume || 1;
        volumeHighIcon.style.display = 'block';
        volumeMutedIcon.style.display = 'none';
    } else {
        video.muted = true;
        volumeSlider.value = 0;
        volumeHighIcon.style.display = 'none';
        volumeMutedIcon.style.display = 'block';
    }
});

// Fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Request fullscreen on container to keep overlay controls
        if (videoWrapper.requestFullscreen) {
            videoWrapper.requestFullscreen();
        } else if (videoWrapper.webkitRequestFullscreen) { /* Safari */
            videoWrapper.webkitRequestFullscreen();
        } else if (videoWrapper.msRequestFullscreen) { /* IE11 */
            videoWrapper.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

// Control bar timeout hiding/showing
function showControlsTemporarily() {
    videoWrapper.classList.add('controls-active');
    clearTimeout(controlsTimeout);
    
    // Auto hide controls after 3 seconds if playing and mouse is quiet
    if (!video.paused) {
        controlsTimeout = setTimeout(() => {
            if (!isDraggingTimeline) {
                videoWrapper.classList.remove('controls-active');
            }
        }, 3000);
    }
}

videoWrapper.addEventListener('mousemove', showControlsTemporarily);
videoWrapper.addEventListener('mouseleave', () => {
    if (!video.paused) {
        videoWrapper.classList.remove('controls-active');
    }
});
videoWrapper.addEventListener('mouseenter', showControlsTemporarily);
