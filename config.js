$(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
        swapTriggerTypes();
        console.log(tableau.extensions.settings.getAll());
        getDashboardObjects();
    });
});

function swapTriggerTypes() {
    let triggerType = tableau.extensions.settings.get('triggerType');
    $('.trigger-config').hide();
    if (triggerType != undefined) {
        $('#trigger-type option[value="' + triggerType + '"]').prop("selected", true);
        $('#' + triggerType).show();
        getParams();
        setParamValue();
    }
    $('#trigger-type').change(function () {
        $('.trigger-config').hide();
        let triggerSelection = $(this).val();
        if (triggerSelection == 'trigger-dashboard-action') {
            getWorksheets();
        } else {
            getParams();
        }
        $('#' + $(this).val()).show();
    })
}

function getWorksheets() {
    let options = '';
    let selectedWorksheet = tableau.extensions.settings.get('selectedWorksheet');
    tableau.extensions.dashboardContent.dashboard.worksheets.forEach(function (worksheet) {
        if (worksheet.name == selectedWorksheet) {
            options += `<option value=${worksheet.name} selected>${worksheet.name}</option>`;
        } else {
            options += `<option value=${worksheet.name}>${worksheet.name}</option>`;
        }
    });
    document.getElementById('select-worksheet').innerHTML = options;
    document.getElementById('save-settings').disabled = false;
}

function getParams() {
    let selectedParameter = tableau.extensions.settings.get('parameter');
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
        let options = '';
        let c = 0;
        for (let p of params) {
            if (p.dataType != 'date') {
                if (p.name == selectedParameter) {
                    options += `<option value='${p.name}' selected>${p.name}</option>`;
                } else {
                    options += `<option value='${p.name}'>${p.name}</option>`;
                }
                c++
            }
        }
        if (c > 0) {
            document.getElementById('pickparam').innerHTML = options;
            document.getElementById('save-settings').disabled = false;
        } else {
            document.getElementById('pickparam').innerHTML = "<option value='' disabled>No parameters found</option>";
        }
    });
}

function setParamValue() {
    let configuedValue = tableau.extensions.settings.get('paramvalue');
    if (configuedValue != undefined) {
        document.getElementById('paramvalue').value = configuedValue;
    }
}

function getDashboardObjects() {
    let options = '';
    let selectedZone = tableau.extensions.settings.get('zone');
    tableau.extensions.dashboardContent.dashboard.objects.forEach(function (zone) {
        if (zone.isVisible) {
            if (zone.name == selectedZone) {
                options += `<option value='${zone.name}' selected>${zone.name}</option>`;
            } else {
                options += `<option value='${zone.name}'>${zone.name}</option>`;
            }
        }
    })
    document.getElementById('pickzone').innerHTML = options;
    document.getElementById('setzone').disabled = false;
};

function submit() {
    let zone = document.getElementById('pickzone').value;
    tableau.extensions.settings.set('zone', zone);

    let triggerType = document.getElementById('trigger-type').value;
    tableau.extensions.settings.set('triggerType', triggerType);

    if (triggerType == 'trigger-parameter') {
        let param = document.getElementById('pickparam').value;
        let showhidevalue = document.getElementById('showhideoption').value;
        let paramValue = document.getElementById('paramvalue').value;
        tableau.extensions.settings.set('parameter', param);
        tableau.extensions.settings.set('showhidevalue', showhidevalue);
        tableau.extensions.settings.set('paramvalue', paramValue);
    } else {
        let selectedWorksheet = document.getElementById('select-worksheet').value;
        tableau.extensions.settings.set('selectedWorksheet', selectedWorksheet);
    }

    tableau.extensions.settings.set('configured', 'true');

    tableau.extensions.settings.saveAsync().then(result => {
        tableau.extensions.ui.closeDialog("10");
    });
}

