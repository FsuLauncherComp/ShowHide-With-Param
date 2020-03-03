let selParam
let zoneVisbilityObject = {};

$(document).ready(function () {
    tableau.extensions.initializeAsync({ 'configure': configure }).then(() => {
        console.log(tableau.extensions.settings.getAll());
        let configured = (tableau.extensions.settings.get('configured') === 'true');
        if (!configured) {
            configure();
        } else {
            initExtension(tableau.extensions.settings.get('parameter'));
        }
    });
});

function configure() {
    const popupUrl = `${window.location.origin}/ShowHide-With-Param/config.html`
    let payload;
    tableau.extensions.ui.displayDialogAsync(popupUrl, payload, { height: 350, width: 775 }).then((closePayload) => {
        initExtension(tableau.extensions.settings.get('parameter'));
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

function setZoneVisibilityObject() {
    tableau.extensions.dashboardContent.dashboard.objects.forEach(function (object) {
        if (object.name == tableau.extensions.settings.get('zone')) {
            zoneVisbilityObject[object.id] = tableau.ZoneVisibilityType.Show;
        }
    });
}

function initExtension(pname) {
    setZoneVisibilityObject();
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
        let selParam = params.find(p => p.name == pname);
        selParam.addEventListener(tableau.TableauEventType.ParameterChanged, setVisibility);
    });
    setVisibility();
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
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
        let selParamValue = params.find(p => p.name == tableau.extensions.settings.get('parameter')).currentValue.value;
        let visibility = getZoneVisibility(selParamValue);
        toggleZoneVisibility(visibility);
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