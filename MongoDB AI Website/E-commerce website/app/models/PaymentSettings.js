import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      default: "Meezan Bank",
      trim: true,
    },
    accountTitle: {
      type: String,
      default: "StoreZen E-Commerce",
      trim: true,
    },
    accountNumber: {
      type: String,
      default: "01020304050607",
      trim: true,
    },
    iban: {
      type: String,
      default: "PK00MEZN0001020304050607",
      trim: true,
    },
    raastId: {
      type: String,
      default: "03233937672",
      trim: true,
    },
    qrCodeUrl: {
      type: String,
      default: "",
      trim: true,
    },
    instructions: {
      type: String,
      default:
        "Please transfer the exact bill amount to our Bank Account or Raast ID using any banking app (SadaPay, NayaPay, Meezan, HBL, EasyPaisa, etc.). Upload the payment screenshot and Transaction ID (TID) below.",
    },
    isBankTransferEnabled: {
      type: Boolean,
      default: true,
    },
    isCodEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.PaymentSettings) {
  delete mongoose.models.PaymentSettings;
}

export default mongoose.model("PaymentSettings", paymentSettingsSchema);

