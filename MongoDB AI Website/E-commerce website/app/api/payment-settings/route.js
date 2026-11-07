import connectDB from "@/app/lib/db";
import PaymentSettings from "@/app/models/PaymentSettings";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    let settings = await PaymentSettings.findOne().lean();

    if (!settings) {
      settings = await PaymentSettings.create({
        bankName: "Meezan Bank",
        accountTitle: "StoreZen E-Commerce",
        accountNumber: "01020304050607",
        iban: "PK00MEZN0001020304050607",
        raastId: "03233937672",
        qrCodeUrl: "",
        instructions:
          "Please transfer the exact bill amount to our Bank Account or Raast ID using any banking app (SadaPay, NayaPay, Meezan, HBL, EasyPaisa, etc.). Upload the payment screenshot and Transaction ID (TID) below.",
        isBankTransferEnabled: true,
        isCodEnabled: true,
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("PaymentSettings GET error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching payment settings", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      bankName,
      accountTitle,
      accountNumber,
      iban,
      raastId,
      qrCodeUrl,
      instructions,
      isBankTransferEnabled,
      isCodEnabled,
    } = body;

    let settings = await PaymentSettings.findOne();

    if (!settings) {
      settings = new PaymentSettings();
    }

    if (bankName !== undefined) settings.bankName = bankName.trim();
    if (accountTitle !== undefined) settings.accountTitle = accountTitle.trim();
    if (accountNumber !== undefined) settings.accountNumber = accountNumber.trim();
    if (iban !== undefined) settings.iban = iban.trim();
    if (raastId !== undefined) settings.raastId = raastId.trim();
    if (qrCodeUrl !== undefined) settings.qrCodeUrl = qrCodeUrl.trim();
    if (instructions !== undefined) settings.instructions = instructions.trim();
    if (isBankTransferEnabled !== undefined) settings.isBankTransferEnabled = Boolean(isBankTransferEnabled);
    if (isCodEnabled !== undefined) settings.isCodEnabled = Boolean(isCodEnabled);

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Payment settings saved successfully!",
      settings,
    });
  } catch (error) {
    console.error("PaymentSettings PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Error updating payment settings", error: error.message },
      { status: 500 }
    );
  }
}

