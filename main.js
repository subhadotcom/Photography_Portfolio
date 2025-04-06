// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    let isMenuOpen = false;
    
    // Toggle menu function
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Prevent scrolling when menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }
    
    // Toggle menu on button click
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (isMenuOpen && !event.target.closest('.main-nav')) {
            toggleMenu();
        }
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) {
                toggleMenu();
            }
        });
    });
    
    // Close menu when resizing window to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && isMenuOpen) {
            toggleMenu();
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Image data - separate arrays for hero section and gallery
const heroImages = [
    { path: 'images/20230212_130019.jpg', alt: 'Nature Photography 1' },
    { path: 'images/20220416_172142.jpg', alt: 'Nature Photography 2' },
    { path: 'images/20220409_094558.jpg', alt: 'Nature Photography 3' },
];

// Import gallery images from the separate file
// The galleryImages array is now defined in gallery-images.js

// Function to load gallery images
function loadGalleryImages() {
    const gallery = document.querySelector('.gallery');
    if (!gallery) {
        console.error('Gallery container not found');
        return;
    }
    
    // Clear existing gallery items
    gallery.innerHTML = '';
    
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading Gallery...</div>
        <div class="loading-progress">
            <div class="loading-progress-bar"></div>
        </div>
    `;
    gallery.appendChild(loadingIndicator);
    
    // Check if galleryImages is defined
    if (!galleryImages || !Array.isArray(galleryImages)) {
        console.error('galleryImages is not defined or not an array');
        loadingIndicator.querySelector('.loading-text').textContent = 'Error loading gallery';
        return;
    }
    
    let loadedImages = 0;
    const fragment = document.createDocumentFragment();
    
    // Function to update loading progress
    function updateProgress() {
        loadedImages++;
        const progress = (loadedImages / galleryImages.length) * 100;
        const progressBar = loadingIndicator.querySelector('.loading-progress-bar');
        progressBar.style.width = `${progress}%`;
        loadingIndicator.querySelector('.loading-text').textContent = 
            `Loading Gallery... ${Math.round(progress)}%`;
        
        if (loadedImages === galleryImages.length) {
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 500);
        }
    }
    
    // Load all images
    galleryImages.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', index);
        
        const img = new Image();
        img.src = image.path;
        img.alt = image.alt || 'Gallery Image';
        img.loading = 'lazy';
        
        // Handle successful image load
        img.onload = function() {
            updateProgress();
            galleryItem.classList.add('loaded');
        };
        
        // Handle image load error
        img.onerror = function() {
            console.error('Failed to load image:', image.path);
            img.src = 'images/placeholder.jpg';
            updateProgress();
            galleryItem.classList.add('error');
        };
        
        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        overlay.innerHTML = `
            <div class="gallery-buttons">
                <button class="view-btn" data-img="${image.path}"><i class="fas fa-eye"></i> View</button>
                <a href="${image.path}" download class="download-btn"><i class="fas fa-download"></i> Download</a>
            </div>
        `;
        
        galleryItem.appendChild(img);
        galleryItem.appendChild(overlay);
        fragment.appendChild(galleryItem);
    });
    
    // Clear gallery and append all items
    gallery.appendChild(fragment);
    
    // Initialize image viewer
    initializeImageViewer();
}

// Function to initialize image viewer
function initializeImageViewer() {
    const imageViewer = document.querySelector('.image-viewer');
    const viewerImage = document.querySelector('.image-viewer img');
    const closeViewer = document.querySelector('.close-viewer');
    
    // Use event delegation for better performance
    document.querySelector('.gallery').addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-btn');
        if (viewBtn) {
            const imgSrc = viewBtn.getAttribute('data-img');
            
            // Preload the image before showing it
            const tempImg = new Image();
            tempImg.onload = function() {
                viewerImage.src = imgSrc;
                imageViewer.classList.add('active');
            };
            tempImg.src = imgSrc;
        }
    });
    
    // Close viewer when clicking the close button or outside the image
    closeViewer.addEventListener('click', () => {
        imageViewer.classList.remove('active');
    });
    
    imageViewer.addEventListener('click', (e) => {
        if (e.target === imageViewer) {
            imageViewer.classList.remove('active');
        }
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!imageViewer.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            imageViewer.classList.remove('active');
        }
    });
}

// Function to load slideshow images
function loadSlideshowImages() {
    const slides = document.querySelector('.slides');
    slides.innerHTML = ''; // Clear existing slides
    
    // Use hero images for the slideshow
    heroImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = `slide ${index === 0 ? 'active' : ''}`;
        
        slide.innerHTML = `
            <img src="${image.path}" alt="${image.alt}">
        `;
        
        slides.appendChild(slide);
    });
    
    // Reinitialize slideshow
    initializeSlideshow();
}

// Function to initialize slideshow
function initializeSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.slide-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    let slideInterval;

    // Clear existing dots
    dotsContainer.innerHTML = '';

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    // Function to update slides
    function updateSlides() {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    // Function to go to specific slide
    function goToSlide(index) {
        currentSlide = index;
        updateSlides();
        resetInterval();
    }

    // Function to go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlides();
    }

    // Function to go to previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlides();
    }

    // Function to reset interval
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    // Event listeners for buttons
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    // Start slideshow
    resetInterval();

    // Pause slideshow on hover
    const slideshowContainer = document.querySelector('.slideshow-container');
    slideshowContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
    slideshowContainer.addEventListener('mouseleave', resetInterval);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load gallery and slideshow images
    loadGalleryImages();
    loadSlideshowImages();
    
    // Initialize image viewer for the modal
    // Note: The image viewer is now initialized in the loadGalleryImages function
    // after all images are loaded, so we don't need to initialize it here
});

// Form submission handling
const contactForm = document.querySelector('.contact-form form');
const submitButton = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic form validation
    const name = contactForm.querySelector('input[name="name"]').value.trim();
    const email = contactForm.querySelector('input[name="email"]').value.trim();
    const message = contactForm.querySelector('textarea[name="message"]').value.trim();

    if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Show loading state
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    try {
        // Submit the form
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Redirect to thank you page
            window.location.href = 'thanks.html';
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        alert('An error occurred. Please try again later.');
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
});

// Add animation to sections when they come into view
const sections = document.querySelectorAll('section');
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(section);
});

// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        // Save theme preference
        const isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
}); 

