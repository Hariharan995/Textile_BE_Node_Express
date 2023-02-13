require('dotenv').config();
const { Product, Sale } = require("../models");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const moment = require("moment");
const path = require('path');
const fs = require('fs');

module.exports.addDataToGoogleSheets = async (sheetId, SheetName) => {
    try {
        let rows = []
        let date = new Date().toLocaleDateString()
        let nextDate = new Date()
        nextDate = nextDate.setDate(nextDate.getDate - 1)
        nextDate = new Date(nextDate).toLocaleDateString()
        let list = SheetName === "Products" ? await Product.aggregate([
            { $sort: { updatedAt: -1 } },
        ]) : await Sale.aggregate([
            { $match: { createdAt: { $and: [{ $gte: new Date(date) }, { $gte: new Date(nextDate) }] } } },
            { $sort: { createdAt: -1 } },
            {
                $addFields: {
                    sellerObjId: { $toObjectId: "$sellerId" },
                    buyerObjId: { $toObjectId: "$buyerId" },
                }
            },
            {
                $lookup: {
                    from: 'User', localField: 'sellerObjId', foreignField: '_id',
                    pipeline: [{ $project: { _id: 1, name: 1, mobile: 1 } }],
                    as: 'sellerDetails'
                },
            },
            { $unwind: { path: "$sellerDetails", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'Buyer', localField: 'buyerObjId', foreignField: '_id',
                    pipeline: [{ $project: { _id: 1, name: 1, mobile: 1 } }],
                    as: 'buyerDetails'
                },
            },
            { $unwind: { path: "$buyerDetails", preserveNullAndEmptyArrays: true } },
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
                    "Seller Name": element?.sellerDetails?.name,
                    "Buyer Name": element?.buyerDetails?.name,
                    "Payment Type": element.paymentType,
                    "Credit Point Amount": element.creditAmount,
                    "Discount Amount": element.discountAmount,
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

exports.getFile = async (productImage, res) => {
    const credPaths = path.join(__dirname, '../productImages/' + productImage);
    var imageAsBase64 = fs.readFileSync(credPaths);

    return imageAsBase64.toString('base64')
}
