# Implementation

## Model - Timeline

Problem - we need to describe the various parts of the memoir corresponding to periods of O'Shaughnessy's life, so that the client software can generate timeline-based navigation. IIIF doesn't have a specified mechanism for this.

While IIIF has `navDate`, it is not really appropriate for the memoir as it applies to manifests and collections, and is used to generate navigation around the dated items of a collection such as issues of a newspaper. For the memoir, the various sections of the single manifest describe different periods of O'Shaughnessy's life and therefore different date *ranges* on the timeline. We already have a mechanism in IIIF for description of structure within a single work, and it can be as precise as we like - `structures` and `ranges`. The different parts of the memoir should be described by IIIF ranges, which means that they will function as navigation in any range-aware IIIF viewer, not just this one - although only this one will turn it into a timeline.

http://iiif.io/api/presentation/2.1/#range

What this viewer needs is an understanding of the temporal coverage of a range, as well as the canvases (or parts of canvases). We could get complicated and start trying to annotate ranges to describe their temporal coverage, but that isn't going to help clients who aren't expecting a timeline. The simplest possible solution is to extend our use of range to include `dcterms:temporal`, like this:

```json  
{
    "@id": "http://library.nuigalway.ie/mmos/range/r6",
    "@type": "sc:Range",
    "label": "Hetch Hetchy project",
    "dcterms:temporal": "1908-06-01/1932-01-20",
    "canvases": [
        "http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0026.tif.json",
        "http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0027.tif.json",
        "http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0028.tif.json",
        "http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0029.tif.json",
        "http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0030.tif.json"
    ]
}
```

In this range we are saying that the five listed canvas IDs are the pages covering the Hetch Hetchy project, from 1908 to 1932 (canvases and dates are for explanation purposes, they are not the correct ones yet).

The date range should be in ISO 8601 format, with the two date components (start and end) separated by a `/`. For this viewer we will assume that there is no time component to the start and end dates.

This extension to range will simply be ignored by a standard compliant IIIF client, and is simple and semantically correct.

It would be better to use the improved ranges model under consideration in Presentation API 3.0, but that would make this incompatible with current specifications, so we will stick to IIIF 2.0. We will also make certain assumptions for the initial deliverable, to simplify the approach:

1. *Ranges are lists of whole canvases.* A section does not start in one part of one canvas and finish in another region of another canvas, our ranges include only whole canvases. This would not be enough for newspapers, but it will be fine as a first pass here.

2. *Ranges do not overlap.* A canvas is only in one range. This makes it easier to construct the timeline UI because it doesn't need to accommodate more than one track, and a canvas can only be on one range on the timeline. A later iteration could relax this requirement, to make for more complex timelines.

## Model - linking

