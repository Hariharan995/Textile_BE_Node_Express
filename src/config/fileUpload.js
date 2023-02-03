require('dotenv').config();
const { CONSTANT_MSG } = require('../config/constant_messages');

module.exports.singleFileUpload = async (req, res, next) => {
    try {
        const file = req.file
        if (!file) {
            const err = new Error("No file")
            err.httpStausCode = 400
            return next(err)
        }
        res.send(file);
    } catch (error) {
        console.log('error', error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
}
