import type { BookmarkNode } from "../../types";

export const sampleTree: BookmarkNode[] = [
  {
    id: "0",
    title: "",
    children: [
      {
        id: "1",
        title: "Bookmarks Bar",
        parentId: "0",
        children: [
          {
            id: "10",
            title: "Google",
            url: "https://www.google.com",
            parentId: "1",
          },
          {
            id: "11",
            title: "GitHub",
            url: "https://github.com",
            parentId: "1",
          },
          {
            id: "12",
            title: "Dev",
            parentId: "1",
            children: [
              {
                id: "120",
                title: "MDN",
                url: "https://developer.mozilla.org",
                parentId: "12",
              },
              {
                id: "121",
                title: "Stack Overflow",
                url: "https://stackoverflow.com",
                parentId: "12",
              },
              {
                id: "13",
                title: "Tools",
                parentId: "12",
                children: [
                  {
                    id: "130",
                    title: "VSCode",
                    url: "https://code.visualstudio.com",
                    parentId: "13",
                  },
                ],
              },
            ],
          },
          {
            id: "14",
            title: "Empty Folder",
            parentId: "1",
            children: [],
          },
        ],
      },
      {
        id: "2",
        title: "Other Bookmarks",
        parentId: "0",
        children: [
          {
            id: "20",
            title: "Twitter",
            url: "https://twitter.com",
            parentId: "2",
          },
        ],
      },
    ],
  },
];

export const emptyTree: BookmarkNode[] = [];

export const duplicateTree: BookmarkNode[] = [
  {
    id: "0",
    title: "",
    children: [
      {
        id: "1",
        title: "Bookmarks Bar",
        parentId: "0",
        children: [
          {
            id: "10",
            title: "Google",
            url: "https://www.google.com/",
            parentId: "1",
          },
          {
            id: "11",
            title: "Google Again",
            url: "https://www.google.com/?utm_source=ext",
            parentId: "1",
          },
          {
            id: "12",
            title: "Unique",
            url: "https://unique.com",
            parentId: "1",
          },
        ],
      },
    ],
  },
];