Each canvas in the memoir will link to 0 or 1 annotation list(s). These annotation lists contain the information required to render highlighted areas to the user for loading the linked resources. The Presentation API provides a means of doing this - [Hotspot Linking](http://iiif.io/api/presentation/2.1/#hotspot-linking)

For example, the canvas for memoir page 18 would look like this in the manifest:

```json
{
    "@id": "http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0019.tif.json", 
    "@type": "sc:Canvas", 
    "label": "Page 019", 
    "height": 7446, 
    "width": 5561, 
    "images": [
        {
            "@type": "oa:Annotation", 
            "motivation": "sc:painting", 
            "resource": {
                "@id": "http://library.nuigalway.ie/loris/srv/p135/p135_memoir_0019.tif/full/full/0/default.jpg", 
                "@type": "dctypes:Image", 
                "format": "image/jpeg", 
                "height": 7446, 
                "width": 5561, 
                "service": {
                    "@context": "http://iiif.io/api/image/2/context.json", 
                    "@id": "http://library.nuigalway.ie/loris/srv/p135/p135_memoir_0019.tif", 
                    "profile": "http://iiif.io/api/image/2/level1.json"
                }
            }, 
            "on": "http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0019.tif.json"
        }
    ],
    "otherContent": [
        {
            "@id": "https://digirati-co-uk.github.io/nui-galway-viewer/otherContent/019.json",
            "@type": "sc:AnnotationList"
        }
    ]
}
```

The `otherContent` property links to an annotation list that contains all the links for that canvas (there might be only one, and later there might be other kinds of annotation, such as a transcription of the canvas)

In this case, we need to link to another manifest that represents a letter, at http://lux.library.nuigalway.ie/assets/iiif/manifests/p135/p135_co_225_0001.json. This is described in the notes:

> File Name: p135_CO_225_0001, Page no. in the Memoir: 18, Word to be highlighted: 'Cricket', Text for 'Caption': Cricket was a lifelong interest of O'Shaughnessy's. This letter from 1897 follows the disbandment of the Mill Valley Cricket Club, and asks O'Shaughnessy if he would consider selling their cricket outfit at a cut rate. 

This canvas is the one with @id http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0019.tif.json (shown above), and the linked annotation list (currently otherContent/019.json for demo purposes) looks like this:

```json
{
  "@context": "http://iiif.io/api/presentation/2/context.json",
  "@id": "https://digirati-co-uk.github.io/nui-galway-viewer/otherContent/019.json",
  "@type": "sc:AnnotationList",
  "resources": [
    {
        "@id": "https://digirati-co-uk.github.io/nui-galway-viewer/otherContent/019/01",
        "@type":"oa:Annotation",
        "motivation":"oa:linking",
        "resource": {
            "@id":"http://57eaa235-f418-4c33-9812-d5be31a514ae/",
            "@type":"sc:Canvas",
            "within": {
                "@id": "http://lux.library.nuigalway.ie/assets/iiif/manifests/p135/p135_co_225_0001.json",
                "@type": "sc:Manifest",
                "label": "Letter to M M O'Shaughnessy from Reginald N [Tenman]",
                "description": "Cricket was a lifelong interest of O'Shaughnessy's. This letter from 1897 follows the disbandment of the Mill Valley Cricket Club, and asks O'Shaughnessy if he would consider selling their cricket outfit at a cut rate"
            }
        },
      "on": "http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0019.tif.json#xywh=3000,1800,400,90"
    }
  ]
}
```

This 019.json resource is an annotation list loaded by the viewer. In this case it's a viewer that understands annotations with an `oa:linking` motivation. There is only one annotation in the list at the moment, because so far we only have one link on this page.

The **target** of the linking annotation is the region (x,y,w,h) that is the box we want to highlight for the word "Cricket", on the canvas in the memoir manifest. The viewer will see this and render the link to click over the word "Cricket". The target is the `on` property:

```json
"on": "http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0019.tif.json#xywh=3000,1800,400,90"
```

...with the box given by the xywh hash fragment:

```json
#xywh=3000,1800,400,90
```

_(NB these coordinates are not the correct ones, just for demonstration)_

The **body** of the linking annotation is the canvas we want to link to. The body is the `resource` property. We could link from hotspot to hotspot, and have a target canvas that also has a #xywh hash fragment on the end of it, but for the first iteration we will assume that the target is simply the ID of a canvas. Any resource (e.g., a web page or document) could be linked to in this way.

In the example above, we could have just linked to the canvas:

```json
    "resource": {
        "@id":"http://57eaa235-f418-4c33-9812-d5be31a514ae/",
        "@type":"sc:Canvas"
    }
```

...but this is not enough, because we need to load the manifest that the canvas lives in. So we have provided information via IIIF's `within` property to tell the client viewer where to find the canvas. We have reproduced the linked manifest's `label` and `description` in the body of the annotation, so the viewer doesn't have to make a further HTTP request for the manifest until a user actually clicks the link to view it - all the necessary information to generate UI is incuded in the annotation body.

### Other possibilities/variations

The body of the annotation (the `resource`) could be a manifest rather than a canvas, in which case the viewer can't jump to a particular page of the linked manifest. It will default to the first canvas. If the linked resource is a single page (e.g., a single page letter) it doesn't make any difference.

If the linked-to resource is a canvas you must provide the manifest it lives in.

You might have `label` and `description` for the canvas _and_ the manifest, and they might be different. For simplicity in this iteration, the client will use the `label` and `description` from the canvas if given, otherwise from the manifest. You must provide one or the other for the viewer to have something to show.

The annotation should have enough information for the client to work out what is going on, i.e., you must supply the `@type` of the resource, either `sc:Canvas` or `sc:Manifest`.

### Another Example

From the first set of links (see [links.md](links.md))

> Page 1, paragraph 2, line 13/14. 'Margaret O'Donnell'. There are 3 digital objects in the attachment that make up the pages of a letter. File names p135_6_56_001, P135_6_56_002 and p135_6_56_003. Letter to M M O'Shaughnessy from his mother following the birth of his 2nd daughter, Mary. In the letter, she scolds O'Shaughnessy for not writing more often, and encloses a pocket handkerchief with a lock of her hair, greying while she waits for him to write. (19 Jun c1893). 

The letter to O'Shaughnessy from his mother would be a 3-canvas manifest. In this case we don't need to jump to a particular page, so the target can be the manifest directly.

### Single image manifests only

There is a potential UX problem with having two _paged_ (in some form) viewers on screen at once. If the memoir links to a multi page letter, the user might get immersed in the letter. Nothing wrong with that, but the degree to which the focus of attention is on the memoir needs to be considered. 

The current option is to present the paging differently, as a vertical scroll (as in [images/multi-image.png](images/multi-image.png)).

The simplest possible form of interaction would be to construct all the linked resources as single canvas manifests for this project, so we don't need to worry about vertical scrolling or complex interactions in the target resource (see [images/multi-image.png](images/single-image.png)). Alternatively, the linked-to resources could be single or multi image canvases, but we don't offer any means of exploring the manifest beyond the directly-linked-to canvas. If you want to read the rest of the letter, open its manifest in a different viewer (the memoir viewer could provide a link to the other manifest's own web page somewhere else).

This is more of a UX consideration than an implementation problem, but it is fundamental to the feel of the memoir viewer.

## Interactions

The client software exhibits the following behaviours:

* Load of memoir manifest. The viewer is configured to load the memoir manifest on startup. It parses the range information (under the `structures` property) and builds the timeline UI. It loads the first canvas of the memoir into the deep zoom portion of the UI.
* When a user clicks on a range in the timeline, the viewer navigates to that canvas and indicates that the range is selected in the timeline.
* when a user pages forward or backward through the manifest, the current range is highlighted in the timeline. (NB see UV issue ..)
* For each canvas (only one visible at a time as per [images/viewer.png](images/viewer.png)) the viewer loads the annotation list (if present), parses the `oa:linking` annotations and generates overlays on the deep zoom surface that act as triggers to load the linked resources. We can provide a tooltip from the label and/or description of the linked resource provided in the annotation body as discussed above.
* When a user cicks an overlay (hotspot target), the viewer loads the linked manifest, finds the highighted canvas, and displays it in the detail pane. It also displays the label and description of the canvas below the image in the detail pane. Whether the user can navigate to other canvases in the manifest is up for discussion. Also to be decided is whether the label and description in the loaded linked-to manifest are used below the detail pane in preference to those in the loaded manifest (and/or the particular canvas). There may be a good reason to use different text in the viewer context that on the resource itself which has a separate existence as a IIIF manifest. 

## Implementation Styling

The first pass at the viewer should concentrate on behaviour, not styling. A functional piece of software that can be used to experiment with UX. 

### In Scope

* Working Source code
* HTML and CSS sufficient to enable functionality
* Brief Documentation
* Small amount of Telephone Assistance

### Out of Scope

* Design, branding etc
* Content assembly and integration.

