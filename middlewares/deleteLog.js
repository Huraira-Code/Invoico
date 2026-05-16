const Item = require("../models/itemModel");
const Log = require("../models/logModel");

const logDeleteAction = async (req, res, next) => {
  try {
    const { itemId, adminId } = req.body; // or req.params if route uses params
    const { accountType, id: userId } = req.user; // auth middleware

    // Fetch the item before deletion
    const item = await Item.findOne({ _id: itemId, adminId });

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Save the item for logging later
    req.itemToDelete = item; 

    // Create log BEFORE deletion
    await Log.create({
      adminId: userId,
      accountType,
      itemId: item._id,
      categoryId: item.categoryId,
      quantityId: item.quantityId,
      actionType: "DELETE",
      description: `Item "${item.name}" will be deleted by ${accountType}`,
      oldValue: item.toObject(),
    });

    next(); // continue to the actual delete controller

  } catch (err) {
    console.error("Delete logging failed:", err);
    next(); // still proceed with deletion
  }
};

module.exports = logDeleteAction;