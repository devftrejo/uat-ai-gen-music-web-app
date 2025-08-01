import "./style.css";

// Audio player and music mapping
let currentAudio = null;
let isPlaying = false;

// Music file mapping - maps song titles to actual MP3 files
const musicFiles = {
  "Whisper of the Tides": "/Whisper of the Tides.mp3",
  "Whispers of the Moonlight": "/Whispers of the Moonlight.mp3",
  "Whispering Pines": "/Whispering Pines.mp3",
  "Tranquil Space": "/Tranquil Space ext v1.2.mp3",
  "Whispers of Dreams": "/Whispers of Dreams ext v1.1.mp3",
  "Whispers of Spring": "/Whispers of Spring ext v1.1.mp3",
  "Above the Tree Line": "/Summit Reverie - Above the Tree Line - Sonauto.mp3",
  "Trace of Silence": "/Summit Reverie - Trace of Silence - Sonauto.mp3",
  "Dawn's Embrace": "/Summit Reverie - Dawn's Embrace - Sonauto.mp3",
  "Celestial Drift": "/Celestial Drift.mp3",
};

// Music player functionality
const playBtn = document.querySelector(".play-btn");
const prevBtn = document.querySelector(".control-btn:first-child");
const nextBtn = document.querySelector(".control-btn:last-child");
const progressBar = document.querySelector(".progress");
const timeInfo = document.querySelectorAll(".time-info span");
let currentSongTitle = "Whisper of the Tides";
let currentSongIndex = 0;

// Get array of song titles for navigation
const songTitles = Object.keys(musicFiles);

// Function to format time in MM:SS format
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Function to load and play audio
function loadAudio(audioSrc, title) {
  // Stop current audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Create new audio element
  currentAudio = new Audio(audioSrc);
  currentSongTitle = title;

  // Set up audio event listeners
  currentAudio.addEventListener("loadedmetadata", () => {
    timeInfo[1].textContent = formatTime(currentAudio.duration);
  });

  currentAudio.addEventListener("timeupdate", () => {
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    progressBar.style.width = `${progress}%`;
    timeInfo[0].textContent = formatTime(currentAudio.currentTime);
  });

  currentAudio.addEventListener("ended", () => {
    isPlaying = false;
    playBtn.textContent = "▶";
    progressBar.style.width = "0%";
    timeInfo[0].textContent = "0:00";

    // Update play icon states
    updatePlayIconStates();

    // Auto-play next song
    setTimeout(() => {
      nextBtn.click();
    }, 500);
  });

  currentAudio.addEventListener("error", (e) => {
    console.error("Audio loading error:", e);
    alert("Error loading audio file. Please check if the file exists.");
  });
}

playBtn.addEventListener("click", () => {
  if (!currentAudio) {
    // Load default audio if none is loaded
    const defaultAudio = "/Whisper of the Tides.mp3";
    loadAudio(defaultAudio, "Whisper of the Tides");
    document.querySelector(".track-info h3").textContent =
      "Whisper of the Tides";
    document.querySelector(".track-info p").textContent =
      "A serene composition featuring soft ambient tones";
  }

  if (currentAudio.paused) {
    currentAudio.play();
    isPlaying = true;
    playBtn.textContent = "⏸";
  } else {
    currentAudio.pause();
    isPlaying = false;
    playBtn.textContent = "▶";
  }

  // Update play icon states
  setTimeout(() => {
    if (typeof updatePlayIconStates === "function") {
      updatePlayIconStates();
    }
  }, 100);
});

// Previous track functionality
prevBtn.addEventListener("click", () => {
  currentSongIndex =
    (currentSongIndex - 1 + songTitles.length) % songTitles.length;
  const prevSong = songTitles[currentSongIndex];
  const audioFile = musicFiles[prevSong];

  if (audioFile) {
    loadAudio(audioFile, prevSong);
    updatePlayerInfo(prevSong);
    setTimeout(() => {
      playBtn.click();
      updatePlayIconStates();
    }, 100);
  }
});

// Next track functionality
nextBtn.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex + 1) % songTitles.length;
  const nextSong = songTitles[currentSongIndex];
  const audioFile = musicFiles[nextSong];

  if (audioFile) {
    loadAudio(audioFile, nextSong);
    updatePlayerInfo(nextSong);
    setTimeout(() => {
      playBtn.click();
      updatePlayIconStates();
    }, 100);
  }
});

// Function to update player info
function updatePlayerInfo(title) {
  currentSongTitle = title;
  document.querySelector(".track-info h3").textContent = title;

  // Find the song card to get description and emoji
  const songCards = document.querySelectorAll(".song-card");
  songCards.forEach((card) => {
    const cardTitle = card.querySelector(".song-title").textContent;
    if (cardTitle === title) {
      const description = card.querySelector(".song-description").textContent;
      const songThumbnail = card.querySelector(".song-thumbnail");
      // Get only the emoji (first text node, excluding the play icon overlay)
      const emoji = songThumbnail.firstChild.textContent.trim();
      document.querySelector(".track-info p").textContent = description;
      document.querySelector(".album-art").textContent = emoji;
    }
  });

  // Reset player state
  isPlaying = false;
  playBtn.textContent = "▶";
  progressBar.style.width = "0%";
  timeInfo[0].textContent = "0:00";

  // Update play icon states
  updatePlayIconStates();
}

