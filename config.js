$(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
        console.log(tableau.extensions.settings.getAll());
        getParams();
        getDashboardObjects();
    });
});

function getParams() {
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
        let options = '';
        let c = 0;
        for (let p of params) {
            if (p.dataType != 'date') {
                options += `<option value='${p.name}'>${p.name}</option>`;
                c++
            }
        }
        if (c > 0) {
            document.getElementById('pickparam').innerHTML = options;
            document.getElementById('setparam').disabled = false;
        } else {
            document.getElementById('pickparam').innerHTML = "<option value='' disabled>No parameters found</option>";
        }
    });
}

function getDashboardObjects() {
    let options = '';
    tableau.extensions.dashboardContent.dashboard.objects.forEach(function (zone) {
        if (zone.isfloating) {
            options += `<option value='${zone.name}'>${zone.name}</option>`;
        }
    })
    document.getElementById('pickzone').innerHTML = options;
    document.getElementById('setzone').disabled = false;
};

function submit() {
    let param = document.getElementById('pickparam').value;
    let paramValue = document.getElementById('paramvalue').value;
    let zone= document.getElementById('pickzone').value;
    tableau.extensions.settings.set('configured', 'true');
    tableau.extensions.settings.set('parameter', param);
    tableau.extensions.settings.set('zone', zone);
    tableau.extensions.settings.set('paramvalue', paramValue);
    tableau.extensions.settings.saveAsync().then(result => {
        tableau.extensions.ui.closeDialog(param);
    });
}

