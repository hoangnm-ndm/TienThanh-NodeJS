import { productService } from "./product.service.js";

export const productController = {
  getAll: async (req, res) => {
    const items = await productService.getAll();
    // * Danh sách rỗng không phải lỗi → 200, và return để không gửi response 2 lần.
    if (items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Chua co san pham nao!",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lay danh sach thanh cong!",
      data: items,
    });
  },

  createOne: async (req, res) => {
    const item = await productService.createOne(req.body);
    res.status(201).json({
      success: true,
      message: "Tao thanh cong!",
      data: item,
    });
  },
};
