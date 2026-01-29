const mongoose = require('mongoose');

const validateId = (paramNames) => {
    return (req, res, next) => {
        const params = Array.isArray(paramNames) ? paramNames : [paramNames];
        
        for (const param of params) {
            const id = req.params[param];
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    msg: `${param} parameter is required`
                });
            }
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    msg: `Invalid ${param} format`
                });
            }
        }
        
        next();
    };
};

module.exports = validateId;