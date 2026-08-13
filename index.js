"use strict";

/* =========================================
   DOM ELEMENTS
========================================= */

const newsDetails = document.getElementById("newsdetails");
const newsType = document.getElementById("newsType");

const searchForm = document.getElementById("searchForm");
const newsQuery = document.getElementById("newsQuery");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const retryButton = document.getElementById("retryButton");

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

const navLinks = document.querySelectorAll(".nav-link[data-category]");


/* =========================================
   CONFIGURATION
========================================= */

/*
    IMPORTANT:

    Do NOT put your real NewsAPI key in a public
    production JavaScript file.

    For development you can temporarily use:

    const API_KEY = "YOUR_API_KEY";

    But for production, use a backend/serverless
    proxy and keep the key on the server.
*/

const API_KEY = "3ff7ad1765374392a93cb7d68aedca4b";

const API_BASE =
    "https://newsapi.org/v2";


/* =========================================
   STATE
========================================= */

let currentCategory = "headlines";

let lastRequest = {
    type: "category",
    value: "headlines"
};


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadHeadlines();

});


/* =========================================
   MOBILE MENU
========================================= */

menuToggle.addEventListener("click", () => {

    const isOpen =
        mainNav.classList.toggle("open");

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

});


/* =========================================
   CLOSE MOBILE MENU
========================================= */

