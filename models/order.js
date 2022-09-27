const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  items: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
});

/** Generate invoice for order. */
orderSchema.methods.generateInvoice = function () {
  const invoiceName = `invoice-${this._id}.pdf`;
  const invoicePath = path.join("private", "invoices", invoiceName);
  const pdfDoc = new PDFDocument();
  pdfDoc.pipe(fs.createWriteStream(invoicePath));

  pdfDoc.fontSize(26).text("Invoice", {
    underline: true,
  });
  pdfDoc.text("---------------------------");

  let totalPrice = 0;
  this.items.forEach((item) => {
    totalPrice = totalPrice + item.product.price * item.quantity;
    pdfDoc
      .fontSize(14)
      .text(
        `${item.product.title} - ${item.quantity} x $${item.product.price}`
      );
  });

  pdfDoc.text("---------------------------");
  pdfDoc.fontSize(18).text(`Order total price: $${totalPrice}`);

  pdfDoc.end();
};

module.exports = mongoose.model("Order", orderSchema);
