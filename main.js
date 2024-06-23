// Scroll smoothly to sections when clicking on navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            window.scrollTo({
                top: targetElement.offsetTop - 80, // adjust to desired offset
                behavior: 'smooth'
            });
        });
    });
}

// Intersection Observer for floating up elements
function setupIntersectionObserver() {
    const faders = document.querySelectorAll('.profile, .blog-entry, .project-card, .skills, .interests, .about-me, .additional-content, .contact-container, .quote-container, .bio-container, .roadmap');
    const appearOptions = {
        threshold: 0.3,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.style.animation = `floatUp 1s ease-out forwards`;
                entry.target.classList.add('observed');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });
}

// Fetch and display blog entries
function fetchAndDisplayBlogs() {
    fetch('blogs.json')
        .then(response => response.json())
        .then(data => {
            const blogContainer = document.getElementById('blog-entries');
            const viewMoreBtn = document.getElementById('view-more-btn');
            const viewAllBtn = document.getElementById('view-all-btn');
            const collapseBtn = document.getElementById('collapse-btn');
            let visibleCount = 0;
            const hiddenBlogs = [];

            data.forEach((blog, index) => {
                if (blog.hidden) return;

                const blogEntry = document.createElement('div');
                blogEntry.className = 'blog-entry';
                if (visibleCount < 3) {
                    blogEntry.classList.add('visible');
                    visibleCount++;
                } else {
                    hiddenBlogs.push(blogEntry);
                }
                blogEntry.innerHTML = `
                    <a href="blog.html?id=${blog.id}" class="blog-title">${blog.title}</a>
                    <p class="blog-date">${blog.date}</p>
                    <div class="blog-tags">${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
                    <p class="blog-description">${blog.description}</p>
                `;
                blogContainer.appendChild(blogEntry);
                
            });

            setupIntersectionObserver(); 

            // Display "View More" button only if there are more hidden blogs
            if (hiddenBlogs.length > 0) {
                viewMoreBtn.style.display = 'block';
            }

            viewMoreBtn.addEventListener('click', () => {
                let revealedCount = 0;

                hiddenBlogs.forEach(blog => {
                    if (revealedCount < 3 && !blog.classList.contains('visible')) {
                        blog.classList.add('visible');
                        revealedCount++;
                    }
                });

                if (revealedCount < 3) {
                    viewMoreBtn.style.display = 'none';
                }

                collapseBtn.style.display = 'block';
            });

            viewAllBtn.addEventListener('click', () => {
                hiddenBlogs.forEach(blog => {
                    blog.classList.add('visible');
                });

                viewMoreBtn.style.display = 'none';
                viewAllBtn.style.display = 'none';
                collapseBtn.style.display = 'block';
            });

            collapseBtn.addEventListener('click', () => {
                hiddenBlogs.forEach(blog => {
                    blog.classList.remove('visible');
                });

                viewMoreBtn.style.display = 'block';
                viewAllBtn.style.display = 'block';
                collapseBtn.style.display = 'none';
                window.scrollTo({
                    top: document.getElementById('blog').offsetTop - 50, 
                    behavior: 'smooth'
                });
            });
        })
        .catch(error => console.error('Error fetching blog data:', error));
}

