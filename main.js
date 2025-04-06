// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Image viewer functionality
const imageViewer = document.querySelector('.image-viewer');
const viewerImage = imageViewer.querySelector('img');
const closeViewer = document.querySelector('.close-viewer');
const viewButtons = document.querySelectorAll('.view-btn');

viewButtons.forEach(button => {
    button.addEventListener('click', () => {
        const imgSrc = button.getAttribute('data-img');
        viewerImage.src = imgSrc;
        imageViewer.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

closeViewer.addEventListener('click', () => {
    imageViewer.classList.remove('active');
    document.body.style.overflow = 'auto';
});

imageViewer.addEventListener('click', (e) => {
    if (e.target === imageViewer) {
        imageViewer.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
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

// Slideshow functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.slide-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    let slideInterval;

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
}); 