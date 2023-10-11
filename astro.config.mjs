import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import NetlifyCMS from "astro-decap-cms";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://designsystems.media",
  integrations: [
    mdx(),
    sitemap(),
    pagefind(),
    NetlifyCMS({
      logo_url: "https://designsystems.media/favicon.svg",
      config: {
        backend: {
          name: "git-gateway",
          branch: "main",
        },
        collections: [
          // Content collections
          {
            name: "media",
            label: "Media",
            folder: "src/content/media",
            extension: "mdx",
            format: "frontmatter",
            nested: { depth: 100 },
            path: "{{title}}/{{title}}",
            media_folder: "",
            public_folder: "",
            identifier_field: "title",
            create: true,
            delete: false,
            fields: [
              { name: "title", widget: "string", label: "Title" },
              {
                name: "tags",
                widget: "list",
                label: "Tags",
                default: ["Unsorted"],
              },
              {
                name: "draft",
                widget: "boolean",
                label: "Draft",
                default: true,
              },
              {
                name: "categories",
                widget: "list",
                label: "Categories",
                default: ["Video"],
              },
              {
                name: "speakers",
                widget: "list",
                label: "Speakers",
                default: ["Unsorted"],
              },
              { name: "videoUrl", widget: "string", label: "Video URL" },
              {
                name: "body",
                widget: "markdown",
                label: "Body",
              },
              {
                name: "duration",
                widget: "string",
                label: "Duration",
                default: ["00:00:00"],
              },
              { name: "publishedAt", widget: "datetime", label: "Published" },
              {
                name: "localImages",
                widget: "boolean",
                label: "Local images",
                default: false,
                required: false,
              },
              {
                name: "image",
                widget: "image",
                label: "Image",
                required: false,
                media_library: {
                  config: {
                    multiple: false,
                  },
                },
              },
              {
                name: "poster",
                widget: "image",
                required: false,
                label: "Poster",
                media_library: {
                  config: {
                    multiple: false,
                  },
                },
              },
            ],
          },
        ],
      },
    }),
  ],
});
