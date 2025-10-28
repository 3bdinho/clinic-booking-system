const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const { sendResponse } = require("../utils/sendResponse");
const ApiFeatures = require("../utils/apiFeatures");
// @desc create Doc
exports.createOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const newDoc = await model.create(req.body);

    sendResponse(res, newDoc, 201, `${model.modelName} created successfully`);
  });

// @desc Get specific Doc
exports.getOne = (model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    //Setup search filter
    let filterObj = req.filterObject || {};

    // get id from params
    const { id } = req.params;

    // 1-Build query
    let query = model.findOne({ _id: id, ...filterObj });

    if (populateOptions) query = query.populate(populateOptions);

    // 2-Excecute query
    const doc = await query;

    if (!doc) {
      return next(new ApiError(`No ${model.modelName} with that id.`));
    }

    sendResponse(res, doc);
  });

// @desc Get list of Docs
exports.getAll = (model) =>
  asyncHandler(async (req, res, next) => {
    let filterObj = {};
    if (req.filterObject) {
      filterObj = req.filterObject;
    }

    // 1-Build query
    const countDocuments = model.countDocuments();
    const apiFeatures = new ApiFeatures(model.find(filterObj), req.query)
      .sort()
      .select()
      .filter()
      .search()
      .pagination(countDocuments);

    let query = apiFeatures.mongooseQuery;

    // 2-Excecute query
    const docs = await query;

    sendResponse(res, docs);
  });

// @desc update specific Doc
exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const updatedDoc = await model.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedDoc)
      return next(new ApiError(`No ${model.modelName} with that id.`, 404));

    if (
      req.user.role !== "admin" &&
      deletedDoc.user &&
      !deletedDoc.user.equals(req.user._id)
    ) {
      return next(
        new ApiError("You are not authorized to update this document", 403)
      );
    }

    sendResponse(
      res,
      updatedDoc,
      200,
      `${model.modelName} updated successfully.`
    );
  });

// @desc delete specific model
exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const deletedDoc = await model.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!deletedDoc)
      return next(new ApiError(`No ${model.modelName} with that id.`, 404));

    if (
      req.user.role !== "admin" &&
      deletedDoc.user &&
      !deletedDoc.user.equals(req.user._id)
    ) {
      return next(
        new ApiError("You are not authorized to delete this document", 403)
      );
    }

    sendResponse(res, deletedDoc, 204, "Doctor category deleted successfully");
  });
