let selParam;
let zoneVisbilityObject = {};

$(document).ready(function () {
    tableau.extensions.initializeAsync({ 'configure': configure }).then(() => {
        console.log(tableau.extensions.settings.getAll());
        let configured = (tableau.extensions.settings.get('configured') === 'true');
        if (!configured) {
            configure();
        } else {
            initExtension();
        }
    });
});

function configure() {
    const popupUrl = `${window.location.origin}/ShowHide-With-Param/config.html`
    let payload;
    tableau.extensions.ui.displayDialogAsync(popupUrl, payload, { height: 550, width: 775 }).then((closePayload) => {
        initExtension();
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

async function initExtension() {
    let ws = tableau.extensions.settings.get('selectedWorksheet');
    let z = tableau.extensions.settings.get('zone')
    document.getElementById('zones').innerHTML += ws + ' : ' + z;
    await setZoneVisibilityObject();
    await setListenerType();
    await setVisibility();
}

function setZoneVisibilityObject() {
    tableau.extensions.dashboardContent.dashboard.objects.forEach(function (object) {
        if (object.name == tableau.extensions.settings.get('zone')) {
            zoneVisbilityObject[object.id] = tableau.ZoneVisibilityType.Show;
        }
    });
}

function setListenerType() {
    let triggerType = tableau.extensions.settings.get('triggerType');
    removeListener(triggerType);
    if (triggerType == 'trigger-parameter') {
        addParameterListener();
    } else {
        addWorksheetListener();
    }
}

function removeListener(triggerType) {
    if (triggerType == 'trigger-parameter') {
        let selectedWorksheet = tableau.extensions.settings.get('selectedWorksheet');
        if (selectedWorksheet != undefined) {
            worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(ws => ws.name === selectedWorksheet);
            worksheet.removeEventListener(tableau.TableauEventType.MarkSelectionChanged, selection);
        }
    } else {
        let selectedParameter = tableau.extensions.settings.get('parameter');
        if (selectedParameter != undefined) {
            tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
                let selParam = params.find(p => p.name == selectedParameter);
                selParam.removeEventListener(tableau.TableauEventType.ParameterChanged, setVisibility);
            });
        }
    }
}

function addWorksheetListener() {
    let selectedWorksheet = tableau.extensions.settings.get('selectedWorksheet');
    worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(ws => ws.name === selectedWorksheet);
    worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, selection);
}

function addParameterListener() {
    let selectedParameter = tableau.extensions.settings.get('parameter');
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
        let selParam = params.find(p => p.name == selectedParameter);
        selParam.addEventListener(tableau.TableauEventType.ParameterChanged, setVisibility);
    });
}

function getZoneVisibility(selParamValue) {
    let configuedValue = tableau.extensions.settings.get('paramvalue');
    let showZone = Boolean('show' == tableau.extensions.settings.get('showhidevalue'));
    if (configuedValue == selParamValue && showZone) {
        return tableau.ZoneVisibilityType.Show;
    } else if (configuedValue != selParamValue && !showZone) {
        return tableau.ZoneVisibilityType.Show;
    } else {
        return tableau.ZoneVisibilityType.Hide;
    }
}

function setVisibility() {
    let triggerType = tableau.extensions.settings.get('triggerType');
    if (triggerType == 'trigger-parameter') {
        tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
            let selParamValue = params.find(p => p.name == tableau.extensions.settings.get('parameter')).currentValue.value;
            let visibility = getZoneVisibility(selParamValue);
            toggleZoneVisibility(visibility);
        });
    } else {
        toggleZoneVisibility(tableau.ZoneVisibilityType.Hide);
    }
}

function selection(data) {
    data.getMarksAsync().then(marks => {
        if (marks.data[0].data.length === 1) {
            toggleZoneVisibility(tableau.ZoneVisibilityType.Show);
        } else {
            toggleZoneVisibility(tableau.ZoneVisibilityType.Hide);
        }
    })
}

function toggleZoneVisibility(visibility) {
    for (let key in zoneVisbilityObject) {
        zoneVisbilityObject[key] = visibility;
    };
    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(zoneVisbilityObject).then(() => {
        console.log('Visibility Changed');
    });
}