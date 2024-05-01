async function setupVideoObserver() {
    document.addEventListener("DOMContentLoaded", function() {
        var videoElement = document.getElementById('myVideo');

        videoElement.addEventListener('ended', function() {
            videoElement.style.opacity = '0';
            setTimeout(function() {
                videoElement.currentTime = 0;
                videoElement.play();
                setTimeout(function() {
                    videoElement.style.opacity = '1';
                }, 100); // Short delay to ensure the video starts playing before fading in
            }, 5000); // Fade-out duration
        });

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    videoElement.play();
                } else {
                    videoElement.pause();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(videoElement);
    });
}

export { setupVideoObserver };
