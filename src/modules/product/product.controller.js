import { productService } from "./product.service.js";

export const productController = {
  getAll: async (req, res) => {
    const items = await productService.getAll();
    if (items.length === 0) {
      res.status(400).json({
        success: true,
        message: "Chua co san pham nao!",
        data: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "Lay danh sach thanh cong!",
      data: items,
    });
  },

  createOne: async (req, res) => {
    // thieu validate

    console.log(req.body);
    const item = await productService.createOne(req.body);
    res.status(201).json({
      success: true,
      message: "Tao thanh cong!",
      data: item,
    });
  },
};
