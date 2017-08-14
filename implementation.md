# Implementation

## Model - Timeline

While IIIF has `navDate`, it is not really appropriate for the memoir as it applies to manifests and collections, and is used to generate navigation around the dated items of a collection such as issues of a newspaper. For the memoir, the various sections of the single manifest describe different periods of O'Shaughnessy's life and therefore different date *ranges* on the timeline. We already have a mechanism for description of structure within a single work, and it can be as precise as we like - `structures` and `ranges`. The different parts of the memoir should be described by IIIF ranges, which means that they will function as navigation in any IIIF viewer, not just this one.

http://iiif.io/api/presentation/2.1/#range

What this viewer needs is an understanding of the temporal coverage of a range. We could get complicated and start trying to annotate ranges to describe their temporal coverage, but that isn't going to help clients who aren't expecting a timeline. The simplest possible solution is to extend our use of range to include `dcterms:temporal`, like this:

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

The date range should be in ISO 8601 format, with the two date components (start and end) separated by a `/`. For this viewer we will assume that there is no time component to the start and end dates.

This extension to range will simply be ignored by a standard compliant IIIF client, and is simple and semantically correct.

It would be better to use the improved ranges model under consideration in Presentation API 3.0, but that would make this incompatible with current specifications, so we will stick to IIIF 2.0. We will also make certain assumptions for the initial deliverable, to simplify the approach:

1. *Ranges are lists of whole canvases.* A section does not start in one part of one canvas and finish in another region of another canvas, our ranges include only wole canvases. This would not be enough for newspapers, but it will be fine as a first pass here.

2. *Ranges do not overlap.* A canvas is only in one range. A later iteration could relax this requirement. This makes it easier to construct the timeline UI because it doesn't need to accomodate more than one track. 

## Model - linking

Each canvas in the memoir will link to 0..1 annotation lists. These annotation lists contain the information required to render highlighted areas for linking to other resources.

For example:

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

From the example links:

http://lux.library.nuigalway.ie/assets/iiif/manifests/p135/p135_co_225_0001.json 

File Name: p135_CO_225_0001, Page no. in the Memoir: 18, Word to be highlighted: 'Cricket', Text for 'Caption': Cricket was a lifelong interest of O'Shaughnessy's. This letter from 1897 follows the disbandment of the Mill Valley Cricket Club, and asks O'Shaughnessy if he would consider selling their cricket outfit at a cut rate. 

This canvas is http://library.nuigalway.ie/loris/srv/p135/canvas/p135_memoir_0019.tif.json, and the linked annotation list (currently /otherContent/019.json) looks like this:




Hotspot linking
Labels and descriptions on target manifest
Labels on annotation? textual Body?

Assumptions:

Source of link is region (hotspot) but we won't highlight a target region. We just link straight to canvas.

Labels on manifest/canvas of target - merge? Prefer canvas label and desription. then manifest label and description.

When dereffed load target label and desc.



## Interactions

Setup
R build timeline

U Click position on timeline, work navigates to page

U Navigate through work, timeline marker changes position

R show hotspot
U Click hotspot, load target and navigate to position

Collapse detail?
