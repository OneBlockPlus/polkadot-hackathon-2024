const API_URL = 'https://polka-ads-1f3f9a46211d.herokuapp.com/api';
const CHECKOUT_URL = 'https://polka-ads.vercel.app/checkout';
// const CHECKOUT_URL = 'http://localhost:3000/checkout';

let youtubeVideoId = null;
let videoId = null;
let currentVideo = null;
let ads = [];
let currentTime = 0;
let checkoutWindow;
let videoElement = null;  // To reference the current video element

// Function to create and display the Checkout modal
function openCheckoutModal(videoId, adId) {
    const videoTitle = encodeURIComponent(document.title);
    if (!checkoutWindow || checkoutWindow.closed) {
        // Open a new window if one isn't open yet or if the previous one was closed
        checkoutWindow = window.open(
            `${CHECKOUT_URL}?videoId=${videoId}&adId=${adId}&videoTitle=${videoTitle}`,
            'popup',
            'width=800,height=650'
        );
    } else {
        // Focus the existing window and update its URL
        checkoutWindow.location.href = `${CHECKOUT_URL}?videoId=${videoId}&adId=${adId}&videoTitle=${videoTitle}`;
        checkoutWindow.focus();
    }

    console.log('Checkout modal opened or updated.');
}

// Stop monitoring playback
const stopMonitoringPlayback = () => {
    if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('seeked', handleSeeked);
        console.log('Stopped monitoring playback for the previous video.');
        videoElement = null;
    }
};

// Reset properties to initial state
const resetProperties = () => {
    youtubeVideoId = null;
    videoId = null;
    currentVideo = null;
    ads = [];
    currentTime = 0;
    console.log('Properties have been reset.');
};

// Handle time updates (moved outside monitorPlayback for easy removal)
const handleTimeUpdate = () => {
    currentTime = Math.floor(videoElement.currentTime);
    ads.forEach((ad, index) => {
        if (currentTime >= ad.timingStart && currentTime <= ad.timingEnd) {
            if (!document.getElementById(`ad-popup-${index}`)) {
                displayPopup(ad, index);
            }
        } else {
            if (document.getElementById(`ad-popup-${index}`)) {
                removePopup(index);
            }
        }
    });
};

// Handle seek event (moved outside monitorPlayback for easy removal)
const handleSeeked = () => {
    currentTime = Math.floor(videoElement.currentTime);
    ads.forEach((ad, index) => {
        if (currentTime >= ad.timingStart && currentTime <= ad.timingEnd) {
            if (!document.getElementById(`ad-popup-${index}`)) {
                displayPopup(ad, index);
            }
        } else {
            if (document.getElementById(`ad-popup-${index}`)) {
                removePopup(index);
            }
        }
    });
};

// Monitor video playback
const monitorPlayback = () => {
    videoElement = document.querySelector('video');
    if (!videoElement) return;

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('seeked', handleSeeked);
    console.log('Started monitoring playback for the new video.');
};

