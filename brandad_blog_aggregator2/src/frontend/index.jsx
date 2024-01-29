import React, { useEffect, useState } from 'react';
import ForgeReconciler, {Inline, Stack, Text, Image, Link} from '@forge/react';
import {fetchBlogImage, fetchBlogPosts, fetchBlogSpace} from "./api-service";
import { spacesCache, navStack } from './storage';
const alignmentArr = ["start", "center", "end"];

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

const renderRow = (blogPosts) => {
  let blogPostElements = [];
  for (let i = 0; i < blogPosts.length; i++) {
    let post = blogPosts[i];
    blogPostElements.push(
        <Stack spread="space-between" alignBlock="center" space="space.300">
          <Text>{post.title.slice(0,50)}</Text>
          <Inline space="space.100">
            <Stack space="space.200">
              <Image size="small" alt="Bild" src={post.__image}/>
              <Text>{new Date(post.createdAt)?.toLocaleString('de-DE') ?? 'undefined'}</Text>
              <Text>{spacesCache[post.spaceId]?.name ?? 'undefined'}</Text>
              <Link href={"/wiki" + post._links.webui} openNewTab={true}>
                Gehe zum Blogpost von {spacesCache[post.spaceId]?.name ?? 'undefined'}
              </Link>
            </Stack>
          </Inline>
        </Stack>
    );
   }
   return blogPostElements;
  }

const renderBlogPostElements = (blogPosts) => {
  let blogPostElements = [];
  for (let i = 0; i < blogPosts.length; i+=3) {
    let post = blogPosts[i];
    blogPostElements.push(
        <Inline space="space.1000" spread="space-between">
            {renderRow(blogPosts.slice(i, i+3))}
          </Inline>
        );
  }
  return blogPostElements;
};


const App = () => {
  const [blogs, setBlogs] = useState(undefined);

  useEffect(async () => {
    setBlogs(await loadBlog(undefined));
    }, []);

  return (
    <>
    <Text>
        Number of blogposts in this confluence instance: {blogs?.results?.length}
    </Text>
      {renderBlogPostElements(blogs?.results ??[])}
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