// Song card interactions with improved touch support
document.querySelectorAll(".song-card").forEach((card, index) => {
  // Add touch support for better mobile interaction
  let touchStartTime = 0;

  card.addEventListener("touchstart", (e) => {
    touchStartTime = Date.now();
    card.style.transform = "scale(0.98)";
  });

  card.addEventListener("touchend", (e) => {
    card.style.transform = "";
    const touchEndTime = Date.now();

    // Only trigger click if it was a quick tap (not a scroll)
    if (touchEndTime - touchStartTime < 200) {
      handleCardClick(card);
    }
  });

  card.addEventListener("click", (e) => {
    // Prevent double handling on touch devices
    if (e.type === "click" && touchStartTime > 0) {
      const timeSinceTouch = Date.now() - touchStartTime;
      if (timeSinceTouch < 500) {
        return; // Skip click if recent touch
      }
    }
    handleCardClick(card);
  });

  function handleCardClick(card) {
    const title = card.querySelector(".song-title").textContent;
    const description = card.querySelector(".song-description").textContent;

    // Update current song index
    currentSongIndex = songTitles.indexOf(title);

    // Get the corresponding audio file
    const audioFile = musicFiles[title];

    if (audioFile) {
      // Load and prepare the audio
      loadAudio(audioFile, title);

      // Update player with selected song
      document.querySelector(".track-info h3").textContent = title;
      document.querySelector(".track-info p").textContent = description;

      // Update album art emoji based on song
      const thumbnail = card.querySelector(".song-thumbnail");
      const emoji = thumbnail.textContent.trim();
      document.querySelector(".album-art").textContent = emoji;

      // Reset play button
      isPlaying = false;
      playBtn.textContent = "▶";
      progressBar.style.width = "0%";
      timeInfo[0].textContent = "0:00";

      // Auto-play the selected song
      setTimeout(() => {
        playBtn.click();
      }, 100);
    } else {
      console.warn(`No audio file found for: ${title}`);
      alert(
        `Audio file not found for "${title}". Please check the file mapping.`
      );
    }
  }
});

// Add scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe song cards for animation
document.querySelectorAll(".song-card").forEach((card, index) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(30px)";
  card.style.transition = `all 0.6s ease ${index * 0.1}s`;
  observer.observe(card);
});

// Responsive parallax effect for hero section
let ticking = false;

function updateParallax() {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector(".hero");
  const isMobile = window.innerWidth <= 768;

  if (hero) {
    // Reduce parallax effect on mobile for better performance
    const parallaxIntensity = isMobile ? 0.2 : 0.5;
    hero.style.transform = `translateY(${scrolled * parallaxIntensity}px)`;
  }

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

// Progress bar click functionality for seeking
progressBar.parentElement.addEventListener("click", (e) => {
  if (currentAudio) {
    const rect = progressBar.parentElement.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    currentAudio.currentTime = percent * currentAudio.duration;
  }
});

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    playBtn.click();
  }
});

// Handle play icon clicks on song cards
document.addEventListener("DOMContentLoaded", () => {
  const songCards = document.querySelectorAll(".song-card");

  songCards.forEach((card) => {
    const playIcon = card.querySelector(".play-icon");
    const songTitle = card.dataset.song;

    if (playIcon && songTitle) {
      playIcon.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent card click event

        // Get the audio file path
        const audioPath = musicFiles[songTitle];
        if (audioPath) {
          // Update the main player display
          const trackInfo = document.querySelector(".track-info");
          const albumArt = document.querySelector(".album-art");
          const songTitleElement = card.querySelector(".song-title");
          const songDescription = card.querySelector(".song-description");

          // Update track info
          trackInfo.querySelector("h3").textContent = songTitle;
          trackInfo.querySelector("p").textContent =
            songDescription.textContent;

          // Update album art with the song's emoji
          const songThumbnail = card.querySelector(".song-thumbnail");
          const emoji = songThumbnail.firstChild.textContent.trim();
          albumArt.textContent = emoji;

          // Load and play the audio
          loadAudio(audioPath, songTitle);

          // Update current song index for navigation
          currentSongIndex = songTitles.indexOf(songTitle);
          currentSongTitle = songTitle;

          // Start playing
          setTimeout(() => {
            if (currentAudio) {
              currentAudio.play();
              isPlaying = true;
              playBtn.textContent = "⏸";
            }
          }, 100);
        }
      });
    }
  });
});

// Update play icon state based on current playing song
function updatePlayIconStates() {
  const songCards = document.querySelectorAll(".song-card");

  songCards.forEach((card) => {
    const playIcon = card.querySelector(".play-icon");
    const songTitle = card.dataset.song;

    if (playIcon && songTitle) {
      if (songTitle === currentSongTitle && isPlaying) {
        playIcon.textContent = "⏸";
      } else {
        playIcon.textContent = "▶";
      }
    }
  });
}
