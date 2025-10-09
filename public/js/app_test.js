

const buildButton = () => {
    const profileDiv = document.querySelector('#profile-lineworks');
    if (!profileDiv) return;
    if (document.querySelector('#new-button')) {
        return;
    }
    const newDiv = document.createElement('div');
    newDiv.id = 'new-button';
    const newButton = document.createElement('button');
    newButton.classList.add('my-button');
    const spanLabel = document.createElement('span');
    spanLabel.classList.add('label');
    spanLabel.textContent = 'click';
    newButton.appendChild(spanLabel);
    newButton.addEventListener('click', () => {
        alert('Nút đã được bấm!');
    });
    newDiv.appendChild(newButton);
    profileDiv.insertAdjacentElement('afterend', newDiv);
};
window.lintone.onPage((page) => {
    if (page !== 'list') {
        buildButton();
    }
});

let page = lintone.page();
if (page !== 'list') buildButton();

// afterCreateRecord function to handle record creation
lintone.afterCreateRecord = async (data) => {
    console.log('afterCreateRecord', data);
    if (data.type == 'create' && data.response.id) {

        let query = `product_name = "${lintone.getValueById('Lookup')}"`;
        let data = await lintone.getDataKintone(1337, query);
        if (data.status == 200 && data.data.records.length > 0) {
            let record = data.data.records[0];
            var body = {
                'app': 1337,
                'id': record.$id.value,
                'record': {
                    'product_name': {
                        'value': lintone.getValueById('Lookup')
                    },
                    'Products_exported': {
                        'value': Number(record.Products_exported.value) + Number(lintone.getValueById('Products_exported'))
                    },
                    'imported_products': {
                        'value': Number(record.imported_products.value) + Number(lintone.getValueById('imported_products_0'))
                    },
                    'total_product': {
                        'value': Number(record.total_product.value) - Number(lintone.getValueById('Products_exported')) + Number(lintone.getValueById('imported_products_0'))
                    },
                }
            };
            let update = await lintone.updateKintoneRecord(body);
            console.log('Update record response:', update);
            if (!update.code) {
                let userName = lintone.getValueById('importer');
                let query = `name = "${userName}"`;
                let dataKintoneApp1356 = await lintone.getDataKintone(1356, query);
                if (dataKintoneApp1356.status == 200 && dataKintoneApp1356.data.records.length > 0) {
                    let record1356 = dataKintoneApp1356.data.records[0];
                    var bodyUpdate = {
                        'app': 1356,
                        'id': record1356.$id.value,
                        'record': {
                            'inport_number': {
                                'value': Number(record1356.inport_number.value) + Number(lintone.getValueById('imported_products_0'))
                            },
                            'inport_number_0': {
                                'value': Number(record1356.inport_number_0.value) + Number(lintone.getValueById('Products_exported'))
                            },
                        }
                    };
                    let update1356 = await lintone.updateKintoneRecord(bodyUpdate);
                    console.log('Update record 1356 response:', update1356);
                    lintone.sendMessage("update thành công");
                }
                else {
                    let body = {
                        'app': 1356,
                        'record': {
                            'name': {
                                'value': lintone.getValueById('importer')
                            },
                            'inport_number': {
                                'value': Number(lintone.getValueById('imported_products_0'))
                            },
                            'inport_number_0': {
                                'value': Number(lintone.getValueById('Products_exported'))
                            },
                        }
                    };
                    let create = await lintone.createKintoneRecord(body)
                    console.log('tạo mới thành công', create);
                }
            }
            else {
                lintone.sendMessage("update failed", "error");
            }
            // if(update)
        }
    }
    return true; // Prevent default behavior
}
// afterUpdateRecord function to handle record updates
lintone.afterUpdateRecord = async (data) => {
    console.log('afterUpdateRecord', data);
    if (data.type == 'update' && data.response.revision) {

    }
    return true; // Prevent default behavior
};
lintone.afterDeleteRecord = async (data) => {
    if (data.type == 'delete' && data.response.success) {
        let record = data.record
        let query = `product_name = "${record.Lookup.value}"`;
        let data1337 = await lintone.getDataKintone(1337, query);
        if (data1337.status == 200 && data1337.data.records.length > 0) {
            let recordApp1337 = data1337.data.records[0];
            var body = {
                'app': 1337,
                'id': recordApp1337.$id.value,
                'record': {
                    'product_name': {
                        'value': record.Lookup.value
                    },
                    'Products_exported': {
                        'value': Number(recordApp1337.Products_exported.value) - Number(record.Products_exported.value)
                    },
                    'imported_products': {
                        'value': Number(recordApp1337.imported_products.value) + Number(record.imported_products_0.value)
                    },
                    'total_product': {
                        'value': Number(recordApp1337.total_product.value) - Number(record.Products_exported.value) - Number(record.imported_products_0.value)
                    },
                }
            };
            let update = await lintone.updateKintoneRecord(body);
            console.log('Update record response:', update);
            if (!update.code) {
                let userName =  record.importer.value;
                let query = `name = "${userName}"`;
                let dataKintoneApp1356 = await lintone.getDataKintone(1356, query);
                if (dataKintoneApp1356.status == 200 && dataKintoneApp1356.data.records.length > 0) {
                    let record1356 = dataKintoneApp1356.data.records[0];
                    var bodyUpdate = {
                        'app': 1356,
                        'id': record1356.$id.value,
                        'record': {
                            'inport_number': {
                                'value': Number(record1356.inport_number.value) + Number(record.imported_products_0.value)
                            },
                            'inport_number_0': {
                                'value': Number(record1356.inport_number_0.value) + Number(record.Products_exported.value)
                            },
                        }
                    };
                    let update1356 = await lintone.updateKintoneRecord(bodyUpdate);
                    console.log('Update record 1356 response:', update1356);
                    lintone.sendMessage("update thành công");
                }
                else {
                    let body = {
                        'app': 1356,
                        'record': {
                            'name': {
                                'value':  record.importer.value
                            },
                            'inport_number': {
                                'value': Number(record.imported_products_0.value)
                            },
                            'inport_number_0': {
                                'value': Number(record.Products_exported.value)
                            },
                        }
                    };
                    let create = await lintone.createKintoneRecord(body)
                    console.log('tạo mới thành công', create);
                }
            }
        }
        else {
            lintone.sendMessage("update failed", "error");

        }
    }
    return true; // Prevent default behavior
} 
