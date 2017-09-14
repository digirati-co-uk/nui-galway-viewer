# Tasks

## Done:

* Use canvas label in UI (done for demo/prototype)
* park current prototype in branch, for reference later

## TODO:

* Confirm format/functionality here
* New branch in repo - start proper build of viewer, using [latest UI sketches](ui.md).
* No need to include code that makes navigation proportional to dates, decision is to use the ranges relative to the canvases.
* Use date labels on ranges on main navigation (see sketch). The dates are already parsed out for the proportional version.
* Introduce Openseadragon (OSD) to main panel (but see below for perceptual speed issues)
* Render hotspots as clickable regions/overlays - easily configurable for colours, borders etc.
* Load supplemental material in "fly-in" overlay as per UI sketches...
    * ...but experiment with what this transition is, should be very rapid pop-in, fade-in etc - any "effects" will get tiresome quickly. Might just be a very quick, subtle fade/pop-in.
* Preserve "view in repository" behaviour, but see note from email [[1]](#foot1).
* Prioritise desktop and tablet over small screen - but still needs to work on small screen.
* Small device lists links to range names from hamburger, doesn't try to map to scale
* Slider nav, rather than my click stripe bar. The fastest possible visual feedback here. Possibly using small images.
* Deep zoom in supplemental viewer too

## Implementation notes for Stephen

This viewer has elements of both the Quilt and the Bedlam viewers (whether you resuse anything from them is up to you, might not be the right thing to do). It uses annotation coordinates in the canvas (in this case, simple rectangles) to make navigation hotspots that trigger new UI actions like the Quilt, and it is also a simple, fast, sequential reader through a work, like the Bedlam viewer. I'm very keen on retaining the speed of the prototype - very quick to load, very quick to page. At the moment it's very quick to page because the images are single static images, which the server will cache:

```
var imageUrl = canvas.images[0].resource.service.id + "/full/!1600,1600/0/default.jpg";`
```

This viewer is read-only, so no anno studio functionality. It would be good to investigate whether we can lazy-load OSD, or load it when a mousewheel zoom, pinch/spread, click or other "zoom" action occurs, or load it but only show it when ready. These are sub-second performance features, but the very fast paging perception of the static images could be combined with the availability of deep zoom for the best of both worlds.

NUI Galway want to be able to style the viewer, so the HTML and CSS should provide a "vanilla" look and feel (but with a polished user experience of course).

---------

<a name="foot1">[1]</a>: The label text shown for links in the main panel, before the linked manifest is loaded, comes from the annotation list. The text shown in the supplemental panel for labels, description and also any related link to the repository comes from the loaded manifest itself. Would it be possible to add the "related" link you have for the portrait of Uncle Maurice in https://digirati-co-uk.github.io/nui-galway-viewer/otherContent/003.json to the actual manifest? That is, to http://lux.library.nuigalway.ie/assets/iiif/manifests/p135/otherContent/p135_4_3.json? At the moment, the Wellcome example gets a link to repository because there's one in the target manifest, and Uncle Maurice doesn't because in the supplemental viewer, there's no "related" key on the full manifest. If you can't get those "related" links added to the target manifest, we'll need to pass information from the source annotation to the supplemental viewer, which is possible of course but feels slightly wrong from a model perspective.


