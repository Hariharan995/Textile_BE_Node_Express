const { addDataToGoogleSheets } = require("./constant_function");


exports.updateProductsReport = async () => {
    try {
        const sheetId = ""
        await addDataToGoogleSheets(sheetId, "Products")
    }
    catch (error) {
        console.log("Error", error)
    }
};

exports.updateSalesReport = async () => {
    try {
        const sheetId = ""
        const date = new Date();
        let yesterDay = new Date();
        yesterDay = yesterDay.setDate(yesterDay.getDate() - 1);
        const SheetName = date.toLocaleDateString();
        const YesterDateSheetName = yesterDay.toLocaleDateString();
        await addDataToGoogleSheets(sheetId, SheetName)
        await addDataToGoogleSheets(sheetId, YesterDateSheetName)
    }
    catch (error) {
        console.log("Error", error)
    }
};