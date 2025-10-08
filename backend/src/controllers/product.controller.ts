import { Request, Response } from "express";
import Product from "../models/product.schema";
import { Types } from "mongoose";

export async function createProduct(req: Request, res: Response) {
  const u = req.user;
  if (!u) return res.status(401).json({ message: "unauthorized" });
  if (u.role !== "farmer") return res.status(403).json({ message: "farmer only" });

  const { name, price, quantity, category, available } = req.body;

  if (!name || price === undefined || quantity === undefined || !category) {
    return res.status(400).json({ message: "name, price, quantity, category required" });
  }

  const farmerId = (u as any)._id || u.id; // handle both token shapes
  const doc = await Product.create({
    farmer: farmerId,
    name,
    price,
    quantity,
    category,
    available: available ?? true
  });

  return res.status(201).json(doc);
}

export async function listProducts(req: Request, res: Response) {
  const { category, minPrice, maxPrice, farmer, available, q, page = "1", limit = "12", sort } = req.query as Record<string, string>;

  const filter: any = {};
  if (category) filter.category = category;
  if (farmer) filter.farmer = farmer;
  if (available === "true" || available === "false") filter.available = available === "true";

  const minP = minPrice ? Number(minPrice) : undefined;
  const maxP = maxPrice ? Number(maxPrice) : undefined;
  if (minP !== undefined || maxP !== undefined) {
    filter.price = {};
    if (minP !== undefined) filter.price.$gte = minP;
    if (maxP !== undefined) filter.price.$lte = maxP;
  }

  if (q) filter.$text = { $search: q };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const sortMap: Record<string, any> = {
    price: { price: 1 },
    "-price": { price: -1 },
    createdAt: { createdAt: 1 },
    "-createdAt": { createdAt: -1 }
  };
  const sortBy = sortMap[sort || "-createdAt"] || { createdAt: -1 };

  const [data, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip(skip).limit(limitNum),
    Product.countDocuments(filter)
  ]);

  res.json({ data, page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) });
}

export async function getProduct(req: Request, res: Response) {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "bad id" });
  const prod = await Product.findById(id);
  if (!prod) return res.status(404).json({ message: "not found" });
  res.json(prod);
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "bad id" });
  const prod = await Product.findById(id);
  if (!prod) return res.status(404).json({ message: "not found" });

  const u = req.user;
  if (!u) return res.status(401).json({ message: "unauthorized" });

  const isOwner = String(prod.farmer) === String((u as any)._id || u.id);
  const isAdmin = u.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ message: "not your product" });

  const { name, price, quantity, category, available } = req.body;
  if (name !== undefined) prod.name = name;
  if (price !== undefined) prod.price = price;
  if (quantity !== undefined) prod.quantity = quantity;
  if (category !== undefined) prod.category = category;
  if (available !== undefined) prod.available = available;

  await prod.save();
  res.json(prod);
}

export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "bad id" });
  const prod = await Product.findById(id);
  if (!prod) return res.status(404).json({ message: "not found" });

  const u = req.user;
  if (!u) return res.status(401).json({ message: "unauthorized" });

  const isOwner = String(prod.farmer) === String((u as any)._id || u.id);
  const isAdmin = u.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ message: "not your product" });

  await prod.deleteOne();
  res.status(204).send();
}
