/**
 * @type {import("lint-staged").Config}
 * @see {@link https://www.npmjs.com/package/lint-staged | lint-staged}
 */
const config = {
    /* incremental formatting */
    // REF: https://github.com/sudo-suhas/lint-staged-django-react-demo
    // "*": "cspell lint --no-must-find-files",
    "*.{js,jsx,ts,tsx,vue,svelte,css,less,html,xml,md,json,toml,yaml}": "eslint --fix",
};

export default config;
