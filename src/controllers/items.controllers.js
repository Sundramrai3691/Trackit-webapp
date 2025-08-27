import { asyncHandler } from "../utils/asynchandler.js";
import { Item } from "../models/Items.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
// BoltPatch: Add notification utility
import { emitNotification } from "../utils/notify.js";

const lostItems = asyncHandler(async (req, res) => {
  const user = req?.user;

  const lostItems = await Item.aggregate([
    { $match: { type: "Lost" } },
    {
      $lookup: {
        from: "users",
        localField: "reportedBy",
        foreignField: "_id",
        as: "reporter",
      },
    },
    { $unwind: "$reporter" },
    {
      $addFields: {
        reportedByAccountName: "$reporter.name",
      },
    },
    {
      $project: {
        email: 0,
        claimedBy: 0,
        reporter: 0, // remove the extra joined object
      },
    },
    { $sort: {   dateFound: -1 } }
  ]);

  if (lostItems.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No lost items found"));
  }
    
  return res
    .status(200)
    .json(new ApiResponse(200, lostItems, "Lost items fetched successfully"));
});

const foundItems = asyncHandler(async (req, res) => {
  const user = req?.user;

  const foundItems = await Item.aggregate([
    { $match: { type: "Found" } },
    {
      $lookup: {
        from: "users",
        localField: "reportedBy",
        foreignField: "_id",
        as: "reporter",
      },
    },
    { $unwind: "$reporter" },
    {
      $addFields: {
        reportedByAccountName: "$reporter.name",
      },
    },
    {
      $project: {
        email: 0,
        claimedBy: 0,
        reporter: 0, // remove the extra joined object
      },
    },
    { $sort: {   dateFound: -1 } }
  ]);

  if (foundItems.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No found items in database"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, foundItems, "Found items fetched successfully"));
});

const lostItemCategory = asyncHandler(async (req, res) => {
  const itemCategory = req?.params?.category?.toLowerCase();
//    console.log(itemCategory);
  const user = req?.user;

  const lostItems = await Item.aggregate([
    { $match: { type: "Lost", category: itemCategory   } },
    {
      $lookup: {
        from: "users",
        localField: "reportedBy",
        foreignField: "_id",
        as: "reporter",
      },
    },
    { $unwind: "$reporter" },
    {
      $addFields: {
        reportedByAccountName: "$reporter.name",
      },
    },
    {
      $project: {
        email: 0,
        claimedBy: 0,
        reportedBy : 0,
        reporter: 0, // remove the extra joined object
      },
    },
    { $sort: {   dateFound: -1 } }
  ]);

  if (lostItems.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No lost items found for this category"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, lostItems, "Lost items fetched successfully"));
});

const foundItemCategory = asyncHandler(async (req, res) => {
      const itemCategory = req?.params?.category?.toLowerCase();
      console.log(itemCategory);
  const user = req?.user;

  const foundItems = await Item.aggregate([
    { $match: { type: "Found", category: itemCategory   } },
    {
      $lookup: {
        from: "users",
        localField: "reportedBy",
        foreignField: "_id",
        as: "reporter",
      },
    },
    { $unwind: "$reporter" },
    {
      $addFields: {
        reportedByAccountName: "$reporter.name",
      },
    },
    {
      $project: {
        email: 0,
        claimedBy: 0,
        reportedBy: 0,
        reporter: 0, // remove the extra joined object
      },
    },
    { $sort: {   dateFound: -1 } }
  ]);

  if (foundItems.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No items found for this category"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, foundItems, " found items fetched successfully"));
});

export { lostItems, foundItems, foundItemCategory, lostItemCategory };
