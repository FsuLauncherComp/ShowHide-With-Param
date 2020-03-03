

tableau.extensions.initializeAsync().then(function() {
    tableau.extensions.dashboardContent.dashboard.objects.forEach(function(object){
        if (object.isFloating == true){
            document.getElementById('zones').innerHTML += object.name + ":" + object.type + ":" + object.id + ":" + object.isVisible + ":" + object.isFloating + "----";
        }
    });

    let wikiZone = ["Wiki"];
    let extensionName = ["ShoWHide"]; 
    let extensionVisibilityObject = {};
    let wikiVisibilityObject = {}; 

    tableau.extensions.dashboardContent.dashboard.objects.forEach(function(object){
        if(extensionName.includes(object.name)){
            extensionVisibilityObject[object.id] = tableau.ZoneVisibilityType.Hide;
        }else if(wikiZone.includes(object.name)){
            wikiVisibilityObject[object.id] = tableau.ZoneVisibilityType.Hide;
            extensionVisibilityObject[object.id] = tableau.ZoneVisibilityType.Hide;
        }
    });  

    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(extensionVisibilityObject).then(() => {
        console.log("done");
    }).then(()=>{
        worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(ws => ws.name === "State Map");
        worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, selection)
    })

    function selection(data) {
        data.getMarksAsync().then(marks => {
            if (marks.data[0].data.length === 1) {
            toggleWikiVisibility(tableau.ZoneVisibilityType.Show);
            } else {
            toggleWikiVisibility(tableau.ZoneVisibilityType.Hide); 
            }
        })
    }

    function toggleWikiVisibility(visibility) {
    for(let key in wikiVisibilityObject) {
        wikiVisibilityObject[key] = visibility;
    }
    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(wikiVisibilityObject).then(() => {
        console.log("done");
    });
    }

    });