require('dotenv').config();
const { Product, Sale } = require("../models");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const moment = require("moment");

module.exports.addDataToGoogleSheets = async (sheetId, SheetName) => {
    try {
        let rows = []
        let date = new Date().toLocaleDateString()
        // date = moment(date, "YYYY-MM-DD").toISOString()
        // date = date.slice(0, date.length - 1)
        let list = SheetName === "Products" ? await Product.aggregate([
            { $sort: { updatedAt: -1 } },
        ]) : await Sale.aggregate([
            { $match: { createdAt: { $gte: new Date(date) } } },
            { $sort: { updatedAt: -1 } },
        ])
        let titleKeys = SheetName === "Products" ? ["Id", "BarcodeId", "ProductName", "Description", "Brand",
            "MRP", "Price", "Stock", "TaxPercent", "SalesCount"] :
            ["Id", "OrderNo", "ItemCount", "MRPTotal", "SubTotal", "TotalAmount"]

        const getsheet = await getSpreadsheet(sheetId, SheetName);
        const subSheet = await getsubWorkSheet(getsheet, SheetName, titleKeys);
        if (SheetName === 'Products') {
            for (const element of list) {
                rows.push(JSON.stringify({
                    "Id": element._id,
                    "BarcodeId": element.barcodeId,
                    "ProductName": element.productName,
                    "Description": element.description,
                    "Brand": element.brand,
                    "MRP": element.mrp,
                    "Price": element.price,
                    "Stock": element.quantity,
                    "TaxPercent": element.taxPercent,
                    "SalesCount": element.salesCount,
                }))
            }
        }
        else {
            for (const element of list) {
                rows.push(JSON.stringify({
                    "Id": element._id,
                    "OrderNo": element.orderNo,
                    "ItemCount": element.itemCount,
                    "MRPTotal": element.MRPTotal,
                    "SubTotal": element.subTotal,
                    "TotalAmount": element.totalAmount,
                }))
            }
        }
        await clearWorksheetRows(subSheet)
        await writeWorksheetRows(subSheet, rows.map((x) => JSON.parse(x)));
    } catch (error) {
        console.log("error in addDataToGoogleSheets", error);
    }
}

const getSpreadsheet = async (spreadsheetId, sheetName) => {
    const spreadsheet = new GoogleSpreadsheet(spreadsheetId);
    await spreadsheet.useServiceAccountAuth({
        client_email: sheetName === "Products" ? process.env.GOOGLE_PRODUCT_CLIENT_EMAIL : process.env.GOOGLE_SALE_CLIENT_EMAIL,
        private_key: sheetName === "Products" ? process.env.GOOGLE_PRODUCT_PRIVATE_KEY : process.env.GOOGLE_SALE_PRIVATE_KEY
    });
    await spreadsheet.loadInfo();
    return spreadsheet;
};

const getsubWorkSheet = async (spreadsheet, worksheetTitle, headerValues) => {
    let worksheet = spreadsheet.sheetsByTitle[worksheetTitle];
    if (!worksheet) {
        worksheet = await spreadsheet.addWorksheet({
            title: worksheetTitle,
            headerValues
        });
    }
    return worksheet;
}

const clearWorksheetRows = async (worksheet) => {
    await worksheet.clearRows();
};


const writeWorksheetRows = async (worksheet, rows) => {
    await worksheet.addRows(rows);
};