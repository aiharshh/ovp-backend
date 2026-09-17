const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
            catch((err) => next(err))
    }
}


export {asyncHandler}

 
// The above one is the implemenation via the promises in JavaScript


// This is implementation via of try-catch

// Higher Order function -> Which can accept parameters in function

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.Status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }

