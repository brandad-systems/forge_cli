import { requestConfluence } from "@forge/bridge";

import { spacesCache, navStack } from './storage';

export const fetchBlogPosts = async (nextLink, back = false) => {

    let link;
    if (navStack.length > 1 &&  back) {
        link = navStack[navStack.length - 2];
        navStack = navStack.slice(0, -1);
    }
    else if (nextLink) {
        navStack.push(nextLink + '&sort=-created-date');
        link = navStack[navStack.length - 1];
    }

    const res = await
        requestConfluence(link ?? `/wiki/api/v2/blogposts?sort=-created-date&limit=9`, {
            headers: {
                'Accept': 'application/json'
            }
        });

    const data = await res.json();
    return data;
};

export const fetchBlogSpace = async (spaceId) => {

    if (spacesCache[spaceId])
        return spacesCache[spaceId];

    const res = await
        requestConfluence(`/wiki/api/v2/spaces/${spaceId}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

    const data = await res.json();

    spacesCache[spaceId] = data;

    return data;
};

export const fetchBlogImage = async (blogId) => {
    const res = await
        requestConfluence(`/wiki/api/v2/blogposts/${blogId}/properties?key=cover-picture-id-published`, {
            headers: {
                'Accept': 'application/json'
            }
        });

    const data = await res.json();

    if (data.results.length != 1)
        return undefined;

    const uuidOrUrl = JSON.parse(data.results[0].value).id;

    const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/);

    if (regex.test(uuidOrUrl))
        return fetchBlogImageInternalId(blogId, uuidOrUrl);

    return uuidOrUrl;
};

export const fetchBlogImageInternalId = async (blogId, fileId) => {
    const res = await requestConfluence(`/wiki/api/v2/blogposts/${blogId}/attachments`, {
        headers: {
            'Accept': 'application/json'
        }
    });

    const data = await res.json();

    return 'https://brandad-wiki.atlassian.net/wiki' + data.results.find(x => x.fileId == fileId).downloadLink;

};
