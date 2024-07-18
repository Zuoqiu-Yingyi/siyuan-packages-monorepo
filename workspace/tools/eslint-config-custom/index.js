import antfu, {
    GLOB_JS,
    GLOB_JSX,
} from "@antfu/eslint-config";
import tsdoc from "eslint-plugin-tsdoc";
// @ts-ignore
import turbo from "eslint-plugin-turbo";

/**
 * @type {import("@antfu/eslint-config").TypedFlatConfigItem['rules']}
 */
const rules = {
    "accessor-pairs": ["off"],
    "sort-imports": ["off"],
    "import/order": ["off"],
    "ts/no-empty-object-type": [
        "warn",
        {
            allowInterfaces: "always",
        },
    ],
    "ts/no-use-before-define": [
        "error",
        {
            allowNamedExports: true,
        },
    ],
    "perfectionist/sort-array-includes": [
        "warn",
        {
            "spread-last": true,
        },
    ],
    "perfectionist/sort-exports": [
        "warn",
        {},
    ],
    "perfectionist/sort-imports": [
        "warn",
        {
            "groups": [
                "side-effect-style", // import "style.css";
                "side-effect", // import "module";

                [
                    "$node", // import path from "node:path";
                    "builtin", // import path from "path";
                ],
                "external", // import axios from "axios";
                [
                    "$repo", // import module from "@repo/module";
                    "$workspace", // import module from "@workspace/module";
                ],
                "$base", // import module from "~/module";
                "internal", // import module from "@/module";
                [
                    "$vue", // import Component from "Component.vue";
                    "$svelte", // import Component from "Component.svelte";
                ],
                [
                    "parent", // import module from "../module";
                    "sibling", // import module from "./module";
                    "index", // import module from ".";
                ],
                "unknown",

                [
                    "$node-type", // import type path from "node:path";
                    "builtin-type", // import type path from "path";
                ],
                "external-type", // import type axios from "axios";
                [
                    "$repo-type", // import type module from "@repo/module";
                    "$workspace-type", // import type module from "@workspace/module";
                ],
                "$base-type", // import type module from "~/module";
                "internal-type", // import type module from "@/module";
                [
                    "$vue-type", // import type Component from "Component.vue";
                    "$svelte-type", // import type Component from "Component.svelte";
                ],
                [
                    "parent-type", // import type module from "../module";
                    "sibling-type", // import type module from "./module";
                    "index-type", // import type module from ".";
                ],
                "type",

                "style", // import styles from "./index.module.css";
                "object", // import log = console.log;
            ],
            "internal-pattern": [
                "@/**",
            ],
            "custom-groups": {
                value: {
                    $node: "node:**",
                    $repo: "@repo/**",
                    $workspace: "@workspace/**",
                    $base: "~/**",
                    $vue: "**.vue",
                    $svelte: "**.svelte",
                },
                type: {
                    "$node-type": "node:**",
                    "$repo-type": "@repo/**",
                    "$workspace-type": "@workspace/**",
                    "$base-type": "~/**",
                    "$vue-type": "**.vue",
                    "$svelte-type": "**.svelte",
                },
            },
        },
    ],
    "perfectionist/sort-named-exports": [
        "warn",
        {
            "group-kind": "values-first",
        },
    ],
    "perfectionist/sort-named-imports": [
        "warn",
        {
            "group-kind": "values-first",
            "ignore-alias": false,
        },
    ],
    "perfectionist/sort-union-types": [
        "warn",
        {
            "nullable-last": true,
        },
    ],
};

