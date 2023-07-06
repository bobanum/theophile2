# Theophile

A templating module that transforms a web page into a (Powerpoint-like) presentation.

## Hooks

### `beforeFetch`
Just the raw HTML of the page's content, before any transformation.
- Time to fetch data, etc.

### `fetched`
Data is fetched, but not yet rendered. DOM is untouched.
- Time to add raw data to the content.

### `beforeMount`
Content is complete but not yet added. Raw data is added to the content. Nothing external will be added to the content.
- Time to add computed data to the content.
- Time to transform non-HTML elements into HTML elements. (e.g. markdown to HTML)

### `beforeCleanup`
Content is rendered, but not yet final.
- Time to clean remaining raw code.

### `cleanedup`
Page is rendered. All the raw HTML is there.
- Time to render final HTML.
- Time to transform to final structure.

### `mounted`
Page is final. DOM won't change anymore.
- Time to add listeners to the page.

### `afterMounted`
Final page is final. 
- Just in case you need to do something after the page is mounted.