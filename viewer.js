// This viewer is a prototype to explore UX around date based navigation via ranges, and hotspot linking between resources.
// It might not work wth any old manifest.

var viewer = function(){

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
                    this.canvases = canvases;
                    this.displayRanges = displayRanges;   
                    
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
                    navigateToCanvas(this.canvases[0].id);

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
        $('.navCanvas').removeClass('selected');
        canvasIndex = this.canvases.findIndexById(canvasId);
        canvas = this.canvases[canvasIndex];
        $("#main button").attr("data-canvasid", "");
        if(canvasIndex > 0){
            $('#previous').attr("data-canvasid", this.canvases[canvasIndex - 1].id);
        }
        if(canvasIndex < this.canvases.length - 1){            
            $('#next').attr("data-canvasid", this.canvases[canvasIndex + 1].id);
        }
        $('.navCanvas').eq(canvasIndex).addClass('selected');
        $('#position').text(canvasIndex + 1 + " of " + this.canvases.length);
        loadCanvas(canvas);
    }

    function loadCanvas(canvas){
        // here you need to add sensible logic for your images. I know that Galway's are level 2 (Loris),
        // and I know that the annotated resource image is full size, and too big. So I'm going to ask for a smaller one.
        var imageUrl = canvas.images[0].resource.service.id + "/full/!1600,1600/0/default.jpg";
        $('#main').css('background-image', 'url(' + imageUrl + ')');
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
        })
    }

    return {
        initialise: function(manifestUri){ load(manifestUri)}
    };

}();