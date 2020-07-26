---- /pub-editor-help ----
name: pub Editor
doclayout: pub-editor-doclayout
nopublish: 1


## Editing pages with pub server

- **try it out!**  -- you can [edit this page](/pub/editor-help).

- Click on the (E) button (ony visible for Editors) at the top right on the staging server, to open any page for editing in Composer.

- Once open, the (E) changes to an (C) which closes the Composer and returns to normal staging website navigation.

- In composer mode, there are two panes.  
  The markdown editor on the left  
  And the preview pane on the right

- You can drag the little round dragger at top of the line separating the panes left and right. Your settings will be remembered across sessions.

- The preview pane can be used to navigate the website, select other pages for editing, and display, in real-time, any changes you make in the editor on the left.

- The website in the preview pane should look and behave just like the normal (staging) website. Click on links to navigate, and even use your browser's back button. The only exceptions are pages which require information from the server e.g. the thank-you pages after submitting a registration or an info request.

- The composer can also be opened by prepending `pub/` to the beginning of the path in the url. E.g. to open this page in composer, go to [/pub/editor-help](/pub/editor-help)

- sometimes if the network is slow, the composer won't work the first time -- navigating to another page by clicking somewhere in the preview should fix it.

## Modifying pages

- click on the editor button (E) at the top right, and wait a second or two for the markdown to appear in the left pane.

- the header section at the top of the markdown in the left pane contains "meta" information like (most importantly) the `page:` which is the url path to the page, and the `template:` which defines the type of page.

- below the header section is the "main" markdown content for the page.

- edit away..., You should see your changes immediately reflected in the preview pane on the right.

- All changes are saved automatically to the server (no need to click on any save button) but nothing is published to the www website. 

- Click on the close button (C) at the top right, to close the composer, and see the change on the staging site.

## Committing changes

- At any time you can click on the ✓ (check symbol) at the top of the left pane.

- you should see a list of all the updated pages or fragments which have not yet been committed.

- Hovering over any one of the updates in the list should show you a bit of what changed (in case you forgot).

- Clicking on one of the updates in the list will present a confirmation prompt. Click on OK to commit or Cancel to go back without comitting.

- Once you commit, it will take a few minutes for the main www server to refresh its pages with those changes (right now the interval is set to 5 min).

## Modifying fragments

- Content like the banner ads, and the bio's on the location pages and the staff page, lives in "fragments". These have a `fragment:#fragment-name` header instead of a `page:path` header.

- to edit this, navigate to the page, then click on the **✍** fragment selection pointer (little hand) at the top right and then click anywhere inside the fragment that you want to edit in the preview pane on the right. The markdown for the selected fragment should appear on the left.

## Adding or removing pages

- Contact your web admin for help adding new pages, or changing page urls.

## Uploading images

- For best results, images should be sized at 2x the desired pixel width and height and then given explicit width and height dimensions (1/2 of the actual) when inserted. See [composer markdown extensions](#composer-markdown-extensions)  below for more details

- To upload an image, click on the ☰ button at the top left. This will open a little uploader form which you can browse your file system for the image that you want to upload (drag and drop not supported yet sorry). After uploading you should see the image below the form together with a markdown snippet for the image, and the image URL.

- The uploader will rename the image file with just lowercase and hyphens, but please use meaningful file names for your images before uploading them, so that someone looking at all the image files, can recognize what it is.

- Usually you will copy the markdown snippet and paste it somewhere into the markdown editor. Note that inside markdown, you don't need the fully qualified image source url, just start the image url or link with `/images/...`

# Markdown

Editor supports [github flavored markdown](https://help.github.com/articles/github-flavored-markdown/).

### Paragraphs and line breaks
Simply leave a blank line between paragraphs. To force a line break put 2 spaces at the end.  
like so.  
done.

### links and images

In general links have the form `[text](url "title")`

Links within the website don't require any [text] if the page has a name e.g. `[](/contact-fmc)` will become [](/contact-fmc).

Also, if the url starts with http:// or https:// and you want to show the url in the resulting page, you can just include it inline in the text without wrapping it in `[]()`

Markdown for images looks just like markdown for links with a `!` in front  
E.g. `![jurgen's kids a few years ago](/images/gmail-logo-1.gif)`  
![jurgen's kids a few years ago](/images/gmail-logo-1.gif)

If you want an image which links to another page, you put the image markdown inside the text part of the link markdown like this.  
`[![Image](image-src)](link-url)`

### Editor markdown extensions
Most of these extensions work by recognising patterns in the `[]( "title")` part of the link markdown i.e the part in `""` after the url.

- Use `^` to force a link to open in a new window E.g. `[](/help "^")` [](/help "^")

- Note: "Fully qualified" links (which include `https://servername/...`) automatically open in a new tab/window. E.g.  
`[google](https://www.google.com)` opens a new window on
[google](https://www.google.com)

- The link title part of the image markdown can be used for `WxH` sizing or `name=value` attributes. E.g.  
`"align=right"` ![](/images/gmail-logo-1.gif "align=right")  
`"width=32"` ![](/images/gmail-logo-1.gif "width=32")  
`"12x12" `![](/images/gmail-logo-1.gif "12x12")

### Markdown inline formatting
- **BOLD**
- *ITALIC*
- ***BOLD AND ITALIC***
- ~~STRIKE-THRU~~
- `quoted-text with <> tags`


    quoted
    paragraph
    spanning multiple lines


# h1 level heading
## h2 level heading
### h3 level heading
#### h4 level heading

### lists

- bullet list
- bullet list
  - sub-bullet
  - sub-bullet
    - sub-sub-bullet
    - sub-sub-bullet


1. numbered list
   1. sub-point
   2. sub-point
    3. sub-sub-point
2. numbered list
3. numbered list

* * * 
Use `* * *` on a separate line for horizontal rules 

---

### tables

GFM tables use `|` to separate columns

    | Left-Aligned  | Center Aligned  | Right Aligned |
    | :------------ |:---------------:| -----:|
    | col 3 is      | some wordy text | $1600 |
    | col 2 is      | centered        |   $12 |
    | zebra stripes | are neat        |    $1 |

becomes...

| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |

...
---

Here's a [Markdown cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) with more information about things like tables.

And here's some [more background](/help/markdown-motivation) on the motivations behind markdown

![](/images/2016-05-07-13.43.19.jpg "width=100")
