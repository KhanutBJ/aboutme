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

// Scroll to the section if there's a hash in the URL on page load
function scrollToHashOnLoad() {
    if (window.location.hash) {
        setTimeout(() => {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // adjust to desired offset
                    behavior: 'smooth'
                });
            }
        }, 500); // Delay to ensure all elements are loaded
    }
}

// Intersection Observer for floating up elements
function setupIntersectionObserver() {
    const faders = document.querySelectorAll('.profile, .blog-entry, .project-card, .skills, .interests, .about-me, .additional-content, .contact-container, .quote-container, .bio-container, .roadmap');
    const appearOptions = {
        threshold: 0.3, // Trigger when 30% of the element is in view
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, self) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `floatUp 1s ease-out forwards`;
                entry.target.classList.add('observed');
                self.unobserve(entry.target); // Stop observing the current target
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader); // Start observing each fader element
    });
}

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

            data.forEach(blog => {
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

            if (hiddenBlogs.length > 0) {
                viewMoreBtn.style.display = 'block';
            } else {
                viewMoreBtn.style.display = 'none';
                viewAllBtn.style.display = 'none';
            }

            viewMoreBtn.addEventListener('click', () => {
                let revealedCount = 0;

                hiddenBlogs.forEach(blog => {
                    if (revealedCount < 3 && !blog.classList.contains('visible')) {
                        blog.classList.add('visible');
                        revealedCount++;
                    }
                });

                if (hiddenBlogs.every(blog => blog.classList.contains('visible'))) {
                    viewMoreBtn.style.display = 'none';
                    viewAllBtn.style.display = 'none';
                }

                collapseBtn.style.display = 'block';
            });

            viewAllBtn.addEventListener('click', () => {
                hiddenBlogs.forEach(blog => blog.classList.add('visible'));

                // After revealing all, check if any blog is not visible. If all are visible, hide the "View All" button.
                if (hiddenBlogs.every(blog => blog.classList.contains('visible'))) {
                    viewMoreBtn.style.display = 'none';
                    viewAllBtn.style.display = 'none';
                }

                collapseBtn.style.display = 'block';
            });

            collapseBtn.addEventListener('click', () => {
                hiddenBlogs.forEach(blog => blog.classList.remove('visible'));

                if (hiddenBlogs.length > 0) {
                    viewMoreBtn.style.display = 'block';
                    viewAllBtn.style.display = 'block'; // Show "View All" button again if there are hidden blogs
                }
                collapseBtn.style.display = 'none';
                window.scrollTo({
                    top: document.getElementById('blogs').offsetTop - 50,
                    behavior: 'smooth'
                });
            });
        })
        .catch(error => console.error('Error fetching blog data:', error));
}

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
            let hiddenProjects = [];

            data.forEach(project => { 
                if (project.hidden) return;

                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                if (visibleCount < 3) {
                    projectCard.classList.add('visible');
                    visibleCount++;
                    if (observerCallCount < 3) {
                        setupIntersectionObserver();
                        observerCallCount++;
                    } else {
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
                transitionDuration: '0.2s',
                horizontalOrder: true
            });

            // Layout Masonry after images have loaded
            imagesLoaded(projectGrid, () => {
                msnry.layout();
            });

            updateButtonVisibility();

            viewMoreBtn.addEventListener('click', () => {
                let newlyVisibleCount = 0;
                for (let project of hiddenProjects) {
                    if (!project.classList.contains('visible') && newlyVisibleCount < 3) {
                        project.classList.add('visible');
                        projectGrid.appendChild(project);
                        newlyVisibleCount++;
                    }
                }
            
                // Remove projects that are now visible from the hiddenProjects array
                hiddenProjects = hiddenProjects.filter(project => !project.classList.contains('visible'));
            
                // Append new items and re-layout Masonry
                imagesLoaded(projectGrid, () => {
                    msnry.layout();
                });
            
                updateButtonVisibility();
            });

            viewAllBtn.addEventListener('click', () => {
                hiddenProjects.forEach(project => {
                    project.classList.add('visible');
                });

                // Re-layout Masonry with all items visible
                imagesLoaded(projectGrid, () => {
                    msnry.layout();
                });

                updateButtonVisibility();
            });

            collapseBtn.addEventListener('click', () => {
                const visibleProjects = document.querySelectorAll('.project-card.visible');
                visibleProjects.forEach((project, index) => {
                    // Keep the first three projects visible
                    if (index > 2) {
                        project.classList.remove('visible');
                        hiddenProjects.push(project);
                    }
                });
            
                viewMoreBtn.style.display = 'block';
                viewAllBtn.style.display = 'block';
                collapseBtn.style.display = 'none';
            
                window.scrollTo({
                    top: document.getElementById('projects').offsetTop - 50,
                    behavior: 'smooth'
                });
            
                // Re-initialize Masonry layout
                imagesLoaded(projectGrid, () => {
                    msnry.layout();
                });
            });

            function updateButtonVisibility() {
                const totalVisible = document.querySelectorAll('.project-card.visible').length;
                if (totalVisible === data.length) {
                    viewMoreBtn.style.display = 'none';
                    viewAllBtn.style.display = 'none';
                } else {
                    viewMoreBtn.style.display = 'block';
                    viewAllBtn.style.display = 'block';
                }
                collapseBtn.style.display = 'block';
            }

        })
        .catch(error => console.error('Error fetching project data:', error));
}

