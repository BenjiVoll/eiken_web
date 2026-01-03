"use strict";
import fs from "fs";
import path from "path";

export const serveQuoteImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path.join(process.cwd(), "uploads", filename);

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: "Imagen no encontrada" });
        }

        const ext = path.extname(filename).toLowerCase();
        const contentType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.sendFile(imagePath);
    } catch (error) {
        console.error("Error serving quote image:", error);
        res.status(500).json({ message: "Error al servir imagen" });
    }
};

export const servePublicImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path.join(process.cwd(), "uploads", filename);

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: "Imagen no encontrada" });
        }

        const ext = path.extname(filename).toLowerCase();
        const contentType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.sendFile(imagePath);
    } catch (error) {
        console.error("Error serving public image:", error);
        res.status(500).json({ message: "Error al servir imagen" });
    }
};
