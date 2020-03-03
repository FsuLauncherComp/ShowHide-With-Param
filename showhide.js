let selParam
let today = new Date();
let zoneVisbilityObject = {};

$(document).ready(function () {
    tableau.extensions.initializeAsync({ 'configure': configure }).then(() => {
        console.log(tableau.extensions.settings.getAll());
        let configured = (tableau.extensions.settings.get('configured') === 'true');
        if (!configured) {
            configure();
        } else {
            //configure();
           addParamListener(tableau.extensions.settings.get('parameter'));
        }
    });
});

function configure() {
    const popupUrl = `${window.location.origin}/config.html`
    let payload;
    tableau.extensions.ui.displayDialogAsync(popupUrl, payload, { height: 300, width: 500 }).then((closePayload) => {
        addParamListener(tableau.extensions.settings.get('parameter'));
    }).catch((error) => {
        switch (error.errorCode) {
            case tableau.ErrorCodes.DialogClosedByUser:
                console.log("Dialog was closed by user.");
                break;
            default:
                console.error(error.message);
        }
    });
}


function addParamListener(pname) {
    let configuedValue = tableau.extensions.settings.get('paramvalue');
    tableau.extensions.dashboardContent.dashboard.objects.forEach(function (object) {
        if (object.name == tableau.extensions.settings.get('zone')) {
            tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
                let selParam = params.find(p => p.name == pname);
                selParam.addEventListener(tableau.TableauEventType.ParameterChanged, onParameterChange);
                if (selParam.currentValue.value === configuedValue) {
                    zoneVisbilityObject[object.id] = tableau.ZoneVisibilityType.Show;
                    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(zoneVisbilityObject);
                } else {
                    zoneVisbilityObject[object.id] = tableau.ZoneVisibilityType.Hide;
                    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(zoneVisbilityObject);
                }
            });
        }
    });
}

function onParameterChange() {
    let configuedValue = tableau.extensions.settings.get('paramvalue');
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
        let selParam = params.find(p => p.name == tableau.extensions.settings.get('parameter'));
        if (selParam.currentValue.value === configuedValue) {
            toggleZoneVisibility(tableau.ZoneVisibilityType.Show);
        } else {
            toggleZoneVisibility(tableau.ZoneVisibilityType.Hide);
        }
    });
}

function toggleZoneVisibility(visibility) {
    for (let key in zoneVisbilityObject) {
        zoneVisbilityObject[key] = visibility;
    };
    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(zoneVisbilityObject).then(() => {
        console.log('Visibility Changed');
    });
}