// REF: https://www.npmjs.com/package/@antfu/eslint-config
export default antfu({
    stylistic: {
        indent: 4,
        quotes: "double",
        semi: true,
        overrides: {
            "style/arrow-parens": [
                "warn",
                "always",
            ],
            "style/no-trailing-spaces": [
                "warn",
                {
                    ignoreComments: true,
                },
            ],
            "style/linebreak-style": [
                "error",
                "unix",
            ],
        },
    },
    formatters: {
        css: "prettier",
        html: "prettier",
        markdown: "dprint",
        graphql: "prettier",
        prettierOptions: {
            tabWidth: 4,
            printWidth: Infinity,
            trailingComma: "all",
            bracketSameLine: false,
            singleAttributePerLine: true,
        },
    },
    yaml: {
        overrides: {
            "yaml/indent": [
                "error",
                2,
            ],
        },
    },
    jsonc: {
        overrides: {
            "jsonc/comma-dangle": [
                "warn",
                "only-multiline",
            ],
        },
    },
    typescript: {
        overrides: {
            ...rules,
        },
    },
    vue: {
        overrides: {
            ...rules,
            "vue/attributes-order": [
                "warn",
                {
                    order: [
                        "DEFINITION", // `is`, `v-is`
                        "LIST_RENDERING", // `v-for item in items`
                        "CONDITIONALS", // `v-if`, `v-else-if`, `v-else`, `v-show`, `v-cloak`
                        "RENDER_MODIFIERS", // `v-once`, `v-pre`
                        "GLOBAL", // `id`
                        "UNIQUE", // `ref`, `key`
                        "SLOT", // `v-slot`, `slot`.
                        "TWO_WAY_BINDING", // `v-model`
                        "OTHER_DIRECTIVES", // `v-custom-directive`
                        // "OTHER_ATTR", // alias for `["ATTR_DYNAMIC", "ATTR_STATIC", "ATTR_SHORTHAND_BOOL"]`
                        "ATTR_DYNAMIC", // `v-bind:prop="foo"`, `:prop="foo"`
                        "ATTR_STATIC", // `prop="foo"`, `custom-prop="foo"`
                        "ATTR_SHORTHAND_BOOL", // `boolean-prop`
                        "EVENTS", // `@click="functionCall"`, `v-on="event"`
                        "CONTENT", // `v-text`, `v-html`
                    ],
                },
            ],
            "vue/max-attributes-per-line": [
                "warn",
                {
                    singleline: {
                        max: 1,
                    },
                    multiline: {
                        max: 1,
                    },
                },
            ],
        },
    },
    // @ts-ignore
    svelte: {
        overrides: {
            ...rules,
            "svelte/sort-attributes": [
                "warn",
                {
                    order: [
                        "this", // `this` property.
                        "bind:this", // `bind:this` directive.
                        "id", // `id` attribute.
                        "name", // `name` attribute.
                        "slot", // `slot` attribute.
                        {
                            match: "/^--/u",
                            sort: "alphabetical",
                        }, // `--style-props` (Alphabetical order within the same group.)
                        ["style", "/^style:/u"], // `style` attribute, and `style:` directives.
                        "class", // `class` attribute.
                        {
                            match: "/^class:/u",
                            sort: "alphabetical",
                        }, // `class:` directives. (Alphabetical order within the same group.)
                        {
                            match: "/^data-/u",
                            sort: "alphabetical",
                        }, // `data-*` dataset attributes. (Alphabetical order within the same group.)
                        {
                            match: [
                                "!/:/u",
                                "!/^(?:this|id|name|style|class)$/u",
                                "!/^--/u",
                            ],
                            sort: "alphabetical",
                        }, // other attributes. (Alphabetical order within the same group.)
                        [
                            "/^bind:/u",
                            "!bind:this",
                            "/^on:/u",
                        ], // `bind:` directives (other then `bind:this`), and `on:` directives.
                        {
                            match: "/^use:/u",
                            sort: "alphabetical",
                        }, // `use:` directives. (Alphabetical order within the same group.)
                        {
                            match: "/^transition:/u",
                            sort: "alphabetical",
                        }, // `transition:` directive.
                        {
                            match: "/^in:/u",
                            sort: "alphabetical",
                        }, // `in:` directive.
                        {
                            match: "/^out:/u",
                            sort: "alphabetical",
                        }, // `out:` directive.
                        {
                            match: "/^animate:/u",
                            sort: "alphabetical",
                        }, // `animate:` directive.
                        {
                            match: "/^let:/u",
                            sort: "alphabetical",
                        }, // `let:` directives. (Alphabetical order within the same group.)
                    ],
                },
            ],
        },
    },
    ignores: [
        "./dist",
        "./temp",
    ],
}, {
    plugins: {
        tsdoc,
    },
    rules: {
        "tsdoc/syntax": "warn",
    },
    ignores: [
        GLOB_JS,
        GLOB_JSX,
    ],
}, {
    plugins: {
        turbo,
    },
});
