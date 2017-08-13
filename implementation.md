# Implementation

## Model - Timeline

While IIIF has `navDate`, it is not really appropriate for the memoir as it applies to manifests and collections, and is used to generate navigation around the dated items of a collection such as issues of a newspaper. For the memoir, the various sections of the single manifest describe different periods of O'Shaughnessy's life and therefore different date *ranges* on the timeline. We already have a mechanism for descriptoin of structure within a single work, and it can be as precise as we like - `structures` and `ranges`. The different parts of the memoir should be described by IIIF ranges, which means that they will function as navigation in any IIIF viewer, not just this one.

What this viewer adds is an understanding of the temporal coverage of a range. We could get complicated and start trying to annotate ranges to describe their temporal coverage, but the simplest possible

It would be better to use the improved ranges model under consideration in Presentation API 3.0, but that would make this incompatible with current specifications, so we will stick to IIIF 2.0. We will also make certain assumptions for the initial deliverable, to simplify the approach.

1. *Ranges are lists of whole canvases.* A section does not start in one part of one canvas and finish in another region of another canvas, our ranges include only wole canvases. This would not be enough for newspapers, but it will be fine as a first pass here.

2. *Ranges do not overlap.* A canvas is only in one range. A later iteration could relax this requirement.

## Model - linking

Hotspot linking
Labels and descriptions on target manifest
Labels on annotation? textual Body?


## Interactions

Setup
R build timeline

U Click position on timeline, work navigates to page

U Navigate through work, timeline marker changes position

R show hotspot
U Click hotspot, load target and navigate to position

Collapse detail?
