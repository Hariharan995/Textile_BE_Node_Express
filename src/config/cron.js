const { addDataToGoogleSheets } = require("./constant_function");


exports.updateProductsReport = async () => {
    try {
        const sheetId =""
        await addDataToGoogleSheets(sheetId, "Products")
    }
    catch (error) {
        console.log("Error", error)
    }
};

exports.updateSalesReport = async () => {
    try {
        const sheetId =""
        const date = new Date();
        const SheetName = date.toLocaleDateString();
        await addDataToGoogleSheets(sheetId, SheetName)
    }
    catch (error) {
        console.log("Error", error)
    }
};