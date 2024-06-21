document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    console.log(blogId)
    if (!blogId) {
        console.error('No blog ID specified in the URL.');
        return;
    }

    fetch('blogs.json')
        .then(response => response.json())
        .then(data => {
            console.log("Data fetched:", data); // Log fetched data

            const blog = data.find(blog => blog.id == blogId); // Adjust condition as needed
            if (!blog) {
                console.error('No blog found with the specified ID.');
                return;
            }
            else {
                console.log('blog found');
            }

            document.getElementById('blog-date').innerText = blog.date;
            document.querySelector('.post-category').innerText = blog.category;
            document.getElementById('blog-title').innerText = blog.title; // Set blog title

            const tagsContainer = document.getElementById('blog-tags');
            blog.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'topic';
                span.innerText = tag;
                tagsContainer.appendChild(span);
            });

            const headerContainer = document.getElementById('post-header');
            const contentContainer = document.getElementById('content');

            blog.content.forEach(item => {
                console.log("Processing item:", item); // Log each content item
                if (item.type === 'text') {
                    const p = document.createElement('p');
                    p.innerHTML = item.value;
                    if (item.position === 'header') {
                        headerContainer.appendChild(p);
                    } else {
                        contentContainer.appendChild(p);
                    }
                } else if (item.type === 'image') {
                    const img = document.createElement('img');
                    img.src = item.src;
                    img.alt = item.alt;
                    img.className = 'post-image';
                    if (item.position === 'header') {
                        headerContainer.appendChild(img);
                    } else {
                        contentContainer.appendChild(img);
                    }
                } else if (item.type === 'video') {
                    const div = document.createElement('div');
                    div.className = 'video-placeholder';
                    div.innerHTML = `<iframe width="560" height="315" src="${item.src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                    if (item.position === 'header') {
                        headerContainer.appendChild(div);
                    } else {
                        contentContainer.appendChild(div);
                    }
                }
            });

            const textContent = blog.content.filter(item => item.type === 'text').map(item => item.value).join(' ');
            const readingTime = calculateReadingTime(textContent);
            document.querySelector('.post-read-time').innerText = `⏱︎ ${readingTime} minute read`;
        })
        .catch(error => console.error('Error fetching blog data:', error));

    function calculateReadingTime() {
        const content = document.getElementById('content').innerText;
        const words = content.split(/\s+/).length;
        const wordsPerMinute = 200;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    }

    document.getElementById('mode-toggle').addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        const sunIcon = this.querySelector('.sun-icon');
        const moonIcon = this.querySelector('.moon-icon');
        if (document.body.classList.contains('dark-mode')) {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    });

});