document.addEventListener('DOMContentLoaded', () => {
    // Slideshow functionality
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 3000); // 3 seconds interval
    }

    function stopSlideshow() {
        clearInterval(slideInterval);
    }

    // Event listeners for slideshow controls
    prevBtn.addEventListener('click', () => {
        stopSlideshow();
        prevSlide();
        startSlideshow();
    });

    nextBtn.addEventListener('click', () => {
        stopSlideshow();
        nextSlide();
        startSlideshow();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopSlideshow();
            showSlide(index);
            startSlideshow();
        });
    });

    // Start the slideshow
    showSlide(0);
    startSlideshow();

    // Gallery loading functionality
    const gallery = document.querySelector('.gallery');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading images...</div>
        <div class="loading-progress">
            <div class="loading-progress-bar"></div>
        </div>
    `;
    gallery.appendChild(loadingIndicator);

    let page = 1;
    const imagesPerPage = 15;
    let loading = false;
    let allImagesLoaded = false;
    let totalImages = 0;
    let loadedImages = 0;

    // Function to create skeleton loading items
    function createSkeletonItems(count) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const item = document.createElement('div');
            item.className = 'gallery-item loading';
            fragment.appendChild(item);
        }
        return fragment;
    }

    // Function to load images
    async function loadImages() {
        if (loading || allImagesLoaded) return;
        loading = true;

        try {
            // Show skeleton loading
            const skeletonItems = createSkeletonItems(imagesPerPage);
            gallery.insertBefore(skeletonItems, loadingIndicator);

            const response = await fetch(`/api/photos?page=${page}&limit=${imagesPerPage}`);
            const data = await response.json();

            if (data.photos.length === 0) {
                allImagesLoaded = true;
                loadingIndicator.style.display = 'none';
                return;
            }

            totalImages += data.photos.length;
            const fragment = document.createDocumentFragment();

            // Remove skeleton items
            const skeletonItemsToRemove = gallery.querySelectorAll('.gallery-item.loading');
            skeletonItemsToRemove.forEach(item => item.remove());

            data.photos.forEach((photo, index) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const img = new Image();
                img.src = photo.url;
                img.alt = photo.title || 'Gallery Image';
                
                img.onload = () => {
                    loadedImages++;
                    item.classList.add('loaded');
                    updateLoadingProgress(loadedImages, totalImages);
                };

                img.onerror = () => {
                    console.error('Failed to load image:', photo.url);
                    item.classList.add('error');
                    loadedImages++;
                    updateLoadingProgress(loadedImages, totalImages);
                };

                item.appendChild(img);
                fragment.appendChild(item);
            });

            gallery.insertBefore(fragment, loadingIndicator);
            page++;

        } catch (error) {
            console.error('Error loading images:', error);
            loadingIndicator.innerHTML = `
                <div class="loading-text">Error loading images. Please try again.</div>
                <button class="retry-btn" onclick="loadImages()">Retry</button>
            `;
        } finally {
            loading = false;
        }
    }

    // Update loading progress
    function updateLoadingProgress(loaded, total) {
        const progressBar = loadingIndicator.querySelector('.loading-progress-bar');
        const progressText = loadingIndicator.querySelector('.loading-text');
        const progress = (loaded / total) * 100;
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Loading images... ${Math.round(progress)}%`;
        
        if (loaded === total) {
            setTimeout(() => {
                loadingIndicator.style.opacity = '0';
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                }, 500);
            }, 500);
        }
    }

    // Infinite scroll
    function handleScroll() {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 800 && !loading && !allImagesLoaded) {
            loadImages();
        }
    }

    // Initial load
    loadImages();

    // Event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
}); 