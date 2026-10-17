// Cache tags are plain strings. Keeping them in one file means the code that caches data
// and the code that invalidates it can never drift apart because of a typo.
export const QUOTE_TAG = "quote-of-the-moment";
