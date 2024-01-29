import React, { useEffect, useState } from 'react';

import {fetchBlogPosts, fetchBlogSpace, fetchBlogImage, getBaseUrl} from './api-service';
import {spacesCache, navStack, baseUrl} from './storage';
import { router , view} from '@forge/bridge';

const loadBlog = async (nextLink, back = false) => {
    const fetchedBlogs = await fetchBlogPosts(nextLink, back);
    if (fetchedBlogs.results.length > 0) {
        for (let i = 0; i < fetchedBlogs.results.length; i++) {
            await fetchBlogSpace(fetchedBlogs.results[i].spaceId);
            fetchedBlogs.results[i].__image = await fetchBlogImage(fetchedBlogs.results[i].id);
        }
    }

    return fetchedBlogs;
};
const renderBlogPostElements = (blogs) => {
    const blogPosts = blogs?.results ?? [];
    return blogPosts.map((post, index) => (
        <button className="blog-link" onClick={() => { router.navigate('/wiki' + post._links.webui); }}>
            <div key={index} className="flex-item">
                <img className="blog-image" alt="Bild" src={post.__image} />
                <div className="overlay">
                    <div className="blog-details">
                        <span className="blog-title">{post.title}</span>
                        <span>{new Date(post.createdAt)?.toLocaleString('de-DE') ?? 'undefined'}</span>
                        <span className="blog-space-name">{spacesCache[post.spaceId]?.name ?? 'undefined'}</span>
                    </div>
                </div>
            </div>
        </button>
    ));
};

const renderPaginationButtons = (blogs, setBlogs) => {
    var paginationButtons = [];

    paginationButtons.push(
        <button disabled={navStack.length <= 1} onClick={async () => { setBlogs(await loadBlog(undefined, true)); }}>Zurück</button>
    );
    paginationButtons.push(
        <button disabled={!blogs._links?.next} onClick={async () => { setBlogs(await loadBlog(blogs._links.next, false)); }}>Nächste</button>
    );

    return paginationButtons;

}

function App() {
    const [blogs, setBlogs] = useState([]);

    useEffect(async () => {
        await view.theme.enable();
        baseUrl = await getBaseUrl();
        setBlogs(await loadBlog(undefined));
    }, []);

    return (
        <div>
            <div class="grid-container">
                {renderBlogPostElements(blogs)}
            </div>
            <div class="button-container">
                {renderPaginationButtons(blogs ?? [], setBlogs)}
            </div>
        </div>
    );
}

export default App;