// Create popup element with adjusted layout
const createPopup = (ad, index) => {
    const video = document.querySelector('video');
    const videoHeight = video ? video.clientHeight : 0; // Get video height
    const maxHeight = videoHeight * 0.7; // Set the maximum height to 70% of the video height

    const popup = document.createElement('div');
    popup.id = `ad-popup-${index}`;
    popup.style.position = 'absolute';
    popup.style.top = '10px';
    popup.style.right = '10px';
    popup.style.width = '300px';
    popup.style.maxHeight = `${maxHeight}px`; // Limit the popup height
    popup.style.padding = '10px';
    popup.style.backgroundColor = '#2A183E';
    popup.style.color = '#fff';
    popup.style.borderRadius = '8px';
    popup.style.zIndex = '9999';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.alignItems = 'center';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popup.style.transition = 'opacity 0.3s ease';
    popup.style.opacity = '0';
    popup.style.overflowY = 'auto'; // Allow scrolling if content exceeds max height

    // Fade-in effect
    setTimeout(() => {
        popup.style.opacity = '1';
    }, 10);

    // Ad Image - Adjusted for popup height
    const image = document.createElement('img');
    image.src = ad.image;
    image.alt = ad.title;
    image.style.width = '100%';
    image.style.height = 'auto';
    image.style.maxHeight = `${maxHeight * 0.5}px`; // Limit image height to 50% of max height
    image.style.borderRadius = '5px 5px 0 0';
    image.style.objectFit = 'scale-down';
    popup.appendChild(image);

    // Ad Title
    const title = document.createElement('h4');
    title.textContent = ad.title;
    title.style.margin = '10px 0 5px 0';
    title.style.textAlign = 'center';
    title.style.fontSize = '1.2em';
    popup.appendChild(title);

    // Ad Price
    const price = document.createElement('p');
    price.textContent = `${ad.price} SBY`;
    price.style.fontSize = '1.1em';
    price.style.fontWeight = 'bold';
    price.style.fontFamily = `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`;
    price.style.margin = '5px 0 15px 0';
    popup.appendChild(price);

    // Purchase Button
    const button = document.createElement('button');
    button.textContent = 'Purchase';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = 'rgb(255, 60, 127)';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.fontSize = '1em';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'background-color 0.3s ease';

    // Hover effect for button
    button.onmouseover = () => {
        button.style.backgroundColor = '#e64a19';
        button.style.color = 'black';
    };
    button.onmouseout = () => {
        button.style.backgroundColor = '#87fbb9';
        button.style.color = 'black';
    };

    button.onclick = () => {
        openCheckoutModal(videoId, ad._id);
    };
    popup.appendChild(button);

    return popup;
};

// Fetch ads for the current video
const fetchAds = async () => {
    if (!youtubeVideoId) return;
    try {
        const res = await fetch(`${API_URL}/videos`);
        const videos = await res.json();
        const video = videos.find(v => extractYouTubeID(v.youtubeUrl) === youtubeVideoId);
        currentVideo = video;
        if (video) {
            videoId = video._id;
            ads = video.productAds;
            console.log("Ads fetched for the current video:", ads);
        } else {
            console.log("No ads available for this video.");
            resetProperties();
        }
    } catch (error) {
        console.error('Error fetching ads:', error);
    }
};

// Extract YouTube video ID from URL
const extractYouTubeID = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
};

// Display popup
const displayPopup = (ad, index) => {
    const popup = createPopup(ad, index);
    const videoPlayer = document.querySelector('.html5-video-player'); // YouTube's video player container

    if (videoPlayer) {
        videoPlayer.style.position = 'relative'; // Ensure the video player is positioned relative for absolute children
        videoPlayer.appendChild(popup);
    } else {
        document.body.appendChild(popup);
    }

    // No timer to remove the popup; it will be removed based on timeupdate and seeked events
};

// Remove popup
const removePopup = (index) => {
    const popup = document.getElementById(`ad-popup-${index}`);
    if (popup) {
        // Fade-out effect
        popup.style.opacity = '0';
        setTimeout(() => {
            if (popup.parentElement) {
                popup.parentElement.removeChild(popup);
            }
        }, 300); // Duration matches the CSS transition
    }
    // No timer to clear since we're not using timers
};

// Initialize the script
const init = async () => {
    stopMonitoringPlayback(); // Stop playback monitoring for the previous video
    resetProperties(); // Reset properties before handling the new video

    youtubeVideoId = extractYouTubeID(location.href); // Extract video ID directly from URL
    if (youtubeVideoId) {
        await fetchAds();
        if (videoId) {
            monitorPlayback(); // Start playback monitoring for the new video if it has ads
        }
    }
};

// Observe URL changes (for navigating within YouTube without page reload)
let lastUrl = location.href;
new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        init();
    }
}).observe(document, {subtree: true, childList: true});

// Initial load
init();