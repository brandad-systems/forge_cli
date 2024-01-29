import { requestConfluence } from "@forge/bridge";

import {spacesCache, navStack, baseUrl} from './storage';
const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/);

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

export async function getBaseUrl(){
    let res = await requestConfluence(`/wiki/rest/api/settings/systemInfo`,{
        headers: {
            'Accept': 'application/json'
        }
    });
    const data = await res.json();
    let baseUrl = data.baseUrl;
    //remove the '/wiki' path, or using the given url would search for instanceUrl/wiki/wiki/xyz
    let trimmedBaseUrl = baseUrl.substring(0, baseUrl.length - 5);

    return trimmedBaseUrl;
}


export const fetchBlogSpace = async (spaceId) => {
    if (spacesCache[spaceId]) {
        return spacesCache[spaceId];

    }

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
    if (data.results.length != 1) {
        return undefined;

    }

    const uuidOrUrl = JSON.parse(data.results[0].value).id;

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

    return baseUrl + '/wiki' + data.results.find(x => x.fileId == fileId).downloadLink;

};