navLinks.forEach((link) => {

    link.addEventListener("click", () => {

        mainNav.classList.remove("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    });

});


/* =========================================
   CATEGORY NAVIGATION
========================================= */

navLinks.forEach((link) => {

    link.addEventListener("click", () => {

        const category =
            link.dataset.category;

        if (!category) {
            return;
        }

        setActiveCategory(link);

        if (category === "headlines") {

            loadHeadlines();

        } else {

            loadCategory(category);

        }

    });

});


/* =========================================
   SEARCH
========================================= */

searchForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const query =
            newsQuery.value.trim();

        if (!query) {

            newsQuery.focus();

            return;
        }

        searchNews(query);

    }
);


/* =========================================
   RETRY
========================================= */

retryButton.addEventListener(
    "click",
    () => {

        if (lastRequest.type === "search") {

            searchNews(
                lastRequest.value,
                false
            );

            return;
        }

        if (
            lastRequest.type === "category" &&
            lastRequest.value === "headlines"
        ) {

            loadHeadlines(false);

            return;
        }

        loadCategory(
            lastRequest.value,
            false
        );

    }
);


/* =========================================
   LOAD HEADLINES
========================================= */

async function loadHeadlines(
    saveRequest = true
) {

    newsType.textContent =
        "Headlines";

    if (saveRequest) {

        lastRequest = {
            type: "category",
            value: "headlines"
        };

    }

    showLoading();

    try {

        const url =
            `${API_BASE}/top-headlines` +
            `?country=ng` +
            `&apiKey=${API_KEY}`;

        const data =
            await fetchNews(url);

        displayNews(data.articles);

    } catch (error) {

        handleError(error);

    }

}


/* =========================================
   LOAD CATEGORY
========================================= */

async function loadCategory(
    category,
    saveRequest = true
) {

    const categoryName =
        capitalize(category);

    newsType.textContent =
        categoryName;

    if (saveRequest) {

        lastRequest = {
            type: "category",
            value: category
        };

    }

    showLoading();

    try {

        const url =
            `${API_BASE}/top-headlines` +
            `?country=ng` +
            `&category=${encodeURIComponent(category)}` +
            `&pageSize=20` +
            `&apiKey=${API_KEY}`;

        const data =
            await fetchNews(url);

        displayNews(data.articles);

    } catch (error) {

        handleError(error);

    }

}


/* =========================================
   SEARCH NEWS
========================================= */

async function searchNews(
    query,
    saveRequest = true
) {

    newsType.textContent =
        `Search: ${query}`;

    if (saveRequest) {

        lastRequest = {
            type: "search",
            value: query
        };

    }

    showLoading();

    try {

        const url =
            `${API_BASE}/everything` +
            `?q=${encodeURIComponent(query)}` +
            `&sortBy=publishedAt` +
            `&language=en` +
            `&pageSize=20` +
            `&apiKey=${API_KEY}`;

        const data =
            await fetchNews(url);

        displayNews(data.articles);

    } catch (error) {

        handleError(error);

    }

}


/* =========================================
   FETCH NEWS
========================================= */

async function fetchNews(url) {

    const response =
        await fetch(url);

    if (!response.ok) {

        let message =
            `Request failed: ${response.status}`;

        try {

            const errorData =
                await response.json();

            if (errorData.message) {

                message =
                    errorData.message;

            }

        } catch {
            // Ignore JSON parsing errors
        }

        throw new Error(message);
    }

    return response.json();

}


/* =========================================
   DISPLAY NEWS
========================================= */

function displayNews(articles) {

    hideLoading();

    newsDetails.innerHTML = "";

    if (
        !articles ||
        articles.length === 0
    ) {

        newsDetails.innerHTML = `
            <div class="empty-state">
                <h2>No news found</h2>
                <p>
                    There are no articles available for
                    this section right now.
                </p>
            </div>
        `;

        return;
    }


    articles.forEach((article) => {

        const card =
            createNewsCard(article);

        newsDetails.appendChild(card);

    });

}


/* =========================================
   CREATE NEWS CARD
========================================= */

function createNewsCard(article) {

    const card =
        document.createElement("article");

    card.className =
        "news-card";


    /* Image */

    const imageWrapper =
        document.createElement("div");

    imageWrapper.className =
        "news-image-wrapper";


    const image =
        document.createElement("img");

    image.className =
        "news-image";

    image.alt =
        article.title || "News image";

    image.loading =
        "lazy";

    image.src =
        article.urlToImage ||
        "./images/news-placeholder.jpg";


    image.onerror = () => {

        image.src =
            "./images/news-placeholder.jpg";

    };


    /* Category */

    const category =
        document.createElement("span");

    category.className =
        "news-category";

    category.textContent =
        article.source?.name ||
        "News";


    imageWrapper.appendChild(image);

    imageWrapper.appendChild(category);


    /* Content */

    const content =
        document.createElement("div");

    content.className =
        "news-content";


    /* Date */

    const date =
        document.createElement("div");

    date.className =
        "news-date";

    date.textContent =
        formatDate(article.publishedAt);


    /* Title */

    const title =
        document.createElement("h2");

    title.className =
        "news-title";

    title.textContent =
        article.title ||
        "Untitled article";


    /* Description */

    const description =
        document.createElement("p");

    description.className =
        "news-description";

    description.textContent =
        article.description ||
        "No description is available for this article.";


    /* Link */

    const link =
        document.createElement("a");

    link.className =
        "read-more";

    link.href =
        article.url || "#";

    link.target =
        "_blank";

    link.rel =
        "noopener noreferrer";

    link.innerHTML =
        `Read more <span>→</span>`;


    content.appendChild(date);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(link);


    card.appendChild(imageWrapper);
    card.appendChild(content);


    return card;

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString) {

        return "Date unavailable";

    }

    const date =
        new Date(dateString);

    if (Number.isNaN(date.getTime())) {

        return "Date unavailable";

    }

    return new Intl.DateTimeFormat(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}


/* =========================================
   ACTIVE CATEGORY
========================================= */

function setActiveCategory(activeLink) {

    navLinks.forEach((link) => {

        link.classList.remove("active");

    });

    activeLink.classList.add("active");

}


/* =========================================
   LOADING
========================================= */

function showLoading() {

    loading.hidden = false;

    errorMessage.hidden = true;

    newsDetails.innerHTML = "";

}


/* =========================================
   HIDE LOADING
========================================= */

function hideLoading() {

    loading.hidden = true;

}


/* =========================================
   ERROR
========================================= */

function handleError(error) {

    console.error(
        "News API error:",
        error
    );

    loading.hidden = true;

    newsDetails.innerHTML = "";

    errorMessage.hidden = false;

}


/* =========================================
   CAPITALIZE
========================================= */

function capitalize(value) {

    return value
        .charAt(0)
        .toUpperCase() +
        value.slice(1);

}