// Fetch and display project entries
let observerCallCount = 0;
function fetchAndDisplayProjects() {
    fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            const projectGrid = document.getElementById('project-grid');
            const viewMoreBtn = document.getElementById('view-more-projects-btn');
            const viewAllBtn = document.getElementById('view-all-projects-btn');
            const collapseBtn = document.getElementById('collapse-projects-btn');
            let visibleCount = 0;
            const hiddenProjects = [];

            data.forEach((project, index) => {
                if (project.hidden) return;

                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                if (visibleCount < 3) {
                    projectCard.classList.add('visible');
                    visibleCount++;
                    if (observerCallCount < 3) {
                        console.log('true')
                        setupIntersectionObserver();
                        observerCallCount++;
                    }
                    else {
                        console.log('false')
                        observerCallCount = 0;
                    }
                    
                } else {
                    hiddenProjects.push(projectCard);
                }
                
                projectCard.innerHTML = `
                    <div class="project-type">${project.category}</div>
                    <img src="${project.image}" alt="Project Image" class="project-image">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-date">${project.date}</p>
                    <p class="project-info">${project.info}</p>
                    <a href="blog.html?id=${project.id}">Read more →</a>
                    <div class="project-tags">${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
                `;
                projectGrid.appendChild(projectCard);

            });
            

            // Initialize Masonry after all project cards are appended
            const msnry = new Masonry(projectGrid, {
                itemSelector: '.project-card',
                columnWidth: '.project-card',
                percentPosition: true,
                transitionDuration: '0.3s',
                horizontalOrder: true

            });

            // Layout Masonry after images have loaded
            imagesLoaded(projectGrid, () => {
                msnry.layout();
            });


            if (hiddenProjects.length > 0) {
                viewMoreBtn.style.display = 'block';
            }

            viewMoreBtn.addEventListener('click', () => {
                let revealedCount = 0;
                const fragment = document.createDocumentFragment();

                hiddenProjects.forEach(project => {
                    if (revealedCount < 3 && !project.classList.contains('visible')) {
                        project.classList.add('visible');
                        fragment.appendChild(project);
                        revealedCount++;
                    }
                });

                projectGrid.appendChild(fragment);

                // Append new items and re-layout Masonry
                imagesLoaded(projectGrid, () => {
                    msnry.appended(fragment.children);
                    msnry.layout();
                });
                

                if (revealedCount < 3) {
                    viewMoreBtn.style.display = 'none';
                }

                collapseBtn.style.display = 'block';
            });

            viewAllBtn.addEventListener('click', () => {
                const fragment = document.createDocumentFragment();

                hiddenProjects.forEach(project => {
                    project.classList.add('visible');
                    fragment.appendChild(project);
                });

                projectGrid.appendChild(fragment);

                // Append new items and re-layout Masonry
                imagesLoaded(projectGrid, () => {
                    msnry.appended(fragment.children);
                    msnry.layout();
                });

                viewMoreBtn.style.display = 'none';
                viewAllBtn.style.display = 'none';
                collapseBtn.style.display = 'block';
            });

            collapseBtn.addEventListener('click', () => {
                hiddenProjects.forEach(project => {
                    project.classList.remove('visible');
                });
    
                viewMoreBtn.style.display = 'block';
                viewAllBtn.style.display = 'block';
                collapseBtn.style.display = 'none';
                window.scrollTo({
                    top: document.getElementById('project').offsetTop - 50, 
                    behavior: 'smooth'
                });
                
                // Initialize Masonry after all project cards are appended
                const msnry = new Masonry(projectGrid, {
                    itemSelector: '.project-card',
                    columnWidth: '.project-card',
                    percentPosition: true,
                    transitionDuration: '0.3s'
                });

            });

        })
        .catch(error => console.error('Error fetching project data:', error));
}


function setupDarkModeToggle() {
    const bodyClassList = document.body.classList;
    const modeToggle = document.getElementById('mode-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Initialize mode based on the time of the day
    const now = new Date();
    const hour = now.getHours();
    const isNightTime = hour >= 19 || hour < 7;
    if (isNightTime) {
        bodyClassList.add('dark-mode');
    } else {
        bodyClassList.remove('dark-mode');
    }
    toggleIcons(bodyClassList.contains('dark-mode'));

    // Toggle dark mode manually
    modeToggle.addEventListener('click', () => {
        bodyClassList.toggle('dark-mode');
        toggleIcons(bodyClassList.contains('dark-mode'));
    });

    // Helper function to toggle icons based on the mode
    function toggleIcons(isDarkMode) {
        if (isDarkMode) {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupSmoothScrolling();
    fetchAndDisplayBlogs();
    fetchAndDisplayProjects();
    setupDarkModeToggle();
});