function setupDarkModeToggle() {
    const bodyClassList = document.body.classList;
    const modeToggle = document.getElementById('mode-toggle');

    // Initialize mode based on the time of the day
    const now = new Date();
    const hour = now.getHours();
    const isNightTime = hour >= 19 || hour < 7;
    if (isNightTime) {
        bodyClassList.add('dark-mode');
    } else {
        bodyClassList.remove('dark-mode');
    }

    // Toggle dark mode manually
    modeToggle.addEventListener('click', () => {
        bodyClassList.toggle('dark-mode');
    });
}

function getBackground() {
    fetch('background.json')
        .then(response => response.json())
        .then(data => {
            const getContent = (id) => data.find(item => item.id === id).content;

            // Hero Section
            const heroContent = getContent('hero');
            document.querySelector('#hero-highlight').innerHTML = heroContent.title.replace(/\n/g, '<br>');
            document.querySelector('#hero-image').src = heroContent.image;
            document.querySelector('#hero-description').textContent = heroContent.description;
            document.querySelector('#hero-link').textContent = heroContent.linkText;

            // Profile Section
            const profileContent = getContent('profile');
            document.querySelector('.profile .top h1').textContent = profileContent.name;
            document.querySelector('.profile .details .title p').textContent = profileContent.title;
            document.querySelector('.profile .details .location p').textContent = profileContent.location;
            document.querySelector('#profile-image').src = profileContent.image;

            // Quote Section
            document.querySelector('.quote-container .quote-text').textContent = getContent('quote').text;
            document.querySelector('.quote-container .quote-author').textContent = getContent('quote').author;

            // Bio Section
            document.querySelector('.bio-container .bio p').innerHTML = getContent('bio');
            const topicsContainer = document.querySelector('.bio-container .topics .topic-tags');
            getContent('bio-topics').forEach(topic => {
                const span = document.createElement('span');
                span.className = 'topic-tag';
                span.textContent = topic;
                topicsContainer.appendChild(span);
            });

            // Skills Section
            const skillsContainer = document.querySelector('#skills');
            getContent('skills').forEach(skill => {
                const span = document.createElement('span');
                span.className = 'skill';
                span.textContent = skill;
                skillsContainer.appendChild(span);
            });

            // Research Interests
            const researchInterestsContainer = document.querySelector('#research-interests');
            getContent('research-interests').forEach(interest => {
                const span = document.createElement('span');
                span.className = 'interest';
                span.textContent = interest;
                researchInterestsContainer.appendChild(span);
            });

            // Medical Interests
            const medicalInterestsContainer = document.querySelector('#medical-interests');
            getContent('medical-interests').forEach(interest => {
                const span = document.createElement('span');
                span.className = 'interest';
                span.textContent = interest;
                medicalInterestsContainer.appendChild(span);
            });

            // Education Section
            const educationContainer = document.querySelector('.education .roadmap');
            getContent('education').forEach(edu => {
                const div = document.createElement('div');
                div.className = 'roadmap-item';
                div.innerHTML = `<p class="section-content">${edu.degree} - ${edu.institution} (${edu.period})</p>`;
                educationContainer.appendChild(div);
            });

            // Awards Section
            const awardsContainer = document.querySelector('.Awards .roadmap');
            getContent('awards').forEach(award => {
                const div = document.createElement('div');
                div.className = 'roadmap-item';
                div.innerHTML = `<p class="section-content">${award.title} - ${award.organization} (${award.year})</p>`;
                awardsContainer.appendChild(div);
            });

            // Certificates Section
            const certificatesContainer = document.querySelector('.certificate .roadmap');
            getContent('certificates').forEach(cert => {
                const div = document.createElement('div');
                div.className = 'roadmap-item';
                div.innerHTML = `<p class="section-content">${cert.title} - ${cert.organization} (${cert.year})</p>`;
                certificatesContainer.appendChild(div);
            });

            // code for resume builder from all these background

            // Contact Section
            const contactContainer = document.querySelector('.contact-container');
            getContent('contact').forEach(contact => {
                const a = document.createElement('a');
                a.className = 'contact';
                a.href = contact.url;
                a.innerHTML = `<span class="iconify" data-icon="${contact.icon}" style="font-size: 30px;"></span><p style="font-size: 16px;">${contact.type}</p>`;
                contactContainer.appendChild(a);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
};

document.addEventListener('DOMContentLoaded', () => {
    getBackground();
    scrollToHashOnLoad();
    setupSmoothScrolling();
    fetchAndDisplayBlogs();
    fetchAndDisplayProjects();
    setupDarkModeToggle();
});
