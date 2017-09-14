// This viewer is a prototype to explore UX around date based navigation via ranges, and hotspot linking between resources.
// It might not work wth any old manifest.

var viewer = function(){
    var self = this;
    function load(manifestUri){
        $.ajax({
            dataType: "json",
            url: manifestUri,
            cache: true,
            success: function (manifest) {
                IIIF.wrap(manifest);
                // we're going to assume that there is one top level range, and then the
                // child ranges. This is for the one manifest demo.
                if(manifest.structures && "top" == manifest.structures[0].viewingHint){
                    var canvases = manifest.sequences[0].canvases;
                    var displayRanges = getDisplayRanges(manifest);
                    makeCanvasNav(canvases, displayRanges);
                    makeRangeNav(canvases, displayRanges);
                    self.canvases = canvases;
                    self.displayRanges = displayRanges;   
                    
                    $(".canvasSource").on('click', function(ev){
                        cvid = this.getAttribute("data-canvasid");
                        if(cvid){
                            navigateToCanvas(cvid);
                        } 
                    });

                    $('#scaleMode').change(function() {
                        if(this.checked) {
                            $('#canvases').hide();
                            $('#canvasDisplayRanges').hide();
                            $('#ranges').show();
                        } else {
                            $('#canvases').show();
                            $('#canvasDisplayRanges').show();
                            $('#ranges').hide();
                        }       
                    });
                    
                    $('#ranges').hide();
                    navigateToCanvas(self.canvases[0].id);

                } else {
                    console.log("need a top level range");
                }
            }
        });
    }

    function makeCanvasNav(canvases, displayRanges){
        // see https://github.com/digirati-co-uk/nui-galway-viewer/issues/1
        
        var canvasWidth = 100.0/canvases.length;      
        var $canvases = $('#canvases');      
        var $canvasDisplayRanges = $('#canvasDisplayRanges');  
        // yeah, storing the model in the DOM...
        // create two sets of divs. First set has one div for each canvas:
        for(var ci=0; ci<canvases.length; ci++){
            canvas = canvases[ci];
            cv = document.createElement("div");
            cv.className = "navCanvas canvasSource " + (ci % 2 == 0 ? "even" : "odd");
            cv.style.width = canvasWidth + "%";
            cv.setAttribute("data-canvasid", canvas.id);
            $canvases.append(cv);
        }

        // We are going to make some very strong assumptions in the prototype. 
        // We assume that within a range, the canvases are in the right order and that they are contiguous.
        // A more robust solution would do some sorting.
        // This approach also offers later possibility of stacked overlapping ranges:
        // ----    ---------   ----
        //    ------------   -----
        //        ---- ------ 
        // ...etc
        for(var ri=0; ri<displayRanges.length; ri++){
            displayRange = displayRanges[ri];
            navRange = document.createElement("div");
            navRange.className = "navRange canvasSource " + (ri % 2 == 0 ? "even" : "odd");
            navRange.style.width = canvasWidth*displayRange.canvases.length + "%";
            navRange.textContent = displayRange.label;
            index = canvases.findIndexById(displayRange.canvases[0].id);
            navRange.style.left = index*canvasWidth + "%";
            navRange.setAttribute("data-rangeid", displayRange.id);
            navRange.setAttribute("data-canvasid", displayRange.canvases[0].id);
            $canvasDisplayRanges.append(navRange);
        }

    }

    function makeRangeNav(canvases, displayRanges){
        // here we need to make the timeline div proportional to the time coverage of each range
        var start = null;
        var end = null;
        for(var ri=0; ri<displayRanges.length; ri++){
            testRange = displayRanges[ri];
            if(!start || testRange.start < start){
                start = testRange.start;
            }
            if(!end || testRange.end > end){
                end = testRange.end;
            }
        }
        
        var $dateDisplayRanges = $('#ranges');  

        var timelineDuration = end.getTime() - start.getTime();
        for(var ri=0; ri<displayRanges.length; ri++){
            displayRange = displayRanges[ri];
            navRange = document.createElement("div");
            navRange.className = "navRange canvasSource " + (ri % 2 == 0 ? "even" : "odd");
            offset = displayRange.start.getTime() - start.getTime();
            displayRangeDuration = displayRange.end.getTime() - displayRange.start.getTime();
            navRange.style.width = (displayRangeDuration * 100.0) / timelineDuration + "%";
            navRange.style.left = offset * 100.0 / timelineDuration + "%";
            navRange.textContent = displayRange.label;
            index = canvases.findIndexById(displayRange.canvases[0].id);
            navRange.setAttribute("data-rangeid", displayRange.id);
            navRange.setAttribute("data-canvasid", displayRange.canvases[0].id);
            $dateDisplayRanges.append(navRange);
        }
        

    }

    function navigateToCanvas(canvasId){
        $('.canvasSource').removeClass('selected');
        canvasIndex = self.canvases.findIndexById(canvasId);
        canvas = self.canvases[canvasIndex];
        $("#main button").attr("data-canvasid", "");
        if(canvasIndex > 0){
            $('#previous').attr("data-canvasid", self.canvases[canvasIndex - 1].id);
        }
        if(canvasIndex < self.canvases.length - 1){            
            $('#next').attr("data-canvasid", self.canvases[canvasIndex + 1].id);
        }
        // highlight active navigation element(s)
        $('.navCanvas').eq(canvasIndex).addClass('selected');
        for(var ri=0; ri<self.displayRanges.length; ri++){
            var displayRange = self.displayRanges[ri];
            for(var ci=0; ci<displayRange.canvases.length; ci++){
                if(displayRange.canvases[ci].id == canvas.id){
                    $(".navRange[data-rangeid='" + displayRange.id + "']").addClass('selected');
                }
            }
        }
        $('#position').text(canvas["label"] + " (" + (canvasIndex + 1) + " of " + self.canvases.length + ")");
        loadCanvas(canvas);
    }

    function loadCanvas(canvas){
        // here you need to add sensible logic for your images. I know that Galway's are level 2 (Loris),
        // and I know that the annotated resource image is full size, and too big. So I'm going to ask for a smaller one.
        var imageUrl = canvas.images[0].resource.service.id + "/full/!1600,1600/0/default.jpg";
        $('#main').css('background-image', 'url(' + imageUrl + ')');
        $('#linkDump').empty();
        $('#linkDump').hide();        
        $('#supplementalTitle').empty();
        $('#supplementalImages').empty();
        $('#supplementalDesc').empty();
        $('#supplementalImages').scrollTop(0);
        $('#supplemental').css("width", "0%");
        if(canvas.otherContent){
            for(var ai=0; ai<canvas.otherContent.length; ai++){
                $.ajax({
                    dataType: "json",
                    url: canvas.otherContent[ai]["@id"],
                    cache: true,
                    success: function (annoList) {
                        if(annoList.resources){
                            for(var ri=0; ri<annoList.resources.length; ri++){
                                // we're only interested in links to canvases in other manifests here.
                                anno = annoList.resources[ri];
                                if(anno.motivation == "oa:linking"){
                                    parts = anno.on.split("#");
                                    cvid = parts[0];
                                    xywh = null;
                                    if(parts.length > 1){
                                        xywh = parts[1];
                                    }
                                    // will populate this object:
                                    linkToManifest = {
                                        xywh: xywh,
                                        url: null,
                                        canvasId: null,
                                        label: null,
                                        description: null
                                    };
                                    if(anno.resource["@type"] == "sc:Manifest"){
                                        linkToManifest.url = anno.resource["@id"];
                                        linkToManifest.label = anno.resource.label;
                                        linkToManifest.description = anno.resource.description;
                                    } else if (anno.resource["@type"] == "sc:Canvas"){
                                        // we MUST be given a within otherwise we're stuffed
                                        if(anno.resource.within && anno.resource.within["@type"] == "sc:Manifest"){
                                            linkToManifest.url = anno.resource.within["@id"];
                                            linkToManifest.label = anno.resource.within.label;
                                            linkToManifest.description = anno.resource.within.description;
                                            linkToManifest.canvasId = anno.resource["@id"];
                                        }
                                    }       
                                    if(linkToManifest.url){
                                        renderLink(linkToManifest);
                                    }                                                                 
                                }
                            }
                        }
                    }
                });
            }
        }
    }

    function renderLink(linkToManifest){
        // won't actually draw this on the canvas for this demo
        var html = "<p>Draw link at <a href='{manifest}' data-canvas='{canvas}'>{xywh}</a> going to <i>{label}</i></p>";
        html += "<p class='desc'>{description}</p>"
        html = html.replace("{manifest}", linkToManifest.url);
        html = html.replace("{canvas}", linkToManifest.canvasId);
        html = html.replace("{xywh}", linkToManifest.xywh);
        html = html.replace("{label}", linkToManifest.label);
        html = html.replace("{description}", linkToManifest.description);        
        $('#linkDump').append(html);
        $('#linkDump').show();
        
        $('#linkDump a').click(function(ev){
            ev.preventDefault();            
            canvasId = $(this).attr("data-canvas");    
            $.ajax({
                dataType: "json",
                url: this.href,
                cache: true,
                success: function (manifest) {
                    loadSupplemental(manifest, canvasId);
                }
            });

        });
    }

    function loadSupplemental(manifest, canvasId){
        $('#supplemental').css("width", "50%");
        $('#supplementalTitle').text(manifest.label);
        $('#supplementalDesc').text(manifest.description || "(no description)");
        $supplementalImages = $("#supplementalImages");
        IIIF.wrap(manifest);
        if(manifest["related"]){
            repo = manifest["related"].asArray()[0]; // todo - prefer HTML format
            $('#supplementalDesc').prepend("<p><a href='" + repo["@id"] + "'>" + (repo["label"] || "View in repository") + "</a></p>");
        }
        canvasIndex = manifest.sequences[0].canvases.findIndexById(canvasId);
        if(canvasIndex < 0) canvasIndex = 0;
        // TODO - only load an image when its pixels are on screen
        for(var ci=0; ci<manifest.sequences[0].canvases.length; ci++){
            var canvas = manifest.sequences[0].canvases[ci];
            var imageUrl = canvas.images[0].resource.service.id + "/full/!1000,1000/0/default.jpg";
            $supplementalImages.append("<img id='suppcv_" + ci + "' src='" + imageUrl + "' />");
        }
        var imageOfInterest = document.getElementById("suppcv_" + canvasIndex);
        $(imageOfInterest).on('load', function() {
            document.getElementById('supplementalImages').scrollTop = imageOfInterest.offsetTop;
        });
    }

    function getDisplayRanges(manifest){
        // wire up ranges into something more useful. This is making a lot of assumptions,
        // needs to be generalised to work with arbitrary manifests
        canvases = manifest.sequences[0].canvases;
        rangesOfInterest = manifest.structures.where(function(range){
            return range["dcterms:temporal"] && range["canvases"] && range["canvases"].length > 0;
        });
        return rangesOfInterest.map(function(iiifRange){
            var dateStrings = iiifRange["dcterms:temporal"].split("/");
            return {
                start: new Date(dateStrings[0]),
                end: new Date(dateStrings[1]),
                label: iiifRange["label"],
                canvases: mapCanvasIds(manifest, iiifRange["canvases"]),
                id: iiifRange.id
            }
        });
    }

    function mapCanvasIds(manifest, canvasIds){
        return canvasIds.map(function(canvasId){
            return manifest.sequences[0].canvases.first(function(cv){
                return cv.id == canvasId;
            })
        }).filter(function(cv){
            return cv; // filter missing canvases
        })
    }

    return {
        initialise: function(manifestUri){ load(manifestUri)}
    };

